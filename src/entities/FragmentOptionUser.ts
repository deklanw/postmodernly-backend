import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { Field, ObjectType, Int } from 'type-graphql';
import { User } from './User';
import { Fragment } from './Fragment';

@ObjectType()
@Entity()
export class FragmentOptionUser extends BaseEntity {
  @Field(() => Int)
  @Column('int')
  order: number;

  // other ManyToOne side to Fragment isn't needed
  // No need to query, e.g. "all users who have this fragment as part of their current options"
  @ManyToOne(() => Fragment) // for the FK constraint
  @Field(() => Fragment)
  fragment: Fragment;
  @PrimaryColumn()
  fragmentId: number;

  // @Field(() => User)
  // this field not needed on schema since this will always be reached from the User
  @ManyToOne(() => User, user => user.fragmentOptions, {
    onDelete: 'CASCADE'
  })
  user: User;
  @PrimaryColumn()
  userId: number;
}
