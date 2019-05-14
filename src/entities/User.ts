import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserPostLike } from './UserPostLike';
import { FragmentOptionUser } from './FragmentOptionUser';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text', { unique: true })
  @Index({ unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('bool', { default: false })
  confirmed: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created: Date;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, post => post.creator)
  posts?: Post[];

  @Field(() => [UserPostLike]) // can be empty but not null
  @OneToMany(() => UserPostLike, upl => upl.user)
  postLikes?: UserPostLike[];

  @Field(() => [FragmentOptionUser]) // nullable?
  @OneToMany(() => FragmentOptionUser, fou => fou.user)
  fragmentOptions: FragmentOptionUser[];
}
