import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Book } from './Book';
import { PostFragment } from './PostFragment';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity({ synchronize: true })
export class Fragment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  fragment: string;

  @Field()
  @Column('text')
  context: string;

  @Field(() => [PostFragment], { nullable: true })
  @OneToMany(() => PostFragment, pf => pf.fragment)
  postsWhichUse: PostFragment[];

  @Field(() => Book)
  @ManyToOne(() => Book, book => book.fragments, { nullable: false })
  book: Book;
  @RelationColumn({ nullable: false })
  bookId: number;
}
