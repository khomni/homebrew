import 'source-map-support/register';
import 'reflect-metadata';

import * as http from 'http';

/* ==============================
 * TODO: configuration and environments
 * ============================== */

import createConnection from './database/connection';
import createService from './server';
import graphql from './graphql';

(async () => {
  try {
    const app = createService();
    const server = http.createServer(app);
    const connection = await createConnection();
  } catch (error) {
    console.error(error);
  }
})();
