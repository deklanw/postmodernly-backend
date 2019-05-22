import _ from 'lodash';
import { plainToClass } from 'class-transformer';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Transaction, TransactionManager, EntityManager } from 'typeorm';

import { PortmanService } from './Portman.service';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { ReorderOptionsInput } from './ReorderOptionsInput';
import { uniqueElementCount } from '../../utils/util';
import { Book } from '../../entities/Book';
import { BookFragmentOptions, PostOptions } from '../../tql-only/PostOptions';
import { Author } from '../../entities/Author';
import { Fragment } from '../../entities/Fragment';
import {
  FragmentOptionUserRepository,
  FragmentOptionAnonRepository,
  getFreshFragments,
  RandomFragmentQueryResult
} from '../../repos/FragmentOptionUser.repo';
import { FragmentOptionAnon } from '../../entities/FragmentOptionAnon';
import { FragmentOption } from '../../entities/shared/FragmentOption';
import { LIMITS } from '../../utils/rateLimitConstants';
import { redis } from '../../utils/RedisStore';
import { PostOptionsWithTime } from '../../tql-only/PostOptionsWithTime';

@Service()
export class PostOptionsService {
  constructor(
    private readonly portmanService: PortmanService,
    @InjectRepository(FragmentOptionUser)
    private readonly fragmentOptionUserRepo: FragmentOptionUserRepository,
    @InjectRepository(FragmentOptionAnon)
    private readonly fragmentAnonUserRepo: FragmentOptionAnonRepository
  ) {}

  @Transaction()
  private async setNewOptions(
    fragments: RandomFragmentQueryResult[],
    ipAddress: string,
    userId?: number,
    @TransactionManager() em?: EntityManager
  ) {
    if (userId) {
      await em!.delete(FragmentOptionUser, { userId });
      await em!.insert(
        FragmentOptionUser,
        fragments.map(fo => ({
          fragmentId: fo.fragmentId,
          order: fo.order,
          userId
        }))
      );
    } else {
      await em!.delete(FragmentOptionAnon, { ipAddress });
      await em!.insert(
        FragmentOptionAnon,
        fragments.map(fo => ({
          fragmentId: fo.fragmentId,
          order: fo.order,
          ipAddress
        }))
      );
    }
  }

  async reorderOptions(
    { fragments }: ReorderOptionsInput,
    ipAddress: string,
    userId?: number
  ) {
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

    let usedFragmentOptions: any[];

    // if logged in, and not
    // now update by batch
    // this could be more efficient by skipping the query
    // pure batch update?
    if (userId) {
      usedFragmentOptions = await this.fragmentOptionUserRepo.getPersonsOptions(
        fragmentIds,
        userId
      );

      if (usedFragmentOptions.length !== 30) {
        // didnt reorder every option
        return false;
      }

      await this.fragmentOptionUserRepo.save(
        fragments.map(el =>
          this.fragmentOptionUserRepo.create({ ...el, userId })
        )
      );
    } else {
      usedFragmentOptions = await this.fragmentAnonUserRepo.getPersonsOptions(
        ipAddress,
        fragmentIds
      );

      if (usedFragmentOptions.length !== 30) {
        // didnt reorder every option
        return false;
      }

      await this.fragmentAnonUserRepo.save(
        fragments.map(el =>
          this.fragmentAnonUserRepo.create({ ...el, ipAddress })
        )
      );
    }

    return true;
  }

  private flatToBookFragmentOptions(
    arbitraryFragment: RandomFragmentQueryResult,
    fragmentsFromOneBook: RandomFragmentQueryResult[]
  ) {
    // plainToClass needed here to get results from raw custom query back into TS-class
    return plainToClass(BookFragmentOptions, {
      book: plainToClass(Book, {
        id: arbitraryFragment.bookId,
        authorId: arbitraryFragment.authorId,
        gbId: arbitraryFragment.gbId,
        title: arbitraryFragment.title,
        language: arbitraryFragment.language,
        author: plainToClass(Author, {
          id: arbitraryFragment.authorId,
          name: arbitraryFragment.name
        })
      }),
      fragmentOptions: fragmentsFromOneBook.map(row =>
        plainToClass(FragmentOptionUser, {
          order: row.order,
          fragment: plainToClass(Fragment, {
            id: row.fragmentId,
            context: row.context,
            fragmentText: row.fragmentText
          })
        })
      )
    });
  }

