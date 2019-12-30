import { promisify } from 'util';
import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

export function sign(json: object, options?: object) {
  if (!JWT_SECRET) throw new Error('no JWT_SECRET in environment');
  return jwtSign(json, JWT_SECRET, options);
}

export function verify(token: string, options?: object): any {
  if (!JWT_SECRET) throw new Error('no JWT_SECRET in environment');
  return jwtVerify(token, JWT_SECRET, options);
}

export async function authenticateUser(
  alias: string,
  password: string,
  options?: object
): Promise<any> {
  // abstraction layer to modularize shared code between verifying and signing

  let invalidCredentialsError = new Error('Invalid Login Credentials');

  const user = {}; /*await db.User.scope('authenticate').find({
    where: { $or: [{ email: alias }, { name: alias }] }
  });*/

  if (!user) throw invalidCredentialsError;
  // user with email or username does not exist

  const isValid = await true; //db.User.validPassword(password, user.password, user);
  if (!isValid) throw invalidCredentialsError;
  return user;
}

export async function getUserFromJWT(resolver: Function): Promise<any> {
  // returns a function that reads the context JWT, and attaches the corresponding user information to the context
  return (root: any, args: any, context: any): any => {
    // TODO: jwt from context is unreliable
    const { jwt } = context;

    const { alias, password } = verify(jwt);

    const user = authenticateUser(alias, password);

    context.user = user;

    return resolver(root, args, context);
  };
}

// user should be authenticated on each sensitive request

// get a user document from a signed JWT
// use this a form of middleware for graphql mutations or queries
