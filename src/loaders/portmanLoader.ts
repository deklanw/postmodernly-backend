import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';
import { Portman } from '../entities/Portman';

export const portmanLoader = () =>
  new DataLoader(async (keys: string[]) => {
    const objs = await getRepository(Portman).findByIds(keys);

    const map: { [key: number]: Portman } = {};

    objs.forEach(u => {
      map[u.id] = u;
    });
    console.log(`Portman loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  });
