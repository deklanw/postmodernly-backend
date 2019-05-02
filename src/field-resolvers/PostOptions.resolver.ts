import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { PostOptions, BookFragmentOptions } from '../tql-only/PostOptions';
import { Book } from '../entities/Book';
import { FragmentOptionUser } from '../entities/FragmentOptionUser';

// these Fields don't correspond directly to anything in the DB.
// these should be resolved only from the raw SQL query written in the respective resolver
// hence, they should just be returned as-is

@Resolver(() => BookFragmentOptions)
export class BookFragmentOptionsResolver
  implements ResolverInterface<BookFragmentOptions> {
  @FieldResolver()
  book(@Root() bookFragmentOptions: BookFragmentOptions): Book {
    if (bookFragmentOptions.book) {
      // already exists on object, skip
      return bookFragmentOptions.book;
    }
    throw Error('book unexpectedly undefined');
  }

  @FieldResolver()
  fragmentOptions(
    @Root() bookFragmentOptions: BookFragmentOptions
  ): FragmentOptionUser[] {
    if (bookFragmentOptions.fragmentOptions) {
      // already exists on object, skip
      return bookFragmentOptions.fragmentOptions;
    }
    throw Error('fragmentOptions unexpectedly undefined');
  }
}

@Resolver(() => PostOptions)
export class PostOptionsResolver implements ResolverInterface<PostOptions> {
  @FieldResolver()
  book1Options(@Root() postOptions: PostOptions): BookFragmentOptions {
    if (postOptions.book1Options) {
      // already exists on object, skip
      return postOptions.book1Options;
    }
    throw Error('book1Options unexpectedly undefined');
  }

  @FieldResolver()
  book2Options(@Root() postOptions: PostOptions): BookFragmentOptions {
    if (postOptions.book2Options) {
      // already exists on object, skip
      return postOptions.book2Options;
    }
    throw Error('book2Options unexpectedly undefined');
  }
}
