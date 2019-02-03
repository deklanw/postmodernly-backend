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

@ObjectType()
@Entity()
export class Fragment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Book)
  @ManyToOne(() => Book, book => book.fragments, { nullable: false })
  book: Book;

  @Field()
  @Column('text')
  fragment: string;

  @Field(() => [PostFragment], { nullable: true })
  @OneToMany(() => PostFragment, pf => pf.fragment)
  postsWhichUse: PostFragment[];

  @Field()
  @Column('text')
  context: string;
}
