import {
  Resolver,
  FieldResolver,
  Root,
  ResolverInterface,
  Ctx
} from 'type-graphql';
import { FragmentOptionUser } from '../entities/FragmentOptionUser';
import { MyContext } from '../types/MyContext';
import { Fragment } from '../entities/Fragment';

@Resolver(() => FragmentOptionUser)
export class FragmentOptionUserResolver
  implements ResolverInterface<FragmentOptionUser> {
  @FieldResolver(() => Fragment)
  async fragment(
    @Root() fragmentOptionUser: FragmentOptionUser,
    @Ctx() { fragmentLoader }: MyContext
  ): Promise<Fragment> {
    if (fragmentOptionUser.fragment) {
      // already exists on object, skip
      return fragmentOptionUser.fragment;
    }
    return fragmentLoader.load(fragmentOptionUser.fragmentId.toString());
  }
}
