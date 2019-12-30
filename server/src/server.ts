import express from 'express';
import apolloServer from './graphql';

export default function createServer() {
  const app = express();

  apolloServer.applyMiddleware({ app });

  app.get('/', async (req, res, next) => {
    return res.send('yay!');
  });

  app.listen({ port: 7001 });
  return app;
}
