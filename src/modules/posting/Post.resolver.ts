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
import { PostsWithCursor } from '../../tql-only/PostsWithCursor';

interface NewPostPayload {
  post: Post;
}

@Service()
@Resolver()
export class PostResolver {
  constructor(private readonly postingService: PostingService) {}

  @Subscription(() => Post, {
    topics: NEW_POST
  })
  newPost(@Root()
  {
    post
  }: NewPostPayload): Post {
    return post;
  }

  @Query(() => PostsWithCursor)
  async getPostsWithCursor(
    @Ctx() ctx: MyContext,
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', { nullable: true }) cursor?: string
  ): Promise<PostsWithCursor> {
    return this.postingService.getPostsWithCursor(limit, cursor);
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
    const newPost = await this.postingService.getFullPostById(postId!);

    await pubSub.publish(NEW_POST, { post: newPost });

    return postId;
  }
}
