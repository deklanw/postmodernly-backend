import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { UserPostLike } from '../entities/UserPostLike';
import { User } from '../entities/User';
import { Post } from '../entities/Post';

@Resolver(() => UserPostLike)
export class UserPostLikeResolver implements ResolverInterface<UserPostLike> {
  @FieldResolver()
  async user(@Root() userPostLike: UserPostLike): Promise<User> {
    return (await User.findOne({ id: userPostLike.userId }))!;
  }

  @FieldResolver()
  async post(@Root() userPostLike: UserPostLike): Promise<Post> {
    return (await Post.findOne({ id: userPostLike.postId }))!;
  }
}
