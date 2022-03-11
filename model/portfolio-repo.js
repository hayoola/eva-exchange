'use strict';


import config from '../config/index.js';
import { nanoid } from 'nanoid/async';
// eslint-disable-next-line no-unused-vars
import { Sequelize, Model, DataTypes, Deferrable, Op } from 'sequelize';
import { SequelizeSingleton } from './foundation/sequalize.js';
import { UserRepoSingleton } from './user-repo.js';
// eslint-disable-next-line no-unused-vars
import { StockRepoSingleton, StockRepo } from './stock-repo.js';
import { User } from './user-repo.js';
import { Stock } from './stock-repo.js';





class PortfolioRepo {

  /**
   * Static async builder, since we can't have an async constructor!
  */
  static async build() {

    let mPortfolioRepo = null;

    try {

      // Portfolio and TransactionLog model objects are dependent to 
      //  'User' and 'Stock' model objects
      const userRepo = await UserRepoSingleton.geUserRepoInstance();
      await userRepo.syncSchemaWithDatabase();

      const stockRepo = await StockRepoSingleton.geInstance();
      await stockRepo.syncSchemaWithDatabase();

      const sequelizeInstance = await SequelizeSingleton.getInstance();
      mPortfolioRepo = new PortfolioRepo( sequelizeInstance, stockRepo);
      await mPortfolioRepo.syncSchemaWithDatabase();

    } catch( inError ) {

      config.loggman.error(`PortfolioRepo::build error: ${inError}`);
      mPortfolioRepo = null;
    }


    return mPortfolioRepo;
  }



  constructor( 
    inSequelize,
    inStockRepo
  ) {

    /**
     * @type {Sequelize}
    */
    this.mSequelize = inSequelize;

    /**
     * @type {StockRepo}
    */
    this.mStockRepo = inStockRepo;

    Portfolio.init({
      id: {
        type: DataTypes.CHAR(21),
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.CHAR(21),
        references: {
          model: User,
          key: 'id',
          deferrable: Deferrable.INITIALLY_IMMEDIATE
        }
      }
    },
    {
      indexes: [
        {
          fields: ['user_id']
        }
      ],
      sequelize: this.mSequelize,
      modelName: 'Portfolio'
    });

    TransactionLog.init({
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
      portfolio_id: {
        type: DataTypes.CHAR(21),
        references: {
          model: Portfolio,
          key: 'id',
          deferrable: Deferrable.INITIALLY_IMMEDIATE
        }
      },
      num_shares: {
        type: DataTypes.INTEGER,
        allowNull: false
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
          fields: ['portfolio_id', 'stock_symbol']
        }
      ],
      sequelize: this.mSequelize,
      modelName: 'TransactionLog'
    });

  }




  async syncSchemaWithDatabase() {

    await Portfolio.sync();
    await TransactionLog.sync();
  }



  async registerPortfolio( inUserID ) {

    const nid = await nanoid();
    const newPortfolio = await Portfolio.create({ id: nid, user_id: inUserID});
    console.debug( newPortfolio.toJSON());
    return newPortfolio;
  }




  async portfolioByUserID( inUserID ) {

    const portfolio = await Portfolio.findOne({
      where: {
        user_id: {
          [Op.eq]: inUserID
        }
      }
    });

    return portfolio;
  }



  async buy(
    inPortfolioID,
    inSymbol,
    inNumOfShares,
    inRate
  ) {

    const result = await this.mSequelize.transaction( async (inTransaction) => {


      const newTransactionLog = await TransactionLog.create({
        stock_symbol: inSymbol,
        portfolio_id: inPortfolioID,
        num_shares: inNumOfShares,
        rate: inRate
      },
      {
        transaction: inTransaction
      });
      console.debug(newTransactionLog.toJSON());

      const didUpdate = await this.mStockRepo.updateStockRateInsideTransaction(
        inTransaction,
        inSymbol, 
        inRate
      );
      if( !didUpdate ) {
        throw new Error(`PortfolioRepo::buy: Can't update the stock price!`);
      }
      
      
      return newTransactionLog;

    });


    return result;
  }



  async computePortfolioStockShares(
    inPortfolioID,
    inSymbol
  ) {

    const queryModel = await TransactionLog.findAll(
      {
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('num_shares')), 'n_shares']
        ]
        ,
        where: {
          [Op.and]: [
            {portfolio_id: inPortfolioID},
            {stock_symbol: inSymbol}
          ]
        }
      }
    );

    const numOfShares = parseInt(queryModel[0].dataValues.n_shares);

    return numOfShares;
  }



  async sell(
    inPortfolioID,
    inSymbol,
    inNumOfShares,
    inRate
  ) {

    let wasSold = false;

    const totalNumOfShares = await this.computePortfolioStockShares(inPortfolioID,inSymbol);
    if( totalNumOfShares >= inNumOfShares ) {

      const transactionLog = await this.buy(inPortfolioID, inSymbol, -inNumOfShares, inRate);
      console.debug('----->', transactionLog.toJSON());
      wasSold = true;
    }


    return wasSold;
  }

}


class Portfolio extends Model {


}


class TransactionLog extends Model {


}






const PortfolioRepoSingleton = (function () {
  let mPortfolioRepoInstance;

  /**
   * Create an instance of the PortfolioRepo class
   * 
   * @returns {Promise} A Promise on a UserRepo instance
   */
  async function createInstance() {
    let portfolioRepo = await PortfolioRepo.build();
    return portfolioRepo;
  }

  return {
    /**
     * Get the singleton instance
     * 
     * @returns {Promise} A Promise, which its value is the UserRepo instance
     */
    geInstance: function () {
      if (!mPortfolioRepoInstance) {
        mPortfolioRepoInstance = createInstance();
      }
      return mPortfolioRepoInstance;
    }
  };
})();


export {
  PortfolioRepo,
  PortfolioRepoSingleton
}