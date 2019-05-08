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
    const { userId } = ctx.session!;
    return this.postingService.deletePost(postId, userId); // false if not owner of post?????????????
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Int, { nullable: true })
  async makePost(
    @Ctx() ctx: MyContext,
    @Arg('data')
    input: PostInput,
    @PubSub() pubSub: PubSubEngine
  ): Promise<number | undefined> {
    const { userId } = ctx.session!;
    const postId = await this.postingService.makePost(input, userId);

    await pubSub.publish(NEW_POST, { postId });

    return postId;
  }
}
