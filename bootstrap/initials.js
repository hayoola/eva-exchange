'use strict';

import config from '../config/index.js';
// eslint-disable-next-line no-unused-vars
import { UserRepo, UserRepoSingleton } from '../model/user-repo.js';
// eslint-disable-next-line no-unused-vars
import { StockRepo, StockRepoSingleton } from '../model/stock-repo.js';
// eslint-disable-next-line no-unused-vars
import { PortfolioRepo, PortfolioRepoSingleton } from '../model/portfolio-repo.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize } from 'sequelize';
import { SequelizeSingleton } from '../model/foundation/sequalize.js';



const FALSE = false;


// Sample invocation: `npm run bootstrap`



console.log(`
=========================================
    Eva bootstrapping script
=========================================\n\n`
);

main()
.then( () => {
    config.loggman.debug(`The script finished normally.`);
})
.catch( (inError) => {
    config.loggman.error(`An error occurred in the script: ${inError}`);
});



async function main() {

  config.loggman.debug(`The main begins...`);

  /**
   * @type {Sequelize}
  */
  let mSequelize = null;

  try {

    

    do {


      mSequelize = await SequelizeSingleton.getInstance();
      if( !mSequelize ) {
        throw new Error('Sequelize instance is null!');
      }

      /**
       * @type {UserRepo}
      */
      const mUserRepo = await UserRepoSingleton.geUserRepoInstance();

      /**
       * @type {StockRepo}
       */
      const mStockRepo = await StockRepoSingleton.geInstance();

      /**
       * @type {PortfolioRepo}
      */
      const mPortfolioRepo = await PortfolioRepoSingleton.geInstance();

      // Make sure there is nothing remained in the DB
      await mSequelize.drop();

      
      await mUserRepo.syncSchemaWithDatabase();
      await mStockRepo.syncSchemaWithDatabase();
      await mPortfolioRepo.syncSchemaWithDatabase();

      const userModels = await mUserRepo.bulkRegisterUser([
        'Bob',
        'Jane',
        'Ruby',
        'Lucy',
        'Robert'
      ]);
      const userIDs = userModels.map( (inElement) => inElement.id);

      await mStockRepo.bulkRegisterStock([
        'APL',
        'NZD',
        'NYK',
        'BJO',
        'KUV'
      ]);


      const portfolioModels = await mPortfolioRepo.bulkRegisterPortfolio(userIDs);
      const portfolioIDs = portfolioModels.map( (inElement) => inElement.id);

      let didBuy, didSell;

      didBuy = await mPortfolioRepo.buy(
        portfolioIDs[0],
        'APL',
        20,
        18.35
      );
      if(!didBuy) throw new Error(`Can't buy: portfolio: ${portfolioIDs[0]}`);
      didSell = await mPortfolioRepo.sell(
        portfolioIDs[0],
        'APL',
        5,
        21.80
      );
      if(!didSell) throw new Error(`Can't sell portfolio: ${portfolioIDs[0]}`);

      didBuy = await mPortfolioRepo.buy(
        portfolioIDs[1],
        'NZD',
        36,
        10.01
      );
      if(!didBuy) throw new Error(`Can't buy: portfolio: ${portfolioIDs[1]}`);
      didSell = await mPortfolioRepo.sell(
        portfolioIDs[1],
        'NZD',
        15,
        22.15
      );
      if(!didSell) throw new Error(`Can't sell portfolio: ${portfolioIDs[1]}`);


      didBuy = await mPortfolioRepo.buy(
        portfolioIDs[2],
        'NYK',
        29,
        10.01
      );
      if(!didBuy) throw new Error(`Can't buy: portfolio: ${portfolioIDs[2]}`);
      didSell = await mPortfolioRepo.sell(
        portfolioIDs[2],
        'NYK',
        10,
        22.15
      );
      if(!didSell) throw new Error(`Can't sell portfolio: ${portfolioIDs[2]}`);


      didBuy = await mPortfolioRepo.buy(
        portfolioIDs[2],
        'BJO',
        45,
        10.01
      );
      if(!didBuy) throw new Error(`Can't buy: portfolio: ${portfolioIDs[3]}`);
      didSell = await mPortfolioRepo.sell(
        portfolioIDs[2],
        'BJO',
        40,
        9.12
      );
      if(!didSell) throw new Error(`Can't sell portfolio: ${portfolioIDs[3]}`);


      didBuy = await mPortfolioRepo.buy(
        portfolioIDs[2],
        'KUV',
        13,
        10.01
      );
      if(!didBuy) throw new Error(`Can't buy: portfolio: ${portfolioIDs[4]}`);
      didSell = await mPortfolioRepo.sell(
        portfolioIDs[2],
        'KUV',
        10,
        9.12
      );
      if(!didSell) throw new Error(`Can't sell portfolio: ${portfolioIDs[4]}`);


    } while( FALSE );

  } catch( inError ) {

    config.loggman.error(`An error occurred in the 'main': ${inError}`);
    throw new Error(inError);
  
  } finally {

    if( mSequelize ) {
          
      await mSequelize.close();
    }
  }
}