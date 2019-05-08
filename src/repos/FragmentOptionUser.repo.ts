import { EntityRepository, Repository, getConnection } from 'typeorm';

import { FragmentOptionUser } from '../entities/FragmentOptionUser';

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

@EntityRepository(FragmentOptionUser)
export class FragmentOptionUserRepository extends Repository<
  FragmentOptionUser
> {
  getFreshFragments() {
    return getConnection().query(randomFragmentsQuery);
  }

  getUsersOptions(userId: number, fragmentIds: number[]) {
    return this.createQueryBuilder('f')
      .select(['f.fragmentId', 'f.order'])
      .where('f.userId = :userId', { userId })
      .andWhere('f.fragmentId IN (:...fids)', {
        fids: fragmentIds
      })
      .getRawMany();
  }
}
