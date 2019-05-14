import { EntityRepository, Repository, getConnection } from 'typeorm';

import { FragmentOptionUser } from '../entities/FragmentOptionUser';
import { FragmentOptionAnon } from '../entities/FragmentOptionAnon';

export type RandomFragmentQueryResult = {
  authorId: number;
  name: string;
  bookId: number;
  gbId: number;
  title: string;
  language: string;
  fragmentId: number;
  fragmentText: string;
  context: string;
  order: number;
};

// Efficient PG query to grab two random (unique) authors, a book from each author, and 15 fragments from each book.
// Each of the 30 fragments is assigned an order too
const randomFragmentsQuery = `
WITH ra AS ( SELECT id as "authorId", name FROM author ORDER BY random() LIMIT 2 ) 

SELECT
"authorId", name, "bookId", "gbId", title, "language", "fragmentId", "fragmentText", context, ROW_NUMBER() OVER (ORDER BY random()) as "order"
FROM
	ra
	CROSS JOIN LATERAL ( SELECT id as "bookId", gb_id AS "gbId", title, "language" FROM book WHERE book.author_id = ra."authorId" ORDER BY random() LIMIT 1 ) rb
	CROSS JOIN LATERAL ( SELECT id as "fragmentId", fragment_text AS "fragmentText", context FROM fragment WHERE fragment.book_id = rb."bookId" ORDER BY random() LIMIT 15 ) rf
`;

export const getFreshFragments = () => {
  return getConnection().query(randomFragmentsQuery) as Promise<
    RandomFragmentQueryResult[]
  >;
};

@EntityRepository(FragmentOptionAnon)
export class FragmentOptionAnonRepository extends Repository<
  FragmentOptionAnon
> {
  getPersonsOptions(ipAddress: string, fragmentIds: number[]) {
    return this.createQueryBuilder('f')
      .select(['f.fragmentId', 'f.order'])
      .where('f.ipAddress = :ipAddress', {
        ipAddress
      })
      .andWhere('f.fragmentId IN (:...fids)', {
        fids: fragmentIds
      })
      .getRawMany();
  }

  getAnonOptionsJoined(ipAddress: string, fragmentIds: number[]) {
    return this.createQueryBuilder()
      .select([
        'Fragment.bookId',
        'Author.id',
        'FragmentOptionAnon.fragmentId',
        'FragmentOptionAnon.order'
      ])
      .innerJoin('FragmentOptionAnon.fragment', 'Fragment')
      .innerJoin('Fragment.book', 'Book')
      .innerJoin('Book.author', 'Author')
      .where('FragmentOptionAnon.ipAddress = :ipAddress', { ipAddress })
      .andWhere('FragmentOptionAnon.fragmentId IN (:...fids)', {
        fids: fragmentIds
      })
      .getRawMany();
  }
}

@EntityRepository(FragmentOptionUser)
export class FragmentOptionUserRepository extends Repository<
  FragmentOptionUser
> {
  getPersonsOptions(fragmentIds: number[], userId?: number) {
    return this.createQueryBuilder('f')
      .select(['f.fragmentId', 'f.order'])
      .where('f.userId = :userId', {
        userId
      })
      .andWhere('f.fragmentId IN (:...fids)', {
        fids: fragmentIds
      })
      .getRawMany();
  }

  getPersonOptionsJoined(creatorId: number, fragmentIds: number[]) {
    return this.createQueryBuilder()
      .select([
        'Fragment.bookId',
        'Author.id',
        'FragmentOptionUser.fragmentId',
        'FragmentOptionUser.order'
      ])
      .innerJoin('FragmentOptionUser.fragment', 'Fragment')
      .innerJoin('Fragment.book', 'Book')
      .innerJoin('Book.author', 'Author')
      .where('FragmentOptionUser.userId = :userId', { userId: creatorId })
      .andWhere('FragmentOptionUser.fragmentId IN (:...fids)', {
        fids: fragmentIds
      })
      .getRawMany();
  }
}
