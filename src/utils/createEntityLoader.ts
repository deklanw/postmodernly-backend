import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';

export const createEntityLoader = (entity: any) => () =>
  new DataLoader(async (keys: string[]) => {
    const objs = await getRepository(entity).findByIds(keys);

    const map: { [key: number]: any } = {};

    objs.forEach((u: any) => {
      map[u.id] = u;
    });

    console.log(`${typeof entity} loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  });

export function createEntityDataLoader<T>(entity: T) {
  const batch = async (keys: string[]): Promise<(T | null)[]> => {
    const objs = await getRepository(entity as any).findByIds(keys);

    const map: { [key: number]: T } = {};

    objs.forEach((u: any) => {
      map[u.id] = u;
    });
    console.log(`User loader ran for ${keys.length} keys`);

    return keys.map(k => map[parseInt(k, 10)]);
  };

  return () => new DataLoader(batch);
}
