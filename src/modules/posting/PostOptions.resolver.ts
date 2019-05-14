import { Resolver, UseMiddleware, Mutation, Ctx, Arg } from 'type-graphql';
import _ from 'lodash';

import { MyContext } from '../../types/MyContext';
import { PostOptions } from '../../tql-only/PostOptions';
import { ReorderOptionsInput } from './ReorderOptionsInput';
import { PostOptionsService } from './PostOptions.service';
import { rateLimit } from '../../middleware/RateLimit';

@Resolver()
export class PostOptionsResolver {
  constructor(private readonly postOptionsService: PostOptionsService) {}

  @Mutation(() => PostOptions)
  async getOptions(@Ctx() ctx: MyContext) {
    let userId: number | undefined;
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      ({ userId } = ctx.session.userInfo!);
    }

    if (userId) {
      return this.postOptionsService.getUserOptions(userId);
    }
    return this.postOptionsService.getAnonOptions(ctx.ipAddress);
  }

  @Mutation(() => Boolean)
  async reorderOptions(
    @Ctx() ctx: MyContext,
    @Arg('data') input: ReorderOptionsInput
  ): Promise<Boolean> {
    let userId: number | undefined;
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      ({ userId } = ctx.session.userInfo!);
    }
    const { ipAddress } = ctx;

    return this.postOptionsService.reorderOptions(input, ipAddress, userId);
  }

  @UseMiddleware(
    rateLimit({
      limitForAnon: { period: 5 * 60, requests: 20 },
      limitForUser: { period: 2 * 60, requests: 20 }
    })
  )
  @Mutation(() => PostOptions)
  async getNewPostOptions(@Ctx() ctx: MyContext): Promise<PostOptions> {
    let userId: number | undefined;
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      ({ userId } = ctx.session.userInfo!);
    }
    const { ipAddress } = ctx;

    return this.postOptionsService.getNewPostOptions(ipAddress, userId);
  }
}
