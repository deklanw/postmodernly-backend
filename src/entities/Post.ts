import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  Index,
  Column
} from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Book } from './Book';
import { UserPostLike } from './UserPostLike';
import { PostFragment } from './PostFragment';
import { Portman } from './Portman';
import { User } from './User';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity()
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  // https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts#L97
  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.posts, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  creator?: User;
  @RelationColumn({ nullable: true })
  @Index()
  creatorId?: number;

  @Column('text')
  creatorIP: string;

  @Field(() => Portman)
  @ManyToOne(() => Portman, prm => prm.posts, { nullable: false })
  portman: Portman;
  @RelationColumn({ nullable: false })
  @Index()
  portmanId: number;

  @Field(() => Book)
  @ManyToOne(() => Book, { nullable: false })
  book1: Book;
  @RelationColumn({ nullable: false })
  book1Id: number;

  @Field(() => Book)
  @ManyToOne(() => Book, { nullable: false })
  book2: Book;
  @RelationColumn({ nullable: false })
  book2Id: number;

  // @Field(() => [UserPostLike], { nullable: true })
  // just need count on schema
  @OneToMany(() => UserPostLike, upl => upl.post)
  userLikes?: UserPostLike[];

  @Field(() => Int)
  @Column('int', { default: 0 })
  likeCount: number;

  @Field(() => [PostFragment])
  @OneToMany(() => PostFragment, pf => pf.post)
  usedFragments: PostFragment[];
}
