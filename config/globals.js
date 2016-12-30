var path = require('path');

global.APPROOT = path.resolve()
console.log(APPROOT)

global.CONFIG = require('./');
global.Common = require('../common');
global.Promise = require('bluebird');
global.colors = require('colors')
global.SYSTEM = require('../system')
