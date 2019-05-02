import { ObjectType, Field } from 'type-graphql';
import { Book } from '../entities/Book';
import { Portman } from '../entities/Portman';
import { FragmentOptionUser } from '../entities/FragmentOptionUser';

@ObjectType()
export class BookFragmentOptions {
  @Field(() => Book)
  book: Book;

  @Field(() => [FragmentOptionUser])
  fragmentOptions: FragmentOptionUser[];
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
