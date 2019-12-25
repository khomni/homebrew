import express from 'express';
import apolloServer from './graphql';

export default function createServer() {
  const app = express();

  apolloServer.applyMiddleware({ app });

  app.listen({ port: 4001 });
  return app;
}
