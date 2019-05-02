import { Resolver, UseMiddleware, Mutation, Ctx } from 'type-graphql';

import { User } from '../../entities/User';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';

@Resolver()
export class UserResolver {
  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async deleteUser(@Ctx() ctx: MyContext): Promise<Boolean> {
    const { userId } = ctx.koaCtx.session!;
    await User.delete({ id: userId });
    console.log('Deleted user');
    return true;
  }
}
