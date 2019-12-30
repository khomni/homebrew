import { Entity } from 'typeorm';

export default {
  __resolveType(obj: any, context: any, info: any) {
    obj;
    return obj.name || 'Node';
  }
};
