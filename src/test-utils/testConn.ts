import { createConnection, getManager } from 'typeorm';
import path from 'path';
import { options } from '../utils/dbConfig';

export const customDrop = async () => {
  // drop everything besides Author, Book, Fragment. These contain essentially immutable data.
  const dropMostQuery = `TRUNCATE fragment_option_user, portman, post, post_fragment, "user", user_post_like CASCADE`;
  const manager = getManager();
  await manager.query(dropMostQuery);
  console.log('Custom drop executed.');
};

export const testConn = (drop: boolean = false) =>
  createConnection({
    ...options,
    database: 'postmodernly-test',
    logging: false,
    synchronize: true,
    dropSchema: drop,
    entities: [path.join(__dirname, '../entities/*.{ts,js}')]
  });
