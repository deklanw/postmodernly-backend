import {
  Resolver,
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
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';

@InputType()
class UserPostLikeInput {
  @Field(() => Int)
  postId: number;

  @Field()
  like: boolean;
}

@Resolver()
export class LikePostResolver {
  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async likePost(
    @Ctx() ctx: MyContext,
    @Arg('data') { postId, like }: UserPostLikeInput
  ): Promise<Boolean> {
    const { userId } = ctx.session!;

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
}
