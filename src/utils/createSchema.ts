import path from 'path';
import { buildSchema, AuthChecker } from 'type-graphql';
import { MyContext } from '../types/MyContext';

const customAuthChecker: AuthChecker<MyContext> = (
  { root, args, context, info },
  roles
) => !!context.session!.userId;

export const createSchema = () =>
  buildSchema({
    resolvers: [path.join(__dirname, '../modules/**/*.resolver.ts')],
    authChecker: customAuthChecker
  });
