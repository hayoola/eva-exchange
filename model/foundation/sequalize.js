'use strict';

import { Sequelize } from 'sequelize';
import config from '../../config/index.js';



const SequelizeSingleton = (function () {
  
  let sequelizeInstance = null;
  

  
  /**
   * Create an instance of the SequelizeSingleton connection
   * 
   * @returns {Promise} A Promise on a connected or failed connection
  */
  async function createInstance() {
    
    /**
     * @type {Sequelize}
    */
    let sequelize = new Sequelize(config.postgres.uri);
    try {
      
      await sequelize.authenticate();
      config.loggman.info('Connection has been established successfully');
    
    } catch(error) {

        config.loggman.error(`****** Oh no, can't connect to PostgreSQL: ${error}`);
        sequelize = null;
    }
    
    return sequelize;
  }

  return {
      /**
       * Get the singleton instance
       * 
       * @returns {Promise} A Promise, which its value is the Redis instance
      */
      getInstance: function () {
          if (!sequelizeInstance) {
              sequelizeInstance = createInstance();
          }
          return sequelizeInstance;
      }
  };
})();

export { SequelizeSingleton };