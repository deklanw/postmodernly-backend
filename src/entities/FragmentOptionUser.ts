import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ObjectType } from 'type-graphql';

import { User } from './User';
import { FragmentOption } from './shared/FragmentOption';

@ObjectType()
@Entity()
export class FragmentOptionUser extends FragmentOption {
  // @Field(() => User)
  // this field not needed on schema since this will always be reached from the User
  @ManyToOne(() => User, user => user.fragmentOptions, {
    onDelete: 'CASCADE'
  })
  user: User;
  @PrimaryColumn()
  userId: number;
}
