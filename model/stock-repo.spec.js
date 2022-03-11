'use strict';

import config from '../config/index.js';
import { expect } from 'chai';
import * as chai from 'chai';
import * as pkg from 'chai-as-promised';
const chaiAsPromised  = pkg.default;
import sinon from 'sinon';
// eslint-disable-next-line no-unused-vars
import { StockRepo, StockRepoSingleton } from './stock-repo.js';
import { SequelizeSingleton } from './foundation/sequalize.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize } from 'sequelize';


chai.use(chaiAsPromised);




describe('StockRepo Test suites', function () {


  /**
   * @type {StockRepo}
   */
  let mStockRepo;

  beforeEach( async function() {

    mStockRepo = await StockRepoSingleton.geInstance();
    if( !mStockRepo ) {
      config.loggman.error(`can't create a StockRepo instance`);
      this.skip();
    }
    await mStockRepo.syncSchemaWithDatabase();
  });




  afterEach( async function() {

    sinon.restore();
    if( !mStockRepo ) this.skip();

    /**
     * @type {Sequelize}
    */
    const sequalize = await SequelizeSingleton.getInstance();
    await sequalize.drop();

  });


  describe('#registerStock tests', function() {

    it('should reject if input symbol is not all uppercase', async function() {

      const symbol = 'APl';
      const initialRate = 12.568;
      const name = 'Apple Inc.';

      await expect( mStockRepo.registerStock( symbol, initialRate, name))
      .to.be.rejectedWith(/isUppercase on symbol failed/);
    })
    
    it('should register a new stock with initial rate', async function() {

      const symbol = 'APL';
      const initialRate = 12.568;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel.symbol).eqls(symbol);
      expect(stockModel.last_rate_id).eqls(1);
    });

  });


  describe('#latestStockRate tests', function() {

    it('should return the initial rate', async function() {

      const symbol = 'APL';
      const initialRate = 12.568;
      const initialRate_twoDecimals = 12.57;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).to.not.null;

      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(initialRate_twoDecimals);

    });
  });


  describe('#updateStockRate tests', function() {

    it('should update the stock rate correctly - one update', async function() {

      const symbol = 'APL';
      const initialRate = 12.568;
      const latestRate = 8.16;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).to.not.null;

      const didUpdate = await mStockRepo.updateStockRate( symbol, latestRate);
      expect(didUpdate).to.be.true;

      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(latestRate);

    });


    it('should update the stock rate correctly - two updates', async function() {

      const symbol = 'APL';
      const initialRate = 12;
      const middleRate = 19.23;
      const latestRate = 8.16;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).to.not.null;

      let didUpdate = await mStockRepo.updateStockRate( symbol, middleRate);
      expect(didUpdate).to.be.true;

      didUpdate = await mStockRepo.updateStockRate( symbol, latestRate);
      expect(didUpdate).to.be.true;

      const latestStockRate = await mStockRepo.latestStockRate(symbol);
      expect(latestStockRate).eqls(latestRate);

    });


    it('should return false on a non-existant stock symbol', async function () {

      const symbol = 'APL';
      const initialRate = 12.568;
      const latestRate = 8.16;
      const name = 'Apple Inc.';

      const stockModel = await mStockRepo.registerStock( symbol, initialRate, name);
      expect(stockModel).to.not.null;

      const didUpdate = await mStockRepo.updateStockRate( 'SML', latestRate);
      expect(didUpdate).to.be.false;

    });

  });

});