import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class UserPostLike {
  @Field(() => User)
  @ManyToOne(() => User, user => user.postLikes, {
    onDelete: 'CASCADE'
  })
  user: User;
  @PrimaryColumn()
  userId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.userLikes, {
    onDelete: 'CASCADE'
  })
  post: Post;
  @PrimaryColumn()
  postId: number;
}
