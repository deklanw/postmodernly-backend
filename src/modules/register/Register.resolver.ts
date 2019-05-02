import { Resolver, Mutation, Arg } from 'type-graphql';
import bcrypt from 'bcryptjs';

import { User } from '../../entities/User';
import { RegisterInput } from './RegisterInput';
import { sendEmail } from '../../utils/sendEmail';
import { createConfirmationURL } from '../../utils/createConfirmationURL';

@Resolver()
export class RegisterResolver {
  @Mutation(() => User)
  async register(@Arg('data')
  {
    email,
    password
  }: RegisterInput): Promise<User> {
    const hashedPass = await bcrypt.hash(password, 15);

    const user = await User.create({
      email,
      password: hashedPass
    }).save();
    await sendEmail(email, await createConfirmationURL(user.id));

    return user;
  }
}
