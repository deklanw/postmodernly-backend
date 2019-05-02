import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';

import { Author } from '../entities/Author';
import { Book } from '../entities/Book';

@Resolver(() => Author)
export class AuthorResolver implements ResolverInterface<Author> {
  @FieldResolver()
  async books(@Root() author: Author): Promise<Book[]> {
    return (await Book.find({ authorId: author.id }))!;
  }
}
