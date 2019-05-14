import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';

import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { UserPostLike } from '../entities/UserPostLike';
import { FragmentOptionUser } from '../entities/FragmentOptionUser';
import { FragmentOptionUserRepository } from '../repos/FragmentOptionUser.repo';

@Service()
@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
  constructor(
    @InjectRepository(UserPostLike)
    private readonly userPostLikeRepo: Repository<UserPostLike>,
    @InjectRepository(FragmentOptionUser)
    private readonly fragmentOptionUserRepo: FragmentOptionUserRepository,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>
  ) {}

  @FieldResolver()
  async posts(@Root() user: User): Promise<Post[]> {
    return (await this.postRepo.find({ creatorId: user.id }))!;
  }

  @FieldResolver()
  async postLikes(@Root() user: User): Promise<UserPostLike[]> {
    return (await this.userPostLikeRepo.find({ userId: user.id }))!;
  }

  @FieldResolver()
  async fragmentOptions(@Root() user: User): Promise<FragmentOptionUser[]> {
    return (await this.fragmentOptionUserRepo.find({ userId: user.id }))!;
  }
}
