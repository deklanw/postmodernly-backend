import { ObjectType, Field, Int } from 'type-graphql';
import { Post } from '../entities/Post';

@ObjectType()
export class PostsWithCursor {
  // only null in one rare case: there are no Posts and you make a call with cursor=null
  @Field({ nullable: true })
  cursor?: string;

  @Field(() => [Post])
  posts: Post[];
}
