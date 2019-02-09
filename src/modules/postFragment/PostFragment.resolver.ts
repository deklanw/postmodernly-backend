import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';

import { Fragment } from '../../entities/Fragment';
import { PostFragment } from '../../entities/PostFragment';

@Resolver(() => PostFragment)
export class PostFragmentResolver implements ResolverInterface<PostFragment> {
  @FieldResolver()
  async fragment(@Root() postFragment: PostFragment): Promise<Fragment> {
    return (await Fragment.findOne({ id: postFragment.fragmentId }))!;
  }
}
