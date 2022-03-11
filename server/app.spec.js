'use strict';

import config from '../config/index.js';
import { expect } from 'chai';
import sinon from 'sinon';
import { build } from './app.js';
// eslint-disable-next-line no-unused-vars
import { fastify } from 'fastify';
// eslint-disable-next-line no-unused-vars
const { FastifyInstance, FastifyLoggerInstance} = fastify;

// eslint-disable-next-line no-unused-vars
import { UserRepo, UserRepoSingleton } from '../model/user-repo.js';
// eslint-disable-next-line no-unused-vars
import { StockRepo, StockRepoSingleton } from '../model/stock-repo.js';
// eslint-disable-next-line no-unused-vars
import { PortfolioRepo, PortfolioRepoSingleton } from '../model/portfolio-repo.js';
import { SequelizeSingleton } from '../model/foundation/sequalize.js';




describe('Server Test Suites', () => {
    
  /**
   * @type FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>
  */
  let mApp = null;


  
  before( async function () {

    mApp = await build();
    if( !mApp ) {
      config.loggman.error(`The server instance is not available!`);
      this.skip();
    }

  });



  describe('#Route /', function() {

    it(`should respond correctly on the route '/' w/o the 'host' header`, async function() {

      const theResponse = await mApp.inject({
        method: 'GET',
        url: '/v1/'
      });

      config.loggman.info(`The Body: ${theResponse.body}`);
      expect(theResponse.statusCode).eqls(200);
      expect(theResponse.body).eqls( JSON.stringify(
        { 
          hello: 'world'
        }
      ));

    });


    it(`should respond correctly on the route '/' with the 'host' header`, async function() {

      const theHost = `hayoola.domain`;
      const theResponse = await mApp.inject({
        method: 'GET',
        url: '/v1/?name=hayoola',
        headers: {
          'Host': theHost
        }
      });

      config.loggman.info(`The Body: ${theResponse.body}`);
      expect(theResponse.statusCode).eqls(200);
      expect(theResponse.body).eqls( JSON.stringify(
        { 
          hello: 'world',
          host: theHost
        }
      ));

    });



    it(`should respond correctly on the route '/' with the POST method`, async function() {

      const theBody = {
        name: `Hayoola Geda`,
        cell: `0912558866`
      };

      const theResponse = await mApp.inject({
        method: 'POST',
        url: '/v1/',
        body: theBody
      });

      //config.loggman.info(`The Body: ${theResponse.body}`);
      expect(theResponse.statusCode).eqls(200);
      expect(theResponse.body).eqls( JSON.stringify(
        { 
          hello: theBody.name
        }
      ));

    });

  });



  describe('#Route /stock/buy', function() {

    /**
     * @type {PortfolioRepo}
    */
    let mPortfolioRepo;

    /**
     * @type {UserRepo}
    */
    let mUserRepo;


    /**
     * @type {StockRepo}
    */
    let mStockRepo;


    beforeEach( async function() {

      mUserRepo = await UserRepoSingleton.geUserRepoInstance();
      if( !mUserRepo ) {
        config.loggman.error(`can't create a UserRepo instance`);
        this.skip();
      }
      await mUserRepo.syncSchemaWithDatabase();
  
      mStockRepo = await StockRepoSingleton.geInstance();
      if( !mStockRepo ) {
        config.loggman.error(`can't create a StockRepo instance`);
        this.skip();
      }
      await mStockRepo.syncSchemaWithDatabase();
      
      mPortfolioRepo = await PortfolioRepoSingleton.geInstance();
      if( !mPortfolioRepo ) {
        config.loggman.error(`can't create a PortfolioRepo instance`);
        this.skip();
      }
      await mPortfolioRepo.syncSchemaWithDatabase();
  
    });


    afterEach( async function() {

      sinon.restore();
      if( !mPortfolioRepo ) this.skip();
  
      /**
       * @type {Sequelize}
      */
      const sequalize = await SequelizeSingleton.getInstance();
      await sequalize.drop();
  
    });


    it('should call /stock/buy with a registered stock normally without error', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const numOfSharesToBuy = 16;
      const rateOfBuy = 19.23;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      // Now do the fun stuff!
      const requestBody = {
        portfolio_id: portfolioModel.id,
        symbol: symbol,
        shares_num: numOfSharesToBuy,
        rate: rateOfBuy
      };

      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/stock/buy',
        body: requestBody
      });

      expect(response.statusCode).eqls(200);

      // Check the stock's rate got updated
      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(rateOfBuy);


    });



    it('should call /stock/buy on a not-registered stock returns bad request', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const numOfSharesToBuy = 16;
      const rateOfBuy = 19.23;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      // Now do the fun stuff!
      const requestBody = {
        portfolio_id: portfolioModel.id,
        symbol: 'SYM',
        shares_num: numOfSharesToBuy,
        rate: rateOfBuy
      };

      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/stock/buy',
        body: requestBody
      });

      expect(response.statusCode).eqls(400);

    });


    it('should call /stock/buy on a not-registered portfolio returns bad request', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const numOfSharesToBuy = 16;
      const rateOfBuy = 19.23;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      // Now do the fun stuff!
      const requestBody = {
        portfolio_id: 'dummy_id',
        symbol: symbol,
        shares_num: numOfSharesToBuy,
        rate: rateOfBuy
      };

      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/stock/buy',
        body: requestBody
      });

      expect(response.statusCode).eqls(400);

    });


    it('should call /stock/buy with an invalid rate format (2 decimal digits) returns bad request', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const numOfSharesToBuy = 16;
      const rateOfBuy = 19.236;   // Invalid rate format! It should have only 2 decimal digits
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      // Now do the fun stuff!
      const requestBody = {
        portfolio_id: portfolioModel.id,
        symbol: symbol,
        shares_num: numOfSharesToBuy,
        rate: rateOfBuy
      };

      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/stock/buy',
        body: requestBody
      });

      expect(response.statusCode).eqls(400);

    });


  });


  describe('#Route /stock/sell', function() {

    /**
     * @type {PortfolioRepo}
    */
    let mPortfolioRepo;

     /**
      * @type {UserRepo}
     */
     let mUserRepo;
 
 
     /**
      * @type {StockRepo}
     */
     let mStockRepo;

     beforeEach( async function() {

      mUserRepo = await UserRepoSingleton.geUserRepoInstance();
      if( !mUserRepo ) {
        config.loggman.error(`can't create a UserRepo instance`);
        this.skip();
      }
      await mUserRepo.syncSchemaWithDatabase();
  
      mStockRepo = await StockRepoSingleton.geInstance();
      if( !mStockRepo ) {
        config.loggman.error(`can't create a StockRepo instance`);
        this.skip();
      }
      await mStockRepo.syncSchemaWithDatabase();
      
      mPortfolioRepo = await PortfolioRepoSingleton.geInstance();
      if( !mPortfolioRepo ) {
        config.loggman.error(`can't create a PortfolioRepo instance`);
        this.skip();
      }
      await mPortfolioRepo.syncSchemaWithDatabase();
  
    });


    afterEach( async function() {

      sinon.restore();
      if( !mPortfolioRepo ) this.skip();
  
      /**
       * @type {Sequelize}
      */
      const sequalize = await SequelizeSingleton.getInstance();
      await sequalize.drop();
  
    });


    it('should call /stock/sell with a registered stock normally without error', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const numOfSharesToBuy = 16;
      const numOfSharesToSell = 9;
      const rateOfBuy = 19.23;
      const rateOSell = 17.11;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      const transactionLog1 = await mPortfolioRepo.buy(
        portfolioModel.id,
        symbol,
        numOfSharesToBuy,
        rateOfBuy
      );
      expect(transactionLog1).not.null;

      // Now do the fun stuff!
      const requestBody = {
        portfolio_id: portfolioModel.id,
        symbol: symbol,
        shares_num: numOfSharesToSell,
        rate: rateOSell
      };

      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/stock/sell',
        body: requestBody
      });

      expect(response.statusCode).eqls(200);

      // Check the stock's rate got updated
      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(rateOSell);

      // Check the remaining num of shares
      const numOfRemainingShares = await mPortfolioRepo.computePortfolioStockShares(
        portfolioModel.id,
        symbol
      );
      expect(numOfRemainingShares).eqls(numOfSharesToBuy - numOfSharesToSell);

    });



  });


  
  describe('#Route /stock/shares/query', function() {

    /**
     * @type {PortfolioRepo}
    */
    let mPortfolioRepo;

    /**
    * @type {UserRepo}
    */
    let mUserRepo;


    /**
    * @type {StockRepo}
    */
    let mStockRepo;

    beforeEach( async function() {

      mUserRepo = await UserRepoSingleton.geUserRepoInstance();
      if( !mUserRepo ) {
        config.loggman.error(`can't create a UserRepo instance`);
        this.skip();
      }
      await mUserRepo.syncSchemaWithDatabase();
  
      mStockRepo = await StockRepoSingleton.geInstance();
      if( !mStockRepo ) {
        config.loggman.error(`can't create a StockRepo instance`);
        this.skip();
      }
      await mStockRepo.syncSchemaWithDatabase();
      
      mPortfolioRepo = await PortfolioRepoSingleton.geInstance();
      if( !mPortfolioRepo ) {
        config.loggman.error(`can't create a PortfolioRepo instance`);
        this.skip();
      }
      await mPortfolioRepo.syncSchemaWithDatabase();
  
    });


    afterEach( async function() {

      sinon.restore();
      if( !mPortfolioRepo ) this.skip();
  
      /**
       * @type {Sequelize}
      */
      const sequalize = await SequelizeSingleton.getInstance();
      await sequalize.drop();
  
    });



    it('should call /stock/shares/query after a buy and sell', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const numOfSharesToBuy = 16;
      const numOfSharesToSell = 9;
      const rateOfBuy = 19.23;
      const rateOfSell = 17.11;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      const transactionLog1 = await mPortfolioRepo.buy(
        portfolioModel.id,
        symbol,
        numOfSharesToBuy,
        rateOfBuy
      );
      expect(transactionLog1).not.null;

      const transactionLog2 = await mPortfolioRepo.sell(
        portfolioModel.id,
        symbol,
        numOfSharesToSell,
        rateOfSell
      );
      expect(transactionLog2).not.null;

      // Now do the fun stuff!
      const requestBody = {
        portfolio_id: portfolioModel.id,
        symbol: symbol,
      };

      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/stock/shares/query',
        body: requestBody
      });

      expect(response.statusCode).eqls(200);
      
      const bodyObject = JSON.parse(response.body);
      expect(bodyObject).not.undefined;
      expect(bodyObject.shares_num).eqls(numOfSharesToBuy - numOfSharesToSell);

    });


  });




  describe('#Route /portfolios/query', function() {

    /**
     * @type {PortfolioRepo}
    */
    let mPortfolioRepo;

    /**
     * @type {UserRepo}
     */
    let mUserRepo;

    /**
      * @type {StockRepo}
    */
    let mStockRepo;

    beforeEach( async function() {

      mUserRepo = await UserRepoSingleton.geUserRepoInstance();
      if( !mUserRepo ) {
        config.loggman.error(`can't create a UserRepo instance`);
        this.skip();
      }
      await mUserRepo.syncSchemaWithDatabase();
  
      mStockRepo = await StockRepoSingleton.geInstance();
      if( !mStockRepo ) {
        config.loggman.error(`can't create a StockRepo instance`);
        this.skip();
      }
      await mStockRepo.syncSchemaWithDatabase();
      
      mPortfolioRepo = await PortfolioRepoSingleton.geInstance();
      if( !mPortfolioRepo ) {
        config.loggman.error(`can't create a PortfolioRepo instance`);
        this.skip();
      }
      await mPortfolioRepo.syncSchemaWithDatabase();
  
    });


    afterEach( async function() {

      sinon.restore();
      if( !mPortfolioRepo ) this.skip();
  
      /**
       * @type {Sequelize}
      */
      const sequalize = await SequelizeSingleton.getInstance();
      await sequalize.drop();
  
    });

    it( 'should returns currently registered portfolios', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).not.null;

      const userName = 'Bob';
      const userModel = await mUserRepo.registerUser( userName);
      expect(userModel).not.null;
      expect(userModel).not.undefined;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      // Now do the fun stuff!
      const response = await mApp.inject({
        method: 'POST',
        url: '/v1/portfolios/query',
      });

      expect(response.statusCode).eqls(200);
      const bodyObject = JSON.parse(response.body);
      expect(bodyObject).not.undefined;
      expect(bodyObject.portfolios.length).eqls(1);
      expect(bodyObject.portfolios[0].id).eqls(portfolioModel.id);

    });

  });
  

});