import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Author } from './Author';
import { Fragment } from './Fragment';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity()
export class Book {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Field()
  @Column('int', { unique: true })
  gbId: number;

  @Column('text')
  @Field()
  title: string;

  @Field()
  @Column('text')
  language: string;

  @Field(() => Author)
  @ManyToOne(() => Author, author => author.books, { nullable: false })
  author: Author;
  @RelationColumn({ nullable: false })
  authorId: number;

  // 'all fragments for given book' not a planned feature
  @Field(() => [Fragment])
  @OneToMany(() => Fragment, fragment => fragment.book)
  fragments: Fragment[];
}
