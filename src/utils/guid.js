import crypto from 'crypto';
import _ from 'lodash';

const hash = crypto.createHash('sha1')

export var incrementer = 0;

export default function generateGuid(){
  let now = Date.now()
  incrementer = ++incrementer % 1000
  let buffer = Buffer.from([now >> 24, now >> 16, now >> 8, now, incrementer]).toString('hex')
  // console.log(buffer);
  return buffer;
}



