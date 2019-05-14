import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Book } from './Book';

@ObjectType()
@Entity()
export class Author {
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
