import { ObjectType, Field, Int } from 'type-graphql';
import { PostOptions } from './PostOptions';

// If postOptions is null, then remainingTime isn't.
@ObjectType()
export class PostOptionsWithTime {
  @Field(() => PostOptions, { nullable: true })
  postOptions?: PostOptions;

  @Field(() => Int, { nullable: true })
  remainingTime?: number;
}
