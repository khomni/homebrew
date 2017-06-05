var path = require('path');
require('dotenv').config();
global.Promise = require('bluebird');

require('./extensions');

global.APPROOT = path.resolve()
global.CONFIG = require('./');
global.Common = require('../common');
global.colors = require('colors')
global.SYSTEM = require('../system')
