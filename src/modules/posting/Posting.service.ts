import _ from 'lodash';

import { Service } from 'typedi';
import { InjectRepository, InjectConnection } from 'typeorm-typedi-extensions';
import {
  Repository,
  Connection,
  Transaction,
  TransactionManager,
  EntityManager
} from 'typeorm';
import { Post } from '../../entities/Post';
import { PostInput } from './PostInput';
import { uniqueElementCount, dateTimeStamp } from '../../utils/util';
import { PortmanService } from './Portman.service';
import { PostFragment } from '../../entities/PostFragment';
import { User } from '../../entities/User';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { FragInput } from '../../generated/graphql';
import { Portman } from '../../entities/Portman';

@Service()
export class PostingService {
  constructor(
    private readonly portmanService: PortmanService,
    @InjectRepository(FragmentOptionUser)
    private readonly fragmentOptionUserRepo: Repository<FragmentOptionUser>
  ) {}

  // check efficiency. is this best way to do this?
  @Transaction()
  private async createPost(
    fragments: FragInput[],
    portman: Portman,
    book1Id: number,
    book2Id: number,
    creatorId: number,
    @TransactionManager() em?: EntityManager
  ) {
    const post = em!.create(Post, {
      creatorId,
      portmanId: portman.id,
      book1Id,
      book2Id
    });
    await em!.insert(Post, post);
    console.log('Inserted new Post');
    await em!.insert(
      PostFragment,
      fragments.map(frag => ({
        ...frag,
        postId: post.id
      }))
    );
    console.log('Inserted Post Fragments');

    // set User last posted
    await em!.update(User, { id: creatorId }, { lastPosted: dateTimeStamp() });
    console.log('Updated User last post');

    return post.id;
  }

  async getPosts() {
    // paginate
    // subscriptions?
    const posts = await Post.find({
      relations: [
        'creator',
        'book1',
        'book2',
        'portman',
        'userLikes',
        'usedFragments'
      ],
      order: { id: 'DESC' }
    });

    return posts;
  }

  async makePost({ fragments }: PostInput, creatorId: number) {
    const fragmentIds = fragments.map(f => f.fragmentId);
    const orders = fragments.map(f => f.order);

    if (uniqueElementCount(fragmentIds) !== fragmentIds.length) {
      console.log('Fragment IDs not unique');
      return undefined;
    }

    if (uniqueElementCount(orders) !== orders.length) {
      console.log('Orders not unique');
      return undefined;
    }

    // get the FragmentOptions for the current User, joined with the Book and Author info,
    // joined with the fragmentIds used in the post
    const usedFragmentOptions = await this.fragmentOptionUserRepo
      .createQueryBuilder()
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

    // every fragment chosen for this post is among the User's options
    const onlyUsesOptions = usedFragmentOptions.length === fragmentIds.length;

    if (!onlyUsesOptions) {
      console.log('Uses fragment not in options');
      return undefined;
    }

    // there should only be two bookIds. grab one arbitrarily, for partitioning
    const arbitraryBookId = usedFragmentOptions[0].Fragment_book_id;

    // partition user's options by book
    const [book1FragmentOptions, book2FragmentOptions] = _.partition(
      usedFragmentOptions,
      (el: any) => el.Fragment_book_id === arbitraryBookId
    );

    const usesTwoBooks =
      book1FragmentOptions.length !== 0 && book2FragmentOptions.length !== 0;

    if (!usesTwoBooks) {
      console.log('Did not use both books');
      return undefined;
    }

    let bookInfo1 = {
      bookId: book1FragmentOptions[0].Fragment_book_id,
      authorId: book1FragmentOptions[0].Author_id
    };
    let bookInfo2 = {
      bookId: book2FragmentOptions[0].Fragment_book_id,
      authorId: book2FragmentOptions[0].Author_id
    };

    // make sure 1 refers to the book with lesser authorId
    if (bookInfo1.authorId > bookInfo2.authorId) {
      const temp = bookInfo1;
      bookInfo1 = bookInfo2;
      bookInfo2 = temp;
    }

    const portman = await this.portmanService.findOrInsertPortman(
      bookInfo1.authorId,
      bookInfo2.authorId
    );

    // insert Post, then PostFragments
    return this.createPost(
      fragments,
      portman,
      bookInfo1.bookId,
      bookInfo2.bookId,
      creatorId
    );
  }

  async deletePost(postId: number, creatorId: number) {
    await Post.delete({ id: postId, creatorId });
    console.log('Deleted post');
    return true;
  }
}