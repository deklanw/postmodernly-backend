import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Book } from './Book';
import { UserPostLike } from './UserPostLike';
import { PostFragment } from './PostFragment';
import { Portman } from './Portman';
import { User } from './User';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts, { nullable: false })
  creator: User;

  @Field(() => Portman)
  @ManyToOne(() => Portman, prm => prm.posts, { nullable: false })
  portman: Portman;

  @Field(() => Book)
  @OneToOne(() => Book, { nullable: false })
  @JoinColumn()
  book1: Book;

  @Field(() => Book)
  @OneToOne(() => Book, { nullable: false })
  @JoinColumn()
  book2: Book;

  @Field(() => [UserPostLike], { nullable: true })
  @OneToMany(() => UserPostLike, upl => upl.post)
  userLikes?: UserPostLike[];

  @Field(() => [PostFragment])
  @OneToMany(() => PostFragment, pf => pf.post)
  usedFragments: PostFragment[];

  // https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts#L97
  @Field()
  @CreateDateColumn() // this becomes a "timestamp"
  @Column()
  created: Date;
}
