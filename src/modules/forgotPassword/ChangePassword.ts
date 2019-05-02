import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import bcrypt from 'bcryptjs';

import { redis } from '../../utils/RedisStore';
import { User } from '../../entities/User';
import { forgotPasswordPrefix } from '../../constants/redisPrefixes';
import { ChangePasswordInput } from './ChangePasswordInput';
import { MyContext } from '../../types/MyContext';

@Resolver()
export class ChangePasswordResolver {
  @Mutation(() => User, { nullable: true })
  async changePassword(
    @Arg('data')
    { token, password }: ChangePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<User | undefined> {
    const userId = await redis.get(forgotPasswordPrefix + token);

    if (!userId) {
      return undefined;
    }

    await redis.del(forgotPasswordPrefix + token);

    const user = await User.findOne(userId);

    if (!user) {
      return undefined;
    }

    user.password = await bcrypt.hash(password, 15);
    await user.save();

    ctx.session!.userId = user.id;

    return user;
  }
}
