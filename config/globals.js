var path = require('path');

global.APPROOT = path.resolve()
global.Promise = require('bluebird');
global.CONFIG = require('./');
global.Common = require('../common');
global.colors = require('colors')
global.SYSTEM = require('../system')
