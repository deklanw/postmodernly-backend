import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';
import { Author } from '../entities/Author';

export const authorLoader = () =>
  new DataLoader(async (keys: string[]) => {
    const objs = await getRepository(Author).findByIds(keys);

    const map: { [key: number]: Author } = {};

    objs.forEach(u => {
      map[u.id] = u;
    });

    console.log(`Author loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  });
