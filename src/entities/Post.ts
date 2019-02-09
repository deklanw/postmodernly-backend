import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  Index
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Book } from './Book';
import { UserPostLike } from './UserPostLike';
import { PostFragment } from './PostFragment';
import { Portman } from './Portman';
import { User } from './User';
import { RelationColumn } from '../utils/relationColumn';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  // https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts#L97
  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  creator: User;
  @RelationColumn({ nullable: false })
  @Index()
  creatorId: number;

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

  @Field(() => [UserPostLike], { nullable: true })
  @OneToMany(() => UserPostLike, upl => upl.post)
  userLikes?: UserPostLike[];

  @Field(() => [PostFragment])
  @OneToMany(() => PostFragment, pf => pf.post)
  usedFragments: PostFragment[];
}
