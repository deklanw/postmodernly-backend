import { ObjectType, Field, Int } from 'type-graphql';
import { PostOptions } from './PostOptions';

@ObjectType()
export class RemainingLimit {
  @Field(() => Int)
  remainingRefreshes: number;

  @Field(() => Int)
  remainingSeconds: number;
}

@ObjectType()
export class PostOptionsWithTime {
  @Field(() => PostOptions, { nullable: true })
  postOptions?: PostOptions;

  // this is null when the user already has options, and they have no redis key (no current limit info)
  @Field(() => RemainingLimit, { nullable: true })
  remaining?: RemainingLimit;
}
