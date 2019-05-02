import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { UserPostLike } from '../entities/UserPostLike';
import { FragmentOptionUser } from '../entities/FragmentOptionUser';

@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
  @FieldResolver()
  async posts(@Root() user: User): Promise<Post[]> {
    return (await Post.find({ creatorId: user.id }))!;
  }

  @FieldResolver()
  async postLikes(@Root() user: User): Promise<UserPostLike[]> {
    return (await UserPostLike.find({ userId: user.id }))!;
  }

  @FieldResolver()
  async fragmentOptions(@Root() user: User): Promise<FragmentOptionUser[]> {
    return (await FragmentOptionUser.find({ userId: user.id }))!;
  }
}
