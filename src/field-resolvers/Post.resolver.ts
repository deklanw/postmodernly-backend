import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  Ctx
} from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';

import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { Book } from '../entities/Book';
import { Portman } from '../entities/Portman';
import { UserPostLike } from '../entities/UserPostLike';
import { PostFragment } from '../entities/PostFragment';
import { MyContext } from '../types/MyContext';

@Service()
@Resolver(() => Post)
export class PostResolver implements ResolverInterface<Post> {
  constructor(
    @InjectRepository(UserPostLike)
    private readonly userPostLikeRepo: Repository<UserPostLike>,
    @InjectRepository(PostFragment)
    private readonly postFragmentRepo: Repository<PostFragment>
  ) {}

  @FieldResolver()
  async creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ): Promise<User | undefined> {
    if (post.creator) {
      // just return it, it exists already
      return post.creator;
    }
    if (post.creatorId) {
      return userLoader.load(post.creatorId.toString());
    }

    return undefined;
  }

  @FieldResolver()
  async book1(
    @Root() post: Post,
    @Ctx() { bookLoader }: MyContext
  ): Promise<Book> {
    if (post.book1) {
      // just return it, it exists already
      return post.book1;
    }
    return bookLoader.load(post.book1Id.toString());
  }

  @FieldResolver()
  async book2(
    @Root() post: Post,
    @Ctx() { bookLoader }: MyContext
  ): Promise<Book> {
    if (post.book2) {
      // just return it, it exists already
      return post.book2;
    }
    return bookLoader.load(post.book2Id.toString());
  }

  @FieldResolver()
  async portman(
    @Root() post: Post,
    @Ctx() { portmanLoader }: MyContext
  ): Promise<Portman> {
    if (post.portman) {
      // just return it, it exists already
      return post.portman;
    }
    return portmanLoader.load(post.portmanId.toString());
  }

  @FieldResolver()
  async likeCount(@Root() post: Post): Promise<number> {
    if (post.userLikes) {
      return post.userLikes.length;
    }
    return (await this.userPostLikeRepo.count({ postId: post.id }))!;
  }

  @FieldResolver()
  async usedFragments(@Root() post: Post): Promise<PostFragment[]> {
    if (post.usedFragments) {
      // just return it, it exists already
      return post.usedFragments;
    }
    return (await this.postFragmentRepo.find({ postId: post.id }))!;
  }
}
