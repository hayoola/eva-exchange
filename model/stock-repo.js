'use strict';


import config from '../config/index.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize, Model, DataTypes, Deferrable } from 'sequelize';
import { SequelizeSingleton } from './foundation/sequalize.js';


const FALSE = false;


class StockRepo {

  
  /**
   * Static async builder, since we can't have an async constructor!
  */
  static async build() {

    let mStockRepo = null;

    try {

      const sequelizeInstance = await SequelizeSingleton.getInstance();
      mStockRepo = new StockRepo( sequelizeInstance);
      await mStockRepo.syncSchemaWithDatabase();

    } catch( inError ) {

      config.loggman.error(`StockRepo::build error: ${inError}`);
      mStockRepo = null;
    }

    return mStockRepo;
  }


  constructor( inSequelize ) {

    /**
     * @type {Sequelize}
    */
    this.mSequelize = inSequelize;

    Stock.init({
      symbol: {
        type: DataTypes.CHAR(3),
        primaryKey: true,
        validate: {
          isUppercase: true
        }
      },
      name: {
        type: DataTypes.STRING
      },
      last_rate_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: this.mSequelize,
      modelName: 'Stock'
    });

    StockRateLog.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_symbol: {
        type: DataTypes.CHAR(3),
        references: {
          model: Stock,
          key: 'symbol',
          deferrable: Deferrable.INITIALLY_IMMEDIATE
        }
      },
      rate: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        validate: {
          isDecimal: true
        }
      }
    },
    {
      indexes: [
        {
          fields: ['stock_symbol', 'id']
        }
      ],
      sequelize: this.mSequelize,
      modelName: 'StockRateLog'
    })
  }


  async syncSchemaWithDatabase() {

    await Stock.sync();
    await StockRateLog.sync();
  }


  async registerStock(
    inSymbol,
    inInitialRate,
    inDescriptiveName
  ) {

    const result = await this.mSequelize.transaction( async (inTransaction) => {

      const newStock = await Stock.create({ 
        symbol: inSymbol, 
        name: inDescriptiveName, 
        last_rate_id: 0 
      },
      {
        transaction: inTransaction
      });
  
      if( inInitialRate ) {
        
        await this._update_stock_rate_self(
          inTransaction,
          newStock,
          inInitialRate
        );
       
      }

      console.debug(newStock.toJSON());
      return newStock;

    });

    return result;
  }



  async bulkRegisterStock(
    inSymbols,
  ) {

    const stocksArray = inSymbols.map( (inSingleSymbol) => {

      const oneElement = {
        symbol: inSingleSymbol, 
        name: '', 
        last_rate_id: 0 
      };

      return oneElement;
      
    });

    const newStocks = await Stock.bulkCreate(stocksArray);
    return newStocks;

  }






  async _update_stock_rate_self(
    inTransaction,
    inStock,
    inRate
  ) {

    const newStockRateLog = await StockRateLog.create({
      stock_symbol: inStock.symbol,
      rate: inRate
    },
    {
      transaction: inTransaction
    });

    console.debug(newStockRateLog.toJSON());
    
    inStock.last_rate_id = newStockRateLog.id;
    await inStock.save({transaction: inTransaction});
    
    return newStockRateLog;

  }



  async updateStockRateInsideTransaction(
    inTransaction,
    inStockSymbol,
    inNewRate
  ) {


    let didUpdate = false;

    do {

      const stock = await Stock.findByPk(inStockSymbol);
      if( !stock ) break;

      await this._update_stock_rate_self(
        inTransaction,
        stock,
        inNewRate
      );

      didUpdate = true;

    } while( FALSE );


    return didUpdate;

  }





  async updateStockRate(
    inStockSymbol,
    inNewRate
  ) {

    let didUpdate = false;

    do {

      const stock = await Stock.findByPk(inStockSymbol);
      if( !stock ) break;

      const latestStockRate = await this.latestStockRate(inStockSymbol);
      if( latestStockRate === inNewRate ) break;

      await this.mSequelize.transaction( async (inTransaction) => {

        await this._update_stock_rate_self(
          inTransaction,
          stock,
          inNewRate
        );

      });

      didUpdate = true;

    } while( FALSE);


    return didUpdate;
  }







  async latestStockRate(
    inStockSymbol
  ) {

    let rate = 0;

    do {

      const stock = await Stock.findByPk(inStockSymbol);
      if( !stock ) break;

      const latestStockRateLog = await StockRateLog.findByPk( stock.last_rate_id);
      if( !latestStockRateLog ) break;

      rate = parseFloat(latestStockRateLog.rate);


    } while( FALSE );

  

    return rate;
  }

}



class Stock extends Model {

}

class StockRateLog extends Model {


}



const StockRepoSingleton = (function () {
  let mStockRepoInstance;

  /**
   * Create an instance of the StockRepo class
   * 
   * @returns {Promise} A Promise on a UserRepo instance
   */
  async function createInstance() {
    let stockRepo = await StockRepo.build();
    return stockRepo;
  }

  return {
    /**
     * Get the singleton instance
     * 
     * @returns {Promise} A Promise, which its value is the UserRepo instance
     */
    geInstance: function () {
      if (!mStockRepoInstance) {
        mStockRepoInstance = createInstance();
      }
      return mStockRepoInstance;
    }
  };
})();



export {
  StockRepo,
  StockRepoSingleton,
  Stock
}