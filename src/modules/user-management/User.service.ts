import bcrypt from 'bcryptjs';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository, FindOneOptions } from 'typeorm';
import { v4 } from 'uuid';

import { redis } from '../../utils/RedisStore';
import { User } from '../../entities/User';
import {
  confirmUserPrefix,
  forgotPasswordPrefix
} from '../../constants/redisPrefixes';
import { createConfirmationToken } from '../../utils/createConfirmationToken';
import { sendEmail } from '../../utils/sendEmail';
import { ChangePasswordInput } from './ChangePasswordInput';
import { RegisterInput } from './RegisterInput';
import {
  forgotPasswordTemplate,
  confirmEmailTemplate as confirmUserTemplate
} from '../../utils/emailTemplates';

// make services out of redis and email sending?

@Service()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async register({
    email,
    password
  }: RegisterInput): Promise<{ user: User; token: string }> {
    const hashedPass = await bcrypt.hash(password, 15);

    const user = await this.userRepo.create({
      email,
      password: hashedPass
    });
    await this.userRepo.save(user);
    const token = await createConfirmationToken(user.id);

    return { user, token };
  }

  async sendConfirmationEmail(token: string, user: User) {
    await sendEmail(
      user.email,
      'Confirm your Postmodernly account',
      confirmUserTemplate(`${process.env.FRONTEND_URL}/confirm-user/${token}`)
    );

    return { user, token };
  }

  async resendConfirmationEmail(email: string) {
    const user = await this.userRepo.findOne({
      email
    });

    // if user doesn't exist or is already confirmed return false
    if (!user || user.confirmed) {
      return false;
    }

    await this.sendConfirmationEmail(email, user);
    return true;
  }

  async confirmUser(token: string): Promise<boolean> {
    const userId = await redis.get(confirmUserPrefix + token);

    if (!userId) {
      return false;
    }

    await this.userRepo.update(
      { id: parseInt(userId, 10) },
      { confirmed: true }
    );
    await redis.del(confirmUserPrefix + token);

    return true;
  }

  async login(email: string, password: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { email } });
    console.log('got user');

    if (!user) {
      return undefined;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return undefined;
    }

    if (!user.confirmed) {
      return undefined;
    }

    return user;
  }

  async changePassword({ token, password }: ChangePasswordInput) {
    const userId = await redis.get(forgotPasswordPrefix + token);

    if (!userId) {
      return undefined;
    }

    await redis.del(forgotPasswordPrefix + token);

    const user = await this.userRepo.findOne(userId);

    if (!user) {
      return undefined;
    }

    user.password = await bcrypt.hash(password, 15);
    await this.userRepo.save(user);

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return false;
    }

    const token = v4();
    await redis.set(forgotPasswordPrefix + token, user.id, 'ex', 60 * 60 * 24); // 1 day expiration

    await sendEmail(
      email,
      'Finish changing your Postmodernly password',
      forgotPasswordTemplate(
        `${process.env.FRONTEND_URL}/change-password/${token}`
      )
    );

    return true;
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ id });
    if (user) {
      await this.userRepo.remove(user);
      console.log('Deleted user');
      return true;
    }
    return false;
  }

  async findUserById(id: number) {
    return this.userRepo.findOne(id);
  }

  async findUser(options: FindOneOptions<User>) {
    return this.userRepo.findOne(options);
  }
}
