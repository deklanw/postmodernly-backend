import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Author } from './Author';
import { Fragment } from './Fragment';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity({ synchronize: true })
export class Book extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('int', { unique: true })
  gbId: number;

  @Field()
  @Column('text')
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
