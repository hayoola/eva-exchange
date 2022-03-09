'use strict';

import Redis from 'ioredis';
import config from '../../config/index.js';

const RedisConnection = (function () {
    var redisInstance = null;
    
    // An 'async' function wraps the return value in a Promise and
    //  actually returns that Promise!
    
    /**
     * Create an instance of the Redis connection
     * 
     * @returns {Promise} A Promise on a connected or failed connection
    */
    async function createInstance() {
      
      var redis = new Redis(config.redis.uri, {lazyConnect: true});
      try {
        
        await redis.connect();
      
      } catch(error) {

          config.loggman.error(`****** Oh no, can't connect to redis`);
      }
      
      return redis;
    }
 
    return {
        /**
         * Get the singleton instance
         * 
         * @returns {Promise} A Promise, which its value is the Redis instance
        */
        getInstance: function () {
            if (!redisInstance) {
                redisInstance = createInstance();
            }
            return redisInstance;
        }
    };
})();

export {RedisConnection};