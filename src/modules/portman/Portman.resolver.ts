import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';

import { Author } from '../../entities/Author';
import { Portman } from '../../entities/Portman';
import { Post } from '../../entities/Post';

@Resolver(() => Portman)
export class PortmanResolver implements ResolverInterface<Portman> {
  @FieldResolver()
  async posts(@Root() portman: Portman): Promise<Post[]> {
    return (await Post.find({ portmanId: portman.id }))!;
  }

  @FieldResolver()
  async author1(@Root() portman: Portman): Promise<Author> {
    return (await Author.findOne({ id: portman.author1Id }))!;
  }

  @FieldResolver()
  async author2(@Root() portman: Portman): Promise<Author> {
    return (await Author.findOne({ id: portman.author2Id }))!;
  }
}
