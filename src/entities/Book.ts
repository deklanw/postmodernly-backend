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

@ObjectType()
@Entity()
export class Book extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('int', { unique: true })
  gbId: number;

  @Field(() => Author)
  @ManyToOne(() => Author, author => author.books, { nullable: false })
  author: Author;

  @Field(() => [Fragment])
  @OneToMany(() => Fragment, fragment => fragment.book)
  fragments: Fragment[];

  @Field()
  @Column('text')
  title: string;

  @Field()
  @Column('text')
  language: string;
}
