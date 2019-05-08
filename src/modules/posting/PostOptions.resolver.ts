import { Resolver, UseMiddleware, Mutation, Ctx, Arg } from 'type-graphql';
import _ from 'lodash';

import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';
import { PostOptions } from '../../tql-only/PostOptions';
import { ReorderOptionsInput } from './ReorderOptionsInput';
import { PostOptionsService } from './PostOptions.service';

@Resolver()
export class PostOptionsResolver {
  constructor(private readonly postOptionsService: PostOptionsService) {}

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async reorderOptions(
    @Ctx() ctx: MyContext,
    @Arg('data') input: ReorderOptionsInput
  ): Promise<Boolean> {
    const { userId } = ctx.session!;

    return this.postOptionsService.reorderOptions(input, userId);
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => PostOptions)
  async getNewPostOptions(
    @Ctx() ctx: MyContext
  ): Promise<PostOptions | undefined> {
    const { userId } = ctx.session!;

    return this.postOptionsService.getNewPostOptions(userId);
  }
}
