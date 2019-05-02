import { InputType, Field, Int } from 'type-graphql';

@InputType()
export class FragInput {
  @Field(() => Int)
  fragmentId: number;

  @Field(() => Int)
  order: number;
}
