import { ApolloServer } from 'apollo-server-koa';
import Koa from 'koa';
import session from 'koa-session';
import RedisStore from 'koa-redis';
import cors from '@koa/cors';
import { formatArgumentValidationError } from 'type-graphql';
import { createConnection } from 'typeorm';
import 'reflect-metadata';

import { redis } from './utils/RedisStore';
import { createSchema } from './utils/createSchema';
import { sessionKey } from './constants/session';
import { MyContext } from './types/MyContext';
import { options } from './utils/dbConfig';

const secret = 'fjieosjfoejf093j90j)#(#()';

const main = async () => {
  await createConnection(options);

  const schema = await createSchema();
  const apolloServer = new ApolloServer({
    schema,
    formatError: formatArgumentValidationError,
    context: ({ ctx }: { ctx: MyContext }) => ctx
  });

  const app = new Koa();
  app.keys = [secret];

  app.use(cors({ credentials: true, origin: 'http://localhost:3000/' }));
  app.use(
    session(
      {
        key: sessionKey,
        store: new RedisStore({
          client: redis
        })
        // other options . . .
      },
      app
    )
  );

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Server started on http://localhost:4000/graphql');
  });
};

main();
