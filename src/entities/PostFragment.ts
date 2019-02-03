import {
  Entity,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  Column
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { Fragment } from './Fragment';

@ObjectType()
@Entity()
export class PostFragment extends BaseEntity {
  @PrimaryColumn()
  fragId: number;

  @PrimaryColumn()
  postId: number;

  @Field()
  @Column('int')
  order: number;

  @Field(() => Fragment)
  @ManyToOne(() => Fragment, frag => frag.postsWhichUse, { primary: true })
  @JoinColumn({ name: 'fragId' })
  fragment: Fragment;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.usedFragments, {
    primary: true
  })
  @JoinColumn({ name: 'postId' })
  post: Post;
}
