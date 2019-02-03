import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Author } from './Author';
import { Post } from './Post';

@ObjectType()
@Entity()
export class Portman extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => [Post], { nullable: true }) // posts could be deleted
  @OneToMany(() => Post, post => post.portman)
  posts: Post[];

  // impose arbitrary order author1 < author2, indeed author1 !== author2
  @Field(() => Author)
  @OneToOne(() => Author, { nullable: false })
  @JoinColumn()
  author1: Author;

  @Field(() => Author)
  @OneToOne(() => Author, { nullable: false })
  @JoinColumn()
  author2: Author;

  @Field()
  @Column('text')
  portman: string;
}
