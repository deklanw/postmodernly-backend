import _ from 'lodash';
import { Service } from 'typedi';
import {
  Resolver,
  Mutation,
  Ctx,
  UseMiddleware,
  Arg,
  Int,
  Query,
  Subscription,
  Root,
  PubSub,
  PubSubEngine
} from 'type-graphql';

import { Post } from '../../entities/Post';
import { MyContext } from '../../types/MyContext';
import { IsAuth } from '../../middleware/IsAuth';
import { PostInput } from './PostInput';
import { NEW_POST } from '../../constants/subscription';
import { PostingService } from './Posting.service';

interface NewPostPayload {
  postId: number;
}

@Service()
@Resolver()
export class PostResolver {
  constructor(private readonly postingService: PostingService) {}

  @Subscription(() => Int, {
    topics: NEW_POST
  })
  newPost(@Root()
  {
    postId
  }: NewPostPayload): number {
    return postId;
  }

  @Query(() => [Post])
  async getPosts(): Promise<Post[]> {
    return this.postingService.getPosts();
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() ctx: MyContext,
    @Arg('postId', () => Int) postId: number
  ): Promise<Boolean> {
    const { userId } = ctx.session.userInfo!;
    return this.postingService.deletePost(postId, userId);
  }

  @Mutation(() => Int, { nullable: true })
  async makePost(
    @Ctx() ctx: MyContext,
    @Arg('data')
    input: PostInput,
    @PubSub() pubSub: PubSubEngine
  ): Promise<number | undefined> {
    let userId: number | undefined;
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      ({ userId } = ctx.session.userInfo!);
    }
    const { ipAddress } = ctx;
    const postId = await this.postingService.makePost(input, ipAddress, userId);

    await pubSub.publish(NEW_POST, { postId });

    return postId;
  }
}
