'use strict';

const common = require('./components/common');
const logger = require('./components/logger');
const postgresql = require('./components/postgres');

module.exports = Object.assign(
  {}, 
  common, 
  logger, 
  postgresql
);