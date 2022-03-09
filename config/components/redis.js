'use strict';

// This file is called from ../web.js

const joi = require('joi');

const envVarsSchema = joi.object({
  
  REDIS_URI: joi.string().uri({ scheme: 'redis' }).required(),
  REDIS_PREFLIGHT_URI: joi.string().uri({ scheme: 'redis' }).required(),
  REDIS_DATA_RETENTION_IN_MS: joi.number().default(86400000)

}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Redis config validation error: ${error.message}`);
}


const theRedisURI = process.env.NODE_ENV === 'test' ? 
  envVars.REDIS_PREFLIGHT_URI :
  envVars.REDIS_URI
;

const config = {
  redis: {
    uri: theRedisURI,
    // uri: envVars.REDIS_URI,
    dataRetention: envVars.REDIS_DATA_RETENTION_IN_MS
  }
};

module.exports = config;