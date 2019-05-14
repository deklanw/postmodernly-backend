import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Book } from './Book';
import { PostFragment } from './PostFragment';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity()
export class Fragment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  fragmentText: string;

  @Field()
  @Column('text')
  context: string;

  @Field(() => [PostFragment], { nullable: true })
  @OneToMany(() => PostFragment, pf => pf.fragment)
  postsWhichUse?: PostFragment[];

  @Field(() => Book)
  @ManyToOne(() => Book, book => book.fragments, { nullable: false })
  book: Book;
  @RelationColumn({ nullable: false })
  bookId: number;
}
