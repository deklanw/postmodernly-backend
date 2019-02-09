import path from 'path';
import { buildSchema } from 'type-graphql';

export const createSchema = () =>
  buildSchema({
    resolvers: [path.join(__dirname, '../modules/**/*.resolver.ts')]
  });
