import _ from 'lodash';
import { plainToClass } from 'class-transformer';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Transaction, TransactionManager, EntityManager } from 'typeorm';

import { PortmanService } from './Portman.service';
import { User } from '../../entities/User';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { ReorderOptionsInput } from './ReorderOptionsInput';
import { uniqueElementCount, dateTimeStamp } from '../../utils/util';
import { Book } from '../../entities/Book';
import { BookFragmentOptions, PostOptions } from '../../tql-only/PostOptions';
import { Author } from '../../entities/Author';
import { Fragment } from '../../entities/Fragment';
import { FragmentOptionUserRepository } from '../../repos/FragmentOptionUser.repo';

@Service()
export class PostOptionsService {
  constructor(
    private readonly portmanService: PortmanService,
    @InjectRepository(FragmentOptionUser)
    private readonly fragmentOptionUserRepo: FragmentOptionUserRepository
  ) {}

  @Transaction()
  private async setNewOptions(
    fragments: any,
    userId: number,
    @TransactionManager() em?: EntityManager
  ) {
    await em!.delete(FragmentOptionUser, { userId });
    await em!.insert(
      FragmentOptionUser,
      fragments.map((fo: any) => ({
        fragmentId: fo.fragment_id,
        order: fo.order,
        userId
      }))
    );
    await em!.update(User, { id: userId }, { lastRolled: dateTimeStamp() });
  }

  async reorderOptions({ fragments }: ReorderOptionsInput, userId: number) {
    if (fragments.length !== 30) {
      // easy check. there should be exactly 30 options
      return false;
    }

    const fragmentIds = fragments.map(el => el.fragmentId);

    const uniqueOrderCount = uniqueElementCount(fragments.map(el => el.order));

    if (uniqueOrderCount !== 30) {
      // order count not unique, or less than 30 options were given
      return false;
    }

    const usedFragmentOptions = await this.fragmentOptionUserRepo.getUsersOptions(
      userId,
      fragmentIds
    );

    if (usedFragmentOptions.length !== 30) {
      // didnt reorder every option
      return false;
    }

    // now update by batch
    // this could be more efficient by skipping the query
    // pure batch update?
    await this.fragmentOptionUserRepo.save(
      fragments.map(el => this.fragmentOptionUserRepo.create({ ...el, userId }))
    );

    return true;
  }

  async getNewPostOptions(userId: number) {
    const fragments = await this.fragmentOptionUserRepo.getFreshFragments();

    // there should only be two bookIds. grab one arbitrarily, for partitioning
    const arbitraryBookId = fragments[0].book_id;

    // partition user's options by book
    const [book1FragmentOptions, book2FragmentOptions] = _.partition(
      fragments,
      (el: any) => el.book_id === arbitraryBookId
    );

    // grab one arbitary fragment from each book, for the metadata
    const arbitraryBook1Fragment = book1FragmentOptions[0];
    const arbitraryBook2Fragment = book2FragmentOptions[0];

    const portman = await this.portmanService.findOrInsertPortman(
      parseInt(arbitraryBook1Fragment.author_id),
      parseInt(arbitraryBook2Fragment.author_id)
    );

    // plainToClass needed here to get results from raw custom query back into TS-class happy place
    const createBookFragmentOptions = (
      arbitaryFragment: any,
      fragmentOptions: any[]
    ) =>
      plainToClass(BookFragmentOptions, {
        book: plainToClass(Book, {
          id: arbitaryFragment.book_id,
          authorId: arbitaryFragment.author_id,
          gbId: arbitaryFragment.gb_id,
          title: arbitaryFragment.title,
          language: arbitaryFragment.language,
          author: plainToClass(Author, {
            id: arbitaryFragment.author_id,
            name: arbitaryFragment.name
          })
        }),
        fragmentOptions: fragmentOptions.map((row: any) =>
          plainToClass(FragmentOptionUser, {
            order: row.order,
            fragment: plainToClass(Fragment, {
              id: row.fragment_id,
              context: row.context,
              fragment: row.fragment
            })
          })
        )
      });

    const book1Options = createBookFragmentOptions(
      arbitraryBook1Fragment,
      book1FragmentOptions
    );
    const book2Options = createBookFragmentOptions(
      arbitraryBook2Fragment,
      book2FragmentOptions
    );

    const postOptions: PostOptions = plainToClass(PostOptions, {
      portman,
      book1Options,
      book2Options
    });

    // Inside transaction: delete existing options for User, and save new ones.
    await this.setNewOptions(fragments, userId);

    return postOptions;
  }
}
