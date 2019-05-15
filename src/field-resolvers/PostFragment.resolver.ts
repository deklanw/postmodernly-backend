import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  Ctx
} from 'type-graphql';

import { Fragment } from '../entities/Fragment';
import { PostFragment } from '../entities/PostFragment';
import { MyContext } from '../types/MyContext';

@Resolver(() => PostFragment)
export class PostFragmentResolver implements ResolverInterface<PostFragment> {
  @FieldResolver()
  async fragment(
    @Root() postFragment: PostFragment,
    @Ctx() { fragmentLoader }: MyContext
  ): Promise<Fragment> {
    if (postFragment.fragment) {
      // already exists on object, skip
      return postFragment.fragment;
    }
    return fragmentLoader.load(postFragment.fragmentId.toString());
  }
}
