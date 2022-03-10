'use strict';

// This file is called from ../web.js

const joi = require('joi');

const envVarsSchema = joi.object({
  
  POSTGRES_URI: joi.string().uri({ scheme: 'postgres' }).required(),

}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`PostgreSQL config validation error: ${error.message}`);
}




const config = {
  postgres: {
    uri: envVars.POSTGRES_URI,
  }
};

module.exports = config;