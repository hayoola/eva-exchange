'use strict';

// process.argv.push('--inspect-workers');
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from '../config/index.js';
import { SequelizeSingleton } from '../model/foundation/sequalize.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize } from 'sequelize';




/**
 * @type {Sequelize}
*/
let mSequelize = null;

before( async function () {

  chai.use(sinonChai);
  
  config.loggman.info('Before all tests...');
  //this.timeout(50000); // Increase timeout to handle slowish WSL
  
  try {

    mSequelize = await SequelizeSingleton.getInstance();
    if( !mSequelize ) {
      throw new Error('Sequelize instance is null!');
    }

  } catch( inError ) {
  
    config.loggman.error(`test/setup:before error: ${inError}`);

  }
  
  
});



after( function () {
  
  config.loggman.info('After all tests...');
  
  if( mSequelize ) mSequelize.close();
  
});




beforeEach(function beforeEach () {
  // In sinon v5 there is a default sandbox inside sinon object 
  //  so we don't need to createSandbox() anymore: 
  //  https://sinonjs.org/guides/migrating-to-5.0.html 
});

afterEach(function afterEach () {
  
  sinon.restore();
});