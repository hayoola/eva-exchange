'use strict';

const joi = require('joi');
const winston = require('winston');
const appRoot = require('app-root-path');


const envVarsSchema = joi.object({
  LOGGER_LEVEL: joi.string()
    .allow('error', 'warn', 'info', 'verbose', 'debug', 'silly')
    .default('info'),
  LOGGER_ENABLED: joi.boolean()
    .truthy('TRUE')
    .truthy('true')
    .falsy('FALSE')
    .falsy('false')
    .default(true)
}).unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  logger_options: {
    level: envVars.LOGGER_LEVEL,
    enabled: envVars.LOGGER_ENABLED
  },
  loggman: {}
};

let options = {
  
  file: {
      level: 'debug',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
  },
  
  console: {
      level: 'debug',
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      handleExceptions: true,
  },
};

let logger = winston.createLogger({
  level: config.logger_options.level,  
  transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});
config.loggman = logger;


if (!config.logger_options.enabled) {
  logger.remove(winston.transports.Console);
}

module.exports = config;