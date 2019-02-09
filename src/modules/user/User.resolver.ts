import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  UseMiddleware,
  Mutation,
  Ctx
} from 'type-graphql';

import { Post } from '../../entities/Post';
import { User } from '../../entities/User';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { UserPostLike } from '../../entities/UserPostLike';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';

@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async deleteUser(@Ctx() ctx: MyContext): Promise<Boolean> {
    const { userId } = ctx.koaCtx.session!;
    await User.delete({ id: userId });
    console.log('Deleted user');
    return true;
  }

  @FieldResolver()
  async posts(@Root() user: User): Promise<Post[]> {
    return (await Post.find({ creatorId: user.id }))!;
  }

  @FieldResolver()
  async postLikes(@Root() user: User): Promise<UserPostLike[]> {
    return (await UserPostLike.find({ userId: user.id }))!;
  }

  @FieldResolver()
  async fragmentOptions(@Root() user: User): Promise<FragmentOptionUser[]> {
    return (await FragmentOptionUser.find({ userId: user.id }))!;
  }
}
