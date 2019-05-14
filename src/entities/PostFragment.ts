import { Entity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { Field, ObjectType, Int } from 'type-graphql';
import { Fragment } from './Fragment';
import { Post } from './Post';

@ObjectType()
@Entity()
export class PostFragment {
  @Field(() => Int)
  @Column('int')
  order: number;

  @Field(() => Fragment)
  @ManyToOne(() => Fragment, frag => frag.postsWhichUse)
  fragment: Fragment;
  @PrimaryColumn()
  fragmentId: number;

  @Field(() => Post) // for finding posts which use a given fragment
  @ManyToOne(() => Post, post => post.usedFragments, {
    onDelete: 'CASCADE'
  })
  post: Post;
  @PrimaryColumn()
  postId: number;
}
