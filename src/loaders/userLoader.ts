import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

export const userLoader = () =>
  new DataLoader(async (keys: string[]) => {
    const objs = await getRepository(User).findByIds(keys);

    const map: { [key: number]: User } = {};

    objs.forEach(u => {
      map[u.id] = u;
    });
    console.log(`User loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  });
