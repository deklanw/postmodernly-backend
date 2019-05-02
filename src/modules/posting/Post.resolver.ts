import {
  Resolver,
  Mutation,
  Ctx,
  UseMiddleware,
  Arg,
  Int,
  Query,
  Subscription,
  Root,
  PubSub,
  PubSubEngine
} from 'type-graphql';
import { getManager, createQueryBuilder } from 'typeorm';
import _ from 'lodash';

import { Post } from '../../entities/Post';
import { User } from '../../entities/User';
import { Portman } from '../../entities/Portman';
import { PostFragment } from '../../entities/PostFragment';
import { MyContext } from '../../types/MyContext';
import { IsAuth } from '../../middleware/IsAuth';
import { PostInput } from './PostInput';
import { uniqueElementCount, dateTimeStamp } from '../../utils/util';
import { NEW_POST } from '../../constants/subscription';

interface NewPostPayload {
  postId: number;
}

@Resolver()
export class PostResolver {
  @Subscription({
    topics: NEW_POST
  })
  newPost(@Root()
  {
    postId
  }: NewPostPayload): number {
    return postId;
  }

  @Query(() => [Post])
  async getPosts(): Promise<Post[]> {
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
    console.log('Grabbed posts');
    console.log(posts);
    return posts;
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() ctx: MyContext,
    @Arg('postId', () => Int) postId: number
  ): Promise<Boolean> {
    const { userId } = ctx.koaCtx.session!;
    await Post.delete({ id: postId, creatorId: userId });
    console.log('Deleted post');
    return true;
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Int, { nullable: true })
  async makePost(
    @Ctx() ctx: MyContext,
    @Arg('data')
    { fragments }: PostInput,
    @PubSub() pubSub: PubSubEngine
  ): Promise<number | undefined> {
    const { userId } = ctx.koaCtx.session!;
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
    const usedFragmentOptions = await createQueryBuilder('FragmentOptionUser')
      .select([
        'Fragment.bookId',
        'Author.id',
        'FragmentOptionUser.fragmentId',
        'FragmentOptionUser.order'
      ])
      .innerJoin('FragmentOptionUser.fragment', 'Fragment')
      .innerJoin('Fragment.book', 'Book')
      .innerJoin('Book.author', 'Author')
      .where('FragmentOptionUser.userId = :userId', { userId })
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

    const portman = await Portman.findOrInsertPortman(
      bookInfo1.authorId,
      bookInfo2.authorId
    );

    let postId;

    // insert Post, then PostFragments
    await getManager().transaction(async em => {
      const post = em.create(Post, {
        creatorId: userId,
        portmanId: portman.id,
        book1Id: bookInfo1.bookId,
        book2Id: bookInfo2.bookId
      });
      await em.insert(Post, post);
      console.log('Inserted new Post');
      await em.insert(
        PostFragment,
        fragments.map(frag => ({
          ...frag,
          postId: post.id
        }))
      );
      console.log('Inserted Post Fragments');

      // set User last posted
      await em.update(User, { id: userId }, { lastPosted: dateTimeStamp() });
      console.log('Updated User last post');

      postId = post.id;
    });

    await pubSub.publish(NEW_POST, { postId });

    return postId;
  }
}
