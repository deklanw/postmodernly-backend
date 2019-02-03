import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  CreateDateColumn
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserPostLike } from './UserPostLike';
import { FragmentOptionUser } from './FragmentOptionUser';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, post => post.creator)
  posts?: Post[];

  @Field(() => [UserPostLike], { nullable: true })
  @OneToMany(() => UserPostLike, upl => upl.user)
  postLikes?: UserPostLike[];

  @Field(() => [FragmentOptionUser]) // nullable?
  @OneToMany(() => FragmentOptionUser, fou => fou.user)
  fragmentOptions: FragmentOptionUser[];

  @Column('bool', { default: false })
  confirmed: boolean;

  @Field()
  @CreateDateColumn()
  created: Date;

  @Field({ nullable: true })
  @Column('timestamp', { nullable: true })
  lastPosted?: Date;

  @Field({ nullable: true }) // nullable? have to reconsider
  @Column('timestamp', { nullable: true })
  lastRolled?: Date;
}
