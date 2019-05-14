import { Entity, PrimaryColumn } from 'typeorm';
import { ObjectType } from 'type-graphql';

import { FragmentOption } from './shared/FragmentOption';

@ObjectType()
@Entity()
export class FragmentOptionAnon extends FragmentOption {
  @PrimaryColumn('text')
  ipAddress: string;
}
