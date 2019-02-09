import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  UseMiddleware,
  Mutation,
  Ctx
} from 'type-graphql';
import { getManager } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Fragment } from '../../entities/Fragment';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { IsAuth } from '../../middleware/IsAuth';
import { MyContext } from '../../types/MyContext';
import { User } from '../../entities/User';
import { Book } from '../../entities/Book';
import { Author } from '../../entities/Author';
import { dateTimeStamp } from '../../utils/util';

const randomFragmentsQuery = `
WITH ra AS ( SELECT id as author_id, name FROM author ORDER BY random() LIMIT 2 ) 

SELECT
* 
FROM
	ra
	CROSS JOIN LATERAL ( SELECT id as book_id, gb_id, title, language FROM book WHERE book.author_id = ra.author_id ORDER BY random() LIMIT 1 ) rb
	CROSS JOIN LATERAL ( SELECT id as fragment_id, fragment, context FROM fragment WHERE fragment.book_id = rb.book_id ORDER BY random() LIMIT 15 ) rf
order by random()
`;

@Resolver(() => FragmentOptionUser)
export class FragmentOptionUserResolver
  implements ResolverInterface<FragmentOptionUser> {
  @UseMiddleware(IsAuth)
  @Mutation(() => [FragmentOptionUser])
  async getNewFragmentOptions(
    @Ctx() ctx: MyContext
  ): Promise<FragmentOptionUser[] | undefined> {
    const { userId } = ctx.koaCtx.session!;
    const manager = getManager();
    const fragments = await manager.query(randomFragmentsQuery);

    const fragmentOptions: FragmentOptionUser[] = fragments.map(
      (row: any, i: number) =>
        plainToClass(FragmentOptionUser, {
          order: i,
          fragment: plainToClass(Fragment, {
            id: row.fragment_id,
            bookId: row.book_id,
            fragment: row.fragment,
            context: row.context,
            book: plainToClass(Book, {
              id: row.book_id,
              authorId: row.author_id,
              gbId: row.gb_id,
              title: row.title,
              language: row.language,
              author: plainToClass(Author, {
                id: row.author_id,
                name: row.name
              })
            })
          })
        })
    );

    // delete existing options for User, and save new ones inside transaction
    await getManager().transaction(async em => {
      await em.delete(FragmentOptionUser, { userId });
      await em.insert(
        FragmentOptionUser,
        fragmentOptions.map(fo => ({
          fragmentId: fo.fragment.id,
          order: fo.order,
          userId
        }))
      );
      await em.update(User, { id: userId }, { lastRolled: dateTimeStamp() });
    });

    return fragmentOptions;
  }
  @FieldResolver()
  async fragment(
    @Root() fragmentOptionUser: FragmentOptionUser,
    @Ctx() { fragmentLoader }: MyContext
  ): Promise<Fragment> {
    if (fragmentOptionUser.fragment) {
      // already exists on object, skip
      return fragmentOptionUser.fragment;
    }
    return fragmentLoader.load(fragmentOptionUser.fragmentId.toString());
  }
}
