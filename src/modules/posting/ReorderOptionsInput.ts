import { InputType, Field } from 'type-graphql';
import { FragInput } from './FragInput';

@InputType()
export class ReorderOptionsInput {
  @Field(() => [FragInput])
  fragments: FragInput[];
}
