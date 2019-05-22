import _ from 'lodash';
import { Resolver, Mutation, Ctx, Arg } from 'type-graphql';
import { plainToClass } from 'class-transformer';

import { MyContext } from '../../types/MyContext';
import { PostOptions } from '../../tql-only/PostOptions';
import { ReorderOptionsInput } from './ReorderOptionsInput';
import { PostOptionsService } from './PostOptions.service';
import { PostOptionsWithTime } from '../../tql-only/PostOptionsWithTime';

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
      return this.postOptionsService.getCurrentUserOptions(userId);
    }
    return this.postOptionsService.getCurrentAnonOptions(ctx.ipAddress);
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

  @Mutation(() => PostOptionsWithTime)
  async getNewPostOptions(@Ctx() ctx: MyContext): Promise<PostOptionsWithTime> {
    let userId: number | undefined;
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      ({ userId } = ctx.session.userInfo!);
    }
    const { ipAddress } = ctx;

    return this.postOptionsService.limitedGetNewPostOptions(ipAddress, userId);
  }

  @Mutation(() => PostOptionsWithTime)
  async getPostOptions(@Ctx() ctx: MyContext): Promise<PostOptionsWithTime> {
    let userId: number | undefined;
    if (ctx.session.userInfo && ctx.session.userInfo.userId) {
      ({ userId } = ctx.session.userInfo!);
    }
    const { ipAddress } = ctx;

    return this.postOptionsService.limitedGetCurrentOrNewPostOptions(
      ipAddress,
      userId
    );
  }
}
