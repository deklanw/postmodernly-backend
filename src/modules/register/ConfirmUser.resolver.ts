import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import { MyContext } from '../../types/MyContext';
import { redis } from '../../utils/RedisStore';
import { User } from '../../entities/User';
import { confirmUserPrefix } from '../../constants/redisPrefixes';

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => Boolean)
  async confirmUser(
    @Arg('token') token: string,
    @Ctx() ctx: MyContext
  ): Promise<Boolean> {
    const userId = await redis.get(confirmUserPrefix + token);

    if (!userId) {
      return false;
    }

    await User.update({ id: parseInt(userId, 10) }, { confirmed: true });
    await redis.del(confirmUserPrefix + token);

    return true;
  }
}
