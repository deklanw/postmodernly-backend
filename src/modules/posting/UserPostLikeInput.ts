import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class UserPostLikeInput {
  @Field(() => Int)
  postId: number;

  @Field()
  like: boolean;
}
