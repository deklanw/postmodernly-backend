import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';

import { UserPostLike } from '../entities/UserPostLike';
import { User } from '../entities/User';
import { Post } from '../entities/Post';

@Service()
@Resolver(() => UserPostLike)
export class UserPostLikeResolver implements ResolverInterface<UserPostLike> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}
  @FieldResolver()
  async user(@Root() userPostLike: UserPostLike): Promise<User> {
    return (await this.userRepo.findOne({ id: userPostLike.userId }))!;
  }

  @FieldResolver()
  async post(@Root() userPostLike: UserPostLike): Promise<Post> {
    return (await this.postRepo.findOne({ id: userPostLike.postId }))!;
  }
}
