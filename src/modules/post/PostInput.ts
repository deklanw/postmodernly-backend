import { InputType, Field, Int } from 'type-graphql';

@InputType()
class FragInput {
  @Field(() => Int)
  fragmentId: number;

  @Field(() => Int)
  order: number;
}

@InputType()
export class PostInput {
  @Field(() => [FragInput])
  fragments: FragInput[];

  @Field(() => Int)
  book1Id: number;

  @Field(() => Int)
  book2Id: number;

  @Field(() => Int)
  author1Id: number;

  @Field(() => Int)
  author2Id: number;
}
