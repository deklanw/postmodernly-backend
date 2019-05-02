import { Resolver, UseMiddleware, Mutation, Ctx, Arg } from 'type-graphql';
import { getManager, createQueryBuilder } from 'typeorm';
import { plainToClass } from 'class-transformer';
import _ from 'lodash';

import { Fragment } from '../../entities/Fragment';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';
import { User } from '../../entities/User';
import { Book } from '../../entities/Book';
import { Author } from '../../entities/Author';
import { dateTimeStamp, uniqueElementCount } from '../../utils/util';
import { Portman } from '../../entities/Portman';
import { PostOptions, BookFragmentOptions } from '../../tql-only/PostOptions';
import { ReorderOptionsInput } from './ReorderOptionsInput';

// Efficient PG query to grab two random (unique) authors, a book from each author, and 15 fragments from each book.
// Each of the 30 fragments is assigned an order too
const randomFragmentsQuery = `
WITH ra AS ( SELECT id as author_id, name FROM author ORDER BY random() LIMIT 2 ) 

SELECT
*, ROW_NUMBER() OVER (ORDER BY random()) as order
FROM
	ra
	CROSS JOIN LATERAL ( SELECT id as book_id, gb_id, title, language FROM book WHERE book.author_id = ra.author_id ORDER BY random() LIMIT 1 ) rb
	CROSS JOIN LATERAL ( SELECT id as fragment_id, fragment, context FROM fragment WHERE fragment.book_id = rb.book_id ORDER BY random() LIMIT 15 ) rf
`;

@Resolver()
export class PostOptionsResolver {
  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async reorderOptions(
    @Ctx() ctx: MyContext,
    @Arg('data') { fragments }: ReorderOptionsInput
  ): Promise<Boolean> {
    const { userId } = ctx.koaCtx.session!;

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

    const usedFragmentOptions = await createQueryBuilder(
      'FragmentOptionUser',
      'f'
    )
      .select(['f.fragmentId', 'f.order'])
      .where('f.userId = :userId', { userId })
      .andWhere('f.fragmentId IN (:...fids)', {
        fids: fragmentIds
      })
      .getRawMany();

    if (usedFragmentOptions.length !== 30) {
      // didnt reorder every option
      return false;
    }

    // now update by batch
    // this could be more efficient by skipping the query
    // pure batch update?
    await FragmentOptionUser.save(
      fragments.map(el => FragmentOptionUser.create({ ...el, userId }))
    );

    return true;
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => PostOptions)
  async getNewPostOptions(
    @Ctx() ctx: MyContext
  ): Promise<PostOptions | undefined> {
    const { userId } = ctx.koaCtx.session!;
    const manager = getManager();
    const fragments = await manager.query(randomFragmentsQuery);

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

    const portman = await Portman.findOrInsertPortman(
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
    await getManager().transaction(async em => {
      await em.delete(FragmentOptionUser, { userId });
      await em.insert(
        FragmentOptionUser,
        fragments.map((fo: any) => ({
          fragmentId: fo.fragment_id,
          order: fo.order,
          userId
        }))
      );
      await em.update(User, { id: userId }, { lastRolled: dateTimeStamp() });
    });

    return postOptions;
  }
}
