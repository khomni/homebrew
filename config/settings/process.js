'use strict';

let cpus = require('os').cpus().length;

module.exports = {
  default: {
    threads: process.env.CLUSTER_MAX ? Math.min(cpus, Math.max(1, process.env.CLUSTER_MAX)) : cpus,
  }
}

