import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Book } from './Book';

@ObjectType()
@Entity({ synchronize: true })
export class Author extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text', { unique: true })
  name: string;

  @Field(() => [Book])
  @OneToMany(() => Book, book => book.author)
  books: Book[];
}
