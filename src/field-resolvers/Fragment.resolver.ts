import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  Ctx
} from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';

import { Fragment } from '../entities/Fragment';
import { Book } from '../entities/Book';
import { PostFragment } from '../entities/PostFragment';
import { MyContext } from '../types/MyContext';

@Service()
@Resolver(() => Fragment)
export class FragmentResolver implements ResolverInterface<Fragment> {
  constructor(
    @InjectRepository(PostFragment)
    private readonly postFragmentRepo: Repository<PostFragment>
  ) {}

  @FieldResolver()
  async book(
    @Root() frag: Fragment,
    @Ctx() { bookLoader }: MyContext
  ): Promise<Book> {
    if (frag.book) {
      // Book already exists on Fragment. Just return it
      return frag.book;
    }
    return bookLoader.load(frag.bookId.toString());
  }

  @FieldResolver()
  async postsWhichUse(@Root() frag: Fragment): Promise<PostFragment[]> {
    return (await this.postFragmentRepo.find({ fragmentId: frag.id }))!;
  }
}
