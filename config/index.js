'use strict';


// load .env in local development
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  require('dotenv').config({ silent: true });
}

const processType = process.env.PROCESS_TYPE;
console.log(`The process type: ${processType}`);

let config;
try {
  
  config = require(`./${processType}`);

} catch (ex) {
  
  

  if (ex.code === 'MODULE_NOT_FOUND') {
    throw new Error(`No config for process type: ${processType}`);
  }

  //throw ex;
  console.error(`Oh no! ${ex}`);
}

module.exports = config;