import { ObjectType, Field } from 'type-graphql';
import { Book } from '../entities/Book';
import { Portman } from '../entities/Portman';
import { FragmentOption } from '../entities/shared/FragmentOption';

@ObjectType()
export class BookFragmentOptions {
  @Field(() => Book)
  book: Book;

  @Field(() => [FragmentOption])
  fragmentOptions: FragmentOption[];
}

@ObjectType()
export class PostOptions {
  @Field(() => BookFragmentOptions)
  book1Options: BookFragmentOptions;

  @Field(() => BookFragmentOptions)
  book2Options: BookFragmentOptions;

  @Field(() => Portman)
  portman: Portman;
}
