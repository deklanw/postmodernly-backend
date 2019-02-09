import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  Field,
  Int,
  InputType,
  UseMiddleware,
  Mutation,
  Ctx,
  Arg
} from 'type-graphql';

import { UserPostLike } from '../../entities/UserPostLike';
import { Post } from '../../entities/Post';
import { User } from '../../entities/User';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';

@InputType()
class UserPostLikeInput {
  @Field(() => Int)
  postId: number;

  @Field()
  like: boolean;
}

@Resolver(() => UserPostLike)
export class UserPostLikeResolver implements ResolverInterface<UserPostLike> {
  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async likePost(
    @Ctx() ctx: MyContext,
    @Arg('data') { postId, like }: UserPostLikeInput
  ): Promise<Boolean> {
    const { userId } = ctx.koaCtx.session!;

    const post = await Post.findOne({ id: postId });
    const { creatorId } = post!;

    if (creatorId === userId) {
      // can't like own post
      console.log('Cannot like own Post');
      return false;
    }

    if (like) {
      const upl = UserPostLike.create({ userId, postId });

      // like may already exist
      await UserPostLike.save(upl);
      console.log('Created Like');
    } else {
      await UserPostLike.delete({ userId, postId });
      console.log('Deleted Like');
    }
    return true;
  }

  @FieldResolver()
  async user(@Root() userPostLike: UserPostLike): Promise<User> {
    return (await User.findOne({ id: userPostLike.userId }))!;
  }

  @FieldResolver()
  async post(@Root() userPostLike: UserPostLike): Promise<Post> {
    return (await Post.findOne({ id: userPostLike.postId }))!;
  }
}
