import resolvers from "./resolvers";
import { ApolloServer } from "apollo-server-express";

const typeDefs = require("./schema/index");

// compile the schema from the GraphQL schema language
export default new ApolloServer({
  typeDefs,
  resolvers
});
