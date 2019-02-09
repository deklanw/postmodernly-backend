import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  Mutation,
  Ctx,
  UseMiddleware,
  Arg,
  Int
} from 'type-graphql';
import { getManager } from 'typeorm';

import { Book } from '../../entities/Book';
import { Post } from '../../entities/Post';
import { User } from '../../entities/User';
import { Portman } from '../../entities/Portman';
import { UserPostLike } from '../../entities/UserPostLike';
import { PostFragment } from '../../entities/PostFragment';
import { MyContext } from '../../types/MyContext';
import { IsAuth } from '../../middleware/IsAuth';
import { PostInput } from './PostInput';
import { FragmentOptionUser } from '../../entities/FragmentOptionUser';
import { uniqueElementCount, dateTimeStamp } from '../../utils/util';

const usesBothBooksQuery = `
SELECT COUNT
	( DISTINCT book_id ) 
FROM
	fragment_option_user
	JOIN fragment ON fragment_option_user.fragment_id = fragment.ID 
WHERE
	fragment.ID = ANY ($1)
`;

@Resolver(() => Post)
export class PostResolver implements ResolverInterface<Post> {
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
  @Mutation(() => Boolean)
  async makePost(
    @Ctx() ctx: MyContext,
    @Arg('data')
    { fragments, book1Id, book2Id, author1Id, author2Id }: PostInput
  ): Promise<Boolean> {
    const { userId } = ctx.koaCtx.session!;
    const fragmentIds = fragments.map(f => f.fragmentId);
    const orders = fragments.map(f => f.order);

    if (uniqueElementCount(fragmentIds) !== fragmentIds.length) {
      console.log('Fragment IDs not unique');
      return false;
    }

    if (uniqueElementCount(orders) !== orders.length) {
      console.log('Orders not unique');
      return false;
    }

    const userFragmentOptions = (await FragmentOptionUser.find({ userId })).map(
      row => row.fragmentId
    );

    // O(n^2). But, shouldn't need to scale
    // replace with raw query? -- select count userfragmentoptions where in ()
    const onlyUsesOptions = fragmentIds.every(fi =>
      userFragmentOptions.includes(fi)
    );

    if (!onlyUsesOptions) {
      console.log('Uses fragment not in options');
      return false;
    }

    const manager = getManager();
    const queryResult = await manager.query(usesBothBooksQuery, [fragmentIds]);
    const count = parseInt(queryResult[0].count, 10);
    console.log(count);

    if (count !== 2) {
      console.log('Didnt use both books');
      return false;
    }

    const portman = await Portman.findOrInsertPortman(author1Id, author2Id);

    // insert Post, then PostFragments
    await getManager().transaction(async em => {
      const post = em.create(Post, {
        creatorId: userId,
        portmanId: portman.id,
        book1Id,
        book2Id
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
    });

    return true;
  }

  @FieldResolver()
  async creator(@Root() post: Post): Promise<User> {
    return (await User.findOne({ id: post.creatorId }))!;
  }

  @FieldResolver()
  async book1(@Root() post: Post): Promise<Book> {
    return (await Book.findOne({ id: post.book1Id }))!;
  }

  @FieldResolver()
  async book2(@Root() post: Post): Promise<Book> {
    return (await Book.findOne({ id: post.book2Id }))!;
  }

  @FieldResolver()
  async portman(@Root() post: Post): Promise<Portman> {
    return (await Portman.findOne({ id: post.portmanId }))!;
  }

  @FieldResolver()
  async userLikes(@Root() post: Post): Promise<UserPostLike[]> {
    return (await UserPostLike.find({ postId: post.id }))!;
  }

  @FieldResolver()
  async usedFragments(@Root() post: Post): Promise<PostFragment[]> {
    return (await PostFragment.find({ postId: post.id }))!;
  }
}
