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
        19.23
      );
      expect(transactionLog).not.null;

    });

  });



  describe('#computePortfolioStockShares tests', function() {

    it('should compute a single buy', async function() {

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
        18.65
      );
      expect(transactionLog1).not.null;

      const transactionLog2 = await mPortfolioRepo.buy(
        portfolioModel.id,
        symbol,
        4,
        21.19
      );
      expect(transactionLog2).not.null;

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
        17.11
      );
      expect(transactionLog1).not.null;

      const wasSold = await mPortfolioRepo.sell(
        portfolioModel.id,
        symbol,
        6,
        17.45
      );
      expect(wasSold).to.be.true;

      const numOfShares = await mPortfolioRepo.computePortfolioStockShares(
        portfolioModel.id,
        symbol
      );
      expect(numOfShares).eqls(10);

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




});