import createService from "./server";
import http from "http";

const app = createService();

const server = http.createServer(app);
