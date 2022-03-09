'use strict';


// import config from '../../config/index.js';
import { expect } from 'chai';
import { RedisConnection } from './redis.js';

describe('Redis Connection class', async function() {
    
  /**
   * @type {Redis}
  */
  var mRedis;

  before( async function () {
    mRedis = await RedisConnection.getInstance();
    // 'awaiting' for a Promise, extracts the Promise's value!
  });


  after( function () {
    // mRedis.disconnect();  // disconnect was moved to test/setup.js to have a single disconnect
  });


  
  it('RedisConnection should not be null', async function () {
    
    expect(mRedis).to.not.eql(null);
  });


});