import { Field, Int, ObjectType } from 'type-graphql';
import { Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Fragment } from '../Fragment';

@ObjectType()
export abstract class FragmentOption {
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
}
