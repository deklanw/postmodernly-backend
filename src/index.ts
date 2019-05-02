import fastify from 'fastify';
import fastifyCookie from 'fastify-cookie';
import fastifySession from 'fastify-session';
import fastifyCors from 'fastify-cors';
import connectRedis from 'connect-redis';
import { ApolloServer } from 'apollo-server-fastify';
import { formatArgumentValidationError } from 'type-graphql';
import { createConnection } from 'typeorm';
import 'reflect-metadata';

import { redis } from './utils/RedisStore';
import { createSchema } from './utils/createSchema';
import { sessionKey } from './constants/session';
import { options } from './utils/dbConfig';
import { bookLoader } from './loaders/bookLoader';
import { authorLoader } from './loaders/authorLoader';
import { fragmentLoader } from './loaders/fragmentLoader';
import { userLoader } from './loaders/userLoader';
import { portmanLoader } from './loaders/portmanLoader';

const secret = 'fjieosjfoejf09ofjeosijfiosejfoes3j90j)#(#()';

const main = async () => {
  await createConnection(options);

  const schema = await createSchema();
  const apolloServer = new ApolloServer({
    schema,
    formatError: formatArgumentValidationError as any, // ?
    context: request => ({
      session: request.session,
      bookLoader: bookLoader(),
      authorLoader: authorLoader(),
      fragmentLoader: fragmentLoader(),
      userLoader: userLoader(),
      portmanLoader: portmanLoader()
    }),
    subscriptions: {
      path: '/subscriptions'
    }
  });

  const app = fastify();

  const RedisStore = connectRedis(fastifySession);

  // origin: 'localhost:3000/'
  app.register(fastifyCors, { credentials: true });
  app.register(fastifyCookie);
  app.register(fastifySession, {
    secret,
    cookieName: sessionKey,
    store: new RedisStore({ client: redis as any }),
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  });

  app.register(apolloServer.createHandler());

  app.listen(4000, () => {
    console.log('Server started on http://localhost:4000/graphql');
  });

  apolloServer.installSubscriptionHandlers(app.server);
};

main();
