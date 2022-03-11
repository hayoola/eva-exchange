'use strict';

import config from '../config/index.js';
import { expect } from 'chai';
import * as chai from 'chai';
import * as pkg from 'chai-as-promised';
const chaiAsPromised  = pkg.default;
import sinon from 'sinon';
// eslint-disable-next-line no-unused-vars
import { PortfolioRepo, PortfolioRepoSingleton } from './portfolio-repo.js';
// eslint-disable-next-line no-unused-vars
import { UserRepo, UserRepoSingleton } from './user-repo.js';
// eslint-disable-next-line no-unused-vars
import { StockRepo, StockRepoSingleton } from './stock-repo.js';
import { SequelizeSingleton } from './foundation/sequalize.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize } from 'sequelize';


chai.use(chaiAsPromised);




describe('PortfolioRepo Test suites', function () {


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


  describe('#registerPortfolio tests', function() {

    it('should register a new portfolio correctly', async function() {

      const name = 'Bob';
      const userModel = await mUserRepo.registerUser( name);
      expect(userModel).not.null;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;

    });


    it('should bulk register two portfolios correctly', async function() {

      const names = ['Bob', 'Jane'];
      const userModels = await mUserRepo.bulkRegisterUser(names);
      expect(userModels.length).eqls(2);

      const userIDs = userModels.map( (inElement) => inElement.id);

      const portfolioModels = await mPortfolioRepo.bulkRegisterPortfolio(userIDs);
      expect( portfolioModels.length).eqls(2);

    });

  });


  describe('#portfolioByUserID tests', function() {

    it('should return the newly registered portfolio', async function() {

      const name = 'Bob';
      const userModel = await mUserRepo.registerUser( name);
      expect(userModel).not.null;

      const portfolioModel = await mPortfolioRepo.registerPortfolio(userModel.id);
      expect( portfolioModel).not.null;
      expect( portfolioModel).not.undefined;

      const foundPortfolio = await mPortfolioRepo.portfolioByUserID(userModel.id);
      expect(foundPortfolio).not.null;
      expect(foundPortfolio.user_id).eqls(userModel.id);

    });
  });


  describe('#buy tests', function() {

    it('should buy a registered stock normally without error', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
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

      const transactionLog = await mPortfolioRepo.buy(
        portfolioModel.id,
        symbol,
        16,
        rateOfBuy
      );
      expect(transactionLog).not.null;

      // Check the stock's rate got updated
      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(rateOfBuy);

    });

  });



  describe('#computePortfolioStockShares tests', function() {

    it('should compute a single buy', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const rateOfBuy_1 = 18.65;
      const rateOfBuy_2 = 21.19;
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
        16,
        rateOfBuy_1
      );
      expect(transactionLog1).not.null;

      const transactionLog2 = await mPortfolioRepo.buy(
        portfolioModel.id,
        symbol,
        4,
        rateOfBuy_2
      );
      expect(transactionLog2).not.null;

      // Check the stock's rate got updated
      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(rateOfBuy_2);

      const numOfShares = await mPortfolioRepo.computePortfolioStockShares(
        portfolioModel.id,
        symbol
      );
      expect(numOfShares).eqls(20);

    });

  });




  describe('#sell tests', function() {

    it('should sell a newly bought share', async function() {

      const symbol = 'APL';
      const initialRate = 12.56;
      const rateOfBuy = 15.54;
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
        16,
        rateOfBuy
      );
      expect(transactionLog1).not.null;

      const wasSold = await mPortfolioRepo.sell(
        portfolioModel.id,
        symbol,
        6,
        rateOSell
      );
      expect(wasSold).to.be.true;

      const numOfShares = await mPortfolioRepo.computePortfolioStockShares(
        portfolioModel.id,
        symbol
      );
      expect(numOfShares).eqls(10);

      // Check the stock's rate got updated
      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(rateOSell);

    });


    it('should prevent the sell of more than owning shares', async function() {

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

      const transactionLog1 = await mPortfolioRepo.buy(
        portfolioModel.id,
        symbol,
        16,
        17.16
      );
      expect(transactionLog1).not.null;

      const wasSold = await mPortfolioRepo.sell(
        portfolioModel.id,
        symbol,
        20,
        18.10
      );
      expect(wasSold).to.be.false;

    });

  });



  describe('#queryPortfolios tests', function() {

    it('should return the list of portfolios', async function() {

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

      const portfolioArray = await mPortfolioRepo.queryPortfolios();
      expect(portfolioArray).not.undefined;
      expect(portfolioArray.length).eqls(1);
      expect(portfolioArray[0].id).eqls(portfolioModel.id);

    });

  });




});