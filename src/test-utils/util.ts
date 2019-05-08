import Container from 'typedi';
import path from 'path';
import { createConnection, getManager, useContainer } from 'typeorm';

import { options } from '../utils/dbConfig';

export const setupTOContainer = () => {
  useContainer(Container);
  console.log('Setup TypeORM container.');
};

export const customTruncate = async () => {
  // truncate everything besides Author, Book, Fragment. These contain constant data.
  const dropMostQuery = `TRUNCATE fragment_option_user, portman, post, post_fragment, "user", user_post_like CASCADE`;
  const manager = getManager();
  await manager.query(dropMostQuery);
  console.log('Custom truncate executed.');
};

export const testConn = async (drop: boolean = false) => {
  const conn = await createConnection({
    ...options,
    database: 'postmodernly-test',
    logging: false,
    synchronize: true,
    dropSchema: drop,
    entities: [path.join(__dirname, '../entities/*.{ts,js}')]
  });

  console.log('TypeORM connection created.');

  return conn;
};
