import { InputType, Field } from 'type-graphql';
import { FragInput } from './FragInput';

@InputType()
export class PostInput {
  @Field(() => [FragInput])
  fragments: FragInput[];
}
