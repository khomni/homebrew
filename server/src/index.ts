import 'reflect-metadata';
import createService from './server';
import graphql from './graphql';
import http from 'http';

const app = createService();

const server = http.createServer(app);
