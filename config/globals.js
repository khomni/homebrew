var path = require('path');
require('dotenv').config();

require('./extensions');

global.APPROOT = path.resolve()
global.Promise = require('bluebird');
global.CONFIG = require('./');
global.Common = require('../common');
global.colors = require('colors')
global.SYSTEM = require('../system')
