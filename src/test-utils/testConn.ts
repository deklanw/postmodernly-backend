import { createConnection } from 'typeorm';
import path from 'path';
import { options } from '../utils/dbConfig';

export const testConn = (drop: boolean = false) =>
  createConnection({
    ...options,
    database: 'postmodernly-test',
    logging: false,
    synchronize: drop,
    dropSchema: drop,
    entities: [path.join(__dirname, '../entities/*.{ts,js}')]
  });
