import {
  Entity,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  Column
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { Fragment } from './Fragment';

@ObjectType()
@Entity()
export class FragmentOptionUser extends BaseEntity {
  @PrimaryColumn()
  fragId: number;

  @PrimaryColumn()
  userId: number;

  @Field()
  @Column('int')
  order: number;

  // other ManyToOne side to Fragment isn't needed
  // No need to query, e.g. "all users who have this fragment as part of their current options"
  @Field(() => Fragment)
  fragment: Fragment;

  @Field(() => User)
  @ManyToOne(() => User, user => user.fragmentOptions, {
    primary: true
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
