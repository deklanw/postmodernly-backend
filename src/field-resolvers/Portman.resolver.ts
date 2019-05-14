import { Resolver, FieldResolver, Root, ResolverInterface } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { Author } from '../entities/Author';
import { Portman } from '../entities/Portman';
import { Post } from '../entities/Post';

@Resolver(() => Portman)
export class PortmanResolver implements ResolverInterface<Portman> {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>
  ) {}

  @FieldResolver()
  async posts(@Root() portman: Portman): Promise<Post[]> {
    return (await this.postRepo.find({ portmanId: portman.id }))!;
  }

  @FieldResolver()
  async author1(@Root() portman: Portman): Promise<Author> {
    return (await this.authorRepo.findOne({ id: portman.author1Id }))!;
  }

  @FieldResolver()
  async author2(@Root() portman: Portman): Promise<Author> {
    return (await this.authorRepo.findOne({ id: portman.author2Id }))!;
  }
}
