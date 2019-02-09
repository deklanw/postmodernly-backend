import { Resolver, Mutation, Ctx } from 'type-graphql';

import { MyContext } from '../../types/MyContext';

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  logout(@Ctx() ctx: MyContext): Boolean {
    ctx.koaCtx.session = undefined; // relying on browser behavior to clear cookie?
    return true;
  }
}
