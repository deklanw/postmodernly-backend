import {
  Entity,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  JoinColumn
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class UserPostLike extends BaseEntity {
  @PrimaryColumn()
  postId: number;

  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.postLikes, { primary: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.userLikes, {
    primary: true
  })
  @JoinColumn({ name: 'postId' })
  post: Post;
}
