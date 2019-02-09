import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';
import { Fragment } from '../entities/Fragment';

export const fragmentLoader = () =>
  new DataLoader(async (keys: string[]) => {
    const objs = await getRepository(Fragment).findByIds(keys);

    const map: { [key: number]: Fragment } = {};

    objs.forEach(u => {
      map[u.id] = u;
    });
    console.log(`Fragment loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  });
