import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Service } from 'typedi';

import { Portman } from '../../entities/Portman';
import { Author } from '../../entities/Author';
import { portmanteau } from '../../utils/portmanteau/portmanteau';
import { lastElement } from '../../utils/util';

@Service()
export class PortmanService {
  constructor(
    @InjectRepository(Portman)
    private readonly portmanRepo: Repository<Portman>,
    @InjectRepository(Author) private readonly authorRepo: Repository<Author>
  ) {}

  async findOrInsertPortman(id1: number, id2: number): Promise<Portman> {
    // make sure order is correct
    const author1Id = Math.min(id1, id2);
    const author2Id = Math.max(id1, id2);

    const existingPortman = await this.portmanRepo.findOne({
      author1Id,
      author2Id
    });

    if (existingPortman) {
      console.log('This Portman already exists.');
      return existingPortman;
    }

    // this should error out if the authors don't exist for both IDs
    const [author1, author2] = await this.authorRepo.findByIds([
      author1Id,
      author2Id
    ]);
    const author1LastName = lastElement(author1!.name.split(' ')).toLowerCase();
    const author2LastName = lastElement(author2!.name.split(' ')).toLowerCase();

    const newPortman = this.portmanRepo.create({
      author1Id,
      author2Id,
      name: portmanteau(author1LastName, author2LastName)
    });

    await this.portmanRepo.insert(newPortman);
    console.log('Saved new Portman in DB.');

    return newPortman;
  }
}