  // consider abstracting this for other limits
  // implement as middleware?
  async rateLimitGetNewPostOptions(ipAddress: string, userId?: number) {
    const { limitForAnon, limitForUser } = LIMITS;
    const isAnon = !userId;
    const key = `rate-limit:getOptions:${isAnon ? ipAddress : userId}`;

    const current = await redis.incr(key); // if key doesn't exist, sets to zero then increments

    // if just set key
    if (current === 1) {
      await redis.expire(
        key,
        isAnon ? limitForAnon.period : limitForUser.period
      );
    }
    const remainingTime = await redis.ttl(key);
    let overLimit = false;

    if (
      (isAnon && current > limitForAnon.requests) ||
      (!isAnon && current > limitForUser.requests)
    ) {
      overLimit = true;
    }

    return { overLimit, remainingTime };
  }

  async limitedGetNewPostOptions(ipAddress: string, userId?: number) {
    const { overLimit, remainingTime } = await this.rateLimitGetNewPostOptions(
      ipAddress,
      userId
    );

    let options: PostOptions | null = null;

    if (!overLimit) {
      options = await this.getNewPostOptions(ipAddress, userId);
    }

    return plainToClass(PostOptionsWithTime, {
      postOptions: options,
      remainingTime
    });
  }

  async limitedGetCurrentOrNewPostOptions(ipAddress: string, userId?: number) {
    let options: PostOptions | null = null;

    // get current options (if any) for user, depending on whether they're logged in or anon
    if (userId) {
      options = await this.getCurrentUserOptions(userId);
    } else {
      options = await this.getCurrentAnonOptions(ipAddress);
    }

    // if user already has valid options, just return
    // in this case, we don't know their remaining time. only know it if they (attempt to) getNew
    if (options) {
      return plainToClass(PostOptionsWithTime, {
        postOptions: options,
        remainingTime: null
      });
    }

    // otherwise attempt to get new options for them. if they're rate limited it will be null
    return this.limitedGetNewPostOptions(ipAddress, userId);
  }

  async getNewPostOptions(ipAddress: string, userId?: number) {
    const fragments = await getFreshFragments();

    // there should only be two bookIds. grab one arbitrarily, for partitioning
    const arbitraryBookId = fragments[0].bookId;

    // partition user's options by book
    const [book1FragmentOptions, book2FragmentOptions] = _.partition(
      fragments,
      el => el.bookId === arbitraryBookId
    );

    // grab one arbitary fragment from each book, for the metadata
    const arbitraryBook1Fragment = book1FragmentOptions[0];
    const arbitraryBook2Fragment = book2FragmentOptions[0];

    const portman = await this.portmanService.findOrInsertPortman(
      arbitraryBook1Fragment.authorId,
      arbitraryBook2Fragment.authorId
    );

    const book1Options = this.flatToBookFragmentOptions(
      arbitraryBook1Fragment,
      book1FragmentOptions
    );
    const book2Options = this.flatToBookFragmentOptions(
      arbitraryBook2Fragment,
      book2FragmentOptions
    );

    const postOptions: PostOptions = plainToClass(PostOptions, {
      portman,
      book1Options,
      book2Options
    });

    // Inside transaction: delete existing options for User, and save new ones.
    await this.setNewOptions(fragments, ipAddress, userId);

    return postOptions;
  }

  private async fragmentOptionsToPostOptions(options: FragmentOption[]) {
    if (options.length !== 30) {
      return null;
    }

    const arbitraryBookId = options[0].fragment.bookId;

    // partition user's options by book
    const [book1FragmentOptions, book2FragmentOptions] = _.partition(
      options,
      el => el.fragment.bookId === arbitraryBookId
    );

    // grab one arbitary fragment from each book, for the metadata
    const arbitraryBook1Fragment = book1FragmentOptions[0];
    const arbitraryBook2Fragment = book2FragmentOptions[0];

    // now package it up properly
    const book1Options = plainToClass(BookFragmentOptions, {
      book: arbitraryBook1Fragment.fragment.book,
      fragmentOptions: book1FragmentOptions
    });

    const book2Options = plainToClass(BookFragmentOptions, {
      book: arbitraryBook2Fragment.fragment.book,
      fragmentOptions: book2FragmentOptions
    });

    // in theory this could be grabbed with a join instead
    const portman = await this.portmanService.findOrInsertPortman(
      arbitraryBook1Fragment.fragment.book.authorId,
      arbitraryBook2Fragment.fragment.book.authorId
    );

    return plainToClass(PostOptions, {
      book1Options,
      book2Options,
      portman
    });
  }

  async getCurrentAnonOptions(ipAddress: string) {
    const options: FragmentOption[] = await this.fragmentAnonUserRepo.find({
      where: { ipAddress },
      relations: ['fragment', 'fragment.book', 'fragment.book.author']
    });

    return this.fragmentOptionsToPostOptions(options);
  }

  async getCurrentUserOptions(userId: number) {
    const options: FragmentOption[] = await this.fragmentOptionUserRepo.find({
      where: { userId },
      relations: ['fragment', 'fragment.book', 'fragment.book.author']
    });

    return this.fragmentOptionsToPostOptions(options);
  }
}
