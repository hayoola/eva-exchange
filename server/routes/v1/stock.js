'use strict';

//import config from '../../../config/index.js';
// eslint-disable-next-line no-unused-vars
import { UserRepo, UserRepoSingleton } from '../../../model/user-repo.js';
// eslint-disable-next-line no-unused-vars
import { StockRepo, StockRepoSingleton } from '../../../model/stock-repo.js';
// eslint-disable-next-line no-unused-vars
import { PortfolioRepo, PortfolioRepoSingleton } from '../../../model/portfolio-repo.js';
import { addCorsOptions } from '../../utils.js';


const FALSE = false;




/**
 * The route-handler module entry-point
 * @param {import('fastify').FastifyInstance} inFastifyInstance 
 * @param {*} inOptions 
*/
// eslint-disable-next-line no-unused-vars
async function routes (inFastifyInstance, inOptions) {


  //===================================== /stock/buy
  const buyPostOptions = {
    schema: {
      body: {
        type: 'object',
        required: [
          'portfolio_id',
          'symbol',
          'shares_num',
          'rate'
        ],
        properties: {
          portfolio_id: { type: 'string' },
          symbol: { type: 'string' },
          shares_num: { type: 'integer' },
          rate: { type: 'number', "multipleOf" : 0.01 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' }
          }
        }
      }
  
    }
  };
  addCorsOptions( '/stock/buy', inFastifyInstance, `POST` );
  inFastifyInstance.post('/stock/buy', buyPostOptions, async (inRequest, inReply) => {

    let responseBody = {};
    inReply.header("Access-Control-Allow-Origin", "*");
    inReply.header("Access-Control-Allow-Methods", "POST");
    inReply.header("Access-Control-Allow-Headers", "*");

    const requestBody = inRequest.body;


    try {

      do {

        /**
         * @type {PortfolioRepo}
         */
        const portfolioRepo = await PortfolioRepoSingleton.geInstance();
        if( !portfolioRepo ) {
          responseBody = new Error(`Can't get an instance of the PortfolioRepo class`);
          break;
        }

        
        const transactionLog = await portfolioRepo.buy(
          requestBody.portfolio_id,
          requestBody.symbol,
          requestBody.shares_num,
          requestBody.rate
        );
        
        if( !transactionLog ) {
          responseBody = new Error(`The buy operation failed!`);
          break;
        }

        responseBody.ok = true;

      } while( FALSE );
    
    } catch( inError ) {

      inReply.code(400);
      responseBody = inError;
    }


    inReply.send(responseBody);


  });





  //===================================== /stock/sell
  const sellPostOptions = {
    schema: {
      body: {
        type: 'object',
        required: [
          'portfolio_id',
          'symbol',
          'shares_num',
          'rate'
        ],
        properties: {
          portfolio_id: { type: 'string' },
          symbol: { type: 'string' },
          shares_num: { type: 'integer' },
          rate: { type: 'number', "multipleOf" : 0.01 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' }
          }
        }
      }
  
    }
  };
  addCorsOptions( '/stock/sell', inFastifyInstance, `POST` );
  inFastifyInstance.post('/stock/sell', sellPostOptions, async (inRequest, inReply) => {

    let responseBody = {};
    inReply.header("Access-Control-Allow-Origin", "*");
    inReply.header("Access-Control-Allow-Methods", "POST");
    inReply.header("Access-Control-Allow-Headers", "*");

    const requestBody = inRequest.body;


    try {

      do {

        /**
         * @type {PortfolioRepo}
         */
        const portfolioRepo = await PortfolioRepoSingleton.geInstance();
        if( !portfolioRepo ) {
          responseBody = new Error(`Can't get an instance of the PortfolioRepo class`);
          break;
        }

        
        const transactionLog = await portfolioRepo.sell(
          requestBody.portfolio_id,
          requestBody.symbol,
          requestBody.shares_num,
          requestBody.rate
        );
        
        if( !transactionLog ) {
          responseBody = new Error(`The sell operation failed!`);
          break;
        }

        responseBody.ok = true;

      } while( FALSE );
    
    } catch( inError ) {

      inReply.code(400);
      responseBody = inError;
    }


    inReply.send(responseBody);


  });





  //===================================== /stock/shares/query
  const sharesPostOptions = {
    schema: {
      body: {
        type: 'object',
        required: [
          'portfolio_id',
          'symbol'
        ],
        properties: {
          portfolio_id: { type: 'string' },
          symbol: { type: 'string' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            shares_num: { type: 'integer' }
          }
        }
      }
  
    }
  };
  addCorsOptions( '/stock/shares/query', inFastifyInstance, `POST` );
  inFastifyInstance.post('/stock/shares/query', sharesPostOptions, async (inRequest, inReply) => {

    let responseBody = {};
    inReply.header("Access-Control-Allow-Origin", "*");
    inReply.header("Access-Control-Allow-Methods", "POST");
    inReply.header("Access-Control-Allow-Headers", "*");

    const requestBody = inRequest.body;


    try {

      do {

        /**
         * @type {PortfolioRepo}
         */
        const portfolioRepo = await PortfolioRepoSingleton.geInstance();
        if( !portfolioRepo ) {
          responseBody = new Error(`Can't get an instance of the PortfolioRepo class`);
          break;
        }

        
        const numOfShares = await portfolioRepo.computePortfolioStockShares(
          requestBody.portfolio_id,
          requestBody.symbol,
        );
        

        responseBody.shares_num = numOfShares;

      } while( FALSE );
    
    } catch( inError ) {

      inReply.code(400);
      responseBody = inError;
    }


    inReply.send(responseBody);


  });




  //===================================== /portfolios/query
  const portfoliosPostOptions = {
    schema: {
      
      /*
      response: {
        200: {
          type: 'object'
        }
      }
      */
      
    }
  };
  addCorsOptions( '/portfolios/query', inFastifyInstance, `POST` );
  inFastifyInstance.post('/portfolios/query', portfoliosPostOptions, async (inRequest, inReply) => {


    let responseBody = {};
    inReply.header("Access-Control-Allow-Origin", "*");
    inReply.header("Access-Control-Allow-Methods", "POST");
    inReply.header("Access-Control-Allow-Headers", "*");


    try {

      do {

        /**
         * @type {PortfolioRepo}
         */
        const portfolioRepo = await PortfolioRepoSingleton.geInstance();
        if( !portfolioRepo ) {
          responseBody = new Error(`Can't get an instance of the PortfolioRepo class`);
          break;
        }

        
        const portfolios = await portfolioRepo.queryPortfolios();
        responseBody.portfolios = portfolios;

      } while( FALSE );
    
    } catch( inError ) {

      inReply.code(400);
      responseBody = inError;
    }


    inReply.send(responseBody);


  });


}



export {routes};