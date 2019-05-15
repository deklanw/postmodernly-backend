import { ObjectType, Field, Int } from 'type-graphql';
import { Post } from '../entities/Post';

@ObjectType()
export class PostsWithCursor {
  @Field()
  cursor: string;

  @Field(() => [Post])
  posts: Post[];
}
