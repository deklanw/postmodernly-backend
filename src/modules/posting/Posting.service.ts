import _ from 'lodash';

import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import {
  Repository,
  Transaction,
  TransactionManager,
  EntityManager,
  LessThan
} from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Post } from '../../entities/Post';
import { PostInput } from './PostInput';
import {
  uniqueElementCount,
  lastElement,
  MAX_POST_LENGTH
} from '../../utils/util';
import { PortmanService } from './Portman.service';
import { PostFragment } from '../../entities/PostFragment';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { Portman } from '../../entities/Portman';
import { FragmentOptionAnon } from '../../entities/FragmentOptionAnon';
import {
  FragmentOptionUserRepository,
  FragmentOptionAnonRepository
} from '../../repos/FragmentOptionUser.repo';
import { FragInput } from './FragInput';
import { PostsWithCursor } from '../../tql-only/PostsWithCursor';

@Service()
export class PostingService {
  constructor(
    private readonly portmanService: PortmanService,
    @InjectRepository(FragmentOptionUser)
    private readonly fragmentOptionUserRepo: FragmentOptionUserRepository,
    @InjectRepository(FragmentOptionAnon)
    private readonly fragmentOptionAnonRepo: FragmentOptionAnonRepository,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}

  // check efficiency. is this best way to do this?
  @Transaction()
  private async createPostAndDeleteOptions(
    fragments: FragInput[],
    portman: Portman,
    book1Id: number,
    book2Id: number,
    ipAddress: string,
    creatorId?: number,
    @TransactionManager() em?: EntityManager
  ) {
    const post = em!.create(Post, {
      creatorId,
      portmanId: portman.id,
      creatorIP: ipAddress,
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

    if (creatorId) {
      await em!.delete(FragmentOptionUser, { userId: creatorId });
    } else {
      await em!.delete(FragmentOptionAnon, { ipAddress });
    }
    console.log('Deleted options');

    return post.id;
  }

  async getPostsWithCursor(limit: number, cursor?: string) {
    const whereCondition = cursor
      ? { created: LessThan(new Date(parseInt(cursor))) }
      : {};
    const posts = await this.postRepo.find({
      relations: [
        'creator',
        'book1',
        'book1.author',
        'book2',
        'book2.author',
        'portman',
        'userLikes',
        'usedFragments',
        'usedFragments.fragment',
        'usedFragments.fragment.book'
      ],
      order: { created: 'DESC' },
      take: limit,
      where: whereCondition
    });

    return plainToClass(PostsWithCursor, {
      posts,
      cursor: posts.length > 0 ? lastElement(posts).created : null
    });
  }

  async makePost(
    { fragments }: PostInput,
    ipAddress: string,
    creatorId?: number
  ) {
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
    let usedFragmentOptions;

    if (creatorId) {
      usedFragmentOptions = await this.fragmentOptionUserRepo.getPersonOptionsJoined(
        creatorId,
        fragmentIds
      );
    } else {
      usedFragmentOptions = await this.fragmentOptionAnonRepo.getAnonOptionsJoined(
        ipAddress,
        fragmentIds
      );
    }

    const totalLength = usedFragmentOptions
      .map(f => f.Fragment_fragment_text.length)
      .reduce((acc, x) => x + acc);

    if (totalLength > MAX_POST_LENGTH) {
      console.log('Post too length');
      return undefined;
    }

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
    return this.createPostAndDeleteOptions(
      fragments,
      portman,
      bookInfo1.bookId,
      bookInfo2.bookId,
      ipAddress,
      creatorId
    );
  }

  async deletePost(postId: number, creatorId: number) {
    const post = await this.postRepo.findOne({ id: postId, creatorId });
    if (post) {
      await this.postRepo.remove(post);
      console.log('Deleted post');
      return true;
    }
    return false;
  }
}
