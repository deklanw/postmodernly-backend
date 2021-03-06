import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  ManyToOne
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Author } from './Author';
import { Post } from './Post';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity()
@Index(['author1Id', 'author2Id'], { unique: true })
export class Portman {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  name: string;

  @Field(() => [Post]) // could be empty, but not null
  @OneToMany(() => Post, post => post.portman)
  posts: Post[];

  // impose arbitrary order author1 < author2, indeed author1 !== author2
  @Field(() => Author)
  @ManyToOne(() => Author, { nullable: false })
  author1: Author;
  @RelationColumn({ nullable: false })
  author1Id: number;

  @Field(() => Author)
  @ManyToOne(() => Author, { nullable: false })
  author2: Author;
  @RelationColumn({ nullable: false })
  author2Id: number;
}
