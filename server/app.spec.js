'use strict';

import config from '../config/index.js';
import { expect } from 'chai';
import { build } from './app.js';
// eslint-disable-next-line no-unused-vars
import { fastify } from 'fastify';
// eslint-disable-next-line no-unused-vars
const { FastifyInstance, FastifyLoggerInstance} = fastify;




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



});