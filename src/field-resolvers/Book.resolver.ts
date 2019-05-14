import {
  Resolver,
  Ctx,
  FieldResolver,
  Root,
  ResolverInterface
} from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';

import { Book } from '../entities/Book';
import { Author } from '../entities/Author';
import { Fragment } from '../entities/Fragment';
import { MyContext } from '../types/MyContext';

@Service()
@Resolver(() => Book)
export class BookResolver implements ResolverInterface<Book> {
  constructor(
    @InjectRepository(Fragment)
    private readonly fragmentRepo: Repository<Fragment>
  ) {}
  @FieldResolver()
  async author(
    @Root() book: Book,
    @Ctx() { authorLoader }: MyContext
  ): Promise<Author> {
    if (book.author) {
      // Author already exists on Book. Just return it.
      return book.author;
    }
    return authorLoader.load(book.authorId.toString());
  }

  @FieldResolver()
  async fragments(@Root() book: Book): Promise<Fragment[]> {
    return (await this.fragmentRepo.find({ bookId: book.id }))!;
  }
}
