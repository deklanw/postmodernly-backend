import { Resolver, UseMiddleware, Mutation, Ctx, Arg } from 'type-graphql';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';
import { UserPostLikeInput } from './UserPostLikeInput';
import { UserPostLikeService } from './LikePost.service';

@Resolver()
export class LikePostResolver {
  constructor(private readonly userPostLikeService: UserPostLikeService) {}

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async likePost(
    @Ctx() ctx: MyContext,
    @Arg('data') input: UserPostLikeInput
  ): Promise<boolean> {
    const { userId } = ctx.session.userInfo!;

    return this.userPostLikeService.likePost(input, userId);
  }
}
