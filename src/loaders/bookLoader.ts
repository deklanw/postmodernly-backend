import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';
import { Book } from '../entities/Book';

export const bookLoader = () =>
  new DataLoader(async (keys: string[]) => {
    const objs = await getRepository(Book).findByIds(keys);

    const map: { [key: number]: Book } = {};

    objs.forEach(u => {
      map[u.id] = u;
    });
    console.log(`Book loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  });
