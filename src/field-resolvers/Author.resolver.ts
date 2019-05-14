import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';

import { Author } from '../entities/Author';
import { Book } from '../entities/Book';

@Service()
@Resolver(() => Author)
export class AuthorResolver implements ResolverInterface<Author> {
  constructor(
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>
  ) {}
  @FieldResolver()
  async books(@Root() author: Author): Promise<Book[]> {
    return (await this.bookRepo.find({ authorId: author.id }))!;
  }
}
