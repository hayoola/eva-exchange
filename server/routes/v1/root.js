'use strict';

import config from '../../../config/index.js';


/**
 * The route-handler module entry-point
 * @param {import('fastify').FastifyInstance} inFastifyInstance 
 * @param {*} inOptions 
*/
// eslint-disable-next-line no-unused-vars
async function routes (inFastifyInstance, inOptions) {
  
  
  const theGetOptions = {
    schema: {
      params: {
        type: 'object',
        // required: ['name'],
        properties: {
          name: { 
            type: 'string' ,
            //default: ''
          }
        }
      },
      query: {
        type: 'object',
        password: { type: 'string'}
      },
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' },
            host: { type: 'string'}
          }
        }
      }
  
    }
  };
  
  
  // eslint-disable-next-line no-unused-vars
  inFastifyInstance.get('/:name', theGetOptions, async (inRequest, outReply) => {
    
    let theResponse = { hello: 'world'};
    let theHeaders = inRequest.headers;

    // config.loggman.info(`The Headers: `, theHeaders);
    config.loggman.info(`The route params:`, inRequest.params);
    config.loggman.info(`The route queries:`, inRequest.query);
    if( theHeaders.host ) {
      config.loggman.info(`Yes the host header was set: ${theHeaders.host}`);
      
      if(! theHeaders.host.startsWith(`localhost`) ) {
        theResponse.host = theHeaders.host;
      }
    }
    
    return theResponse;
  });



  const thePostOptions = {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          cell: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        }
      }
  
    }
  };

  // eslint-disable-next-line no-unused-vars
  inFastifyInstance.post('/', thePostOptions, async (inRequest, outReply) => {

    let theResponse = {};
    // let theHeaders = inRequest.headers;
    // config.loggman.info(`The Post Headers: `, theHeaders);

    let theBody = inRequest.body;
    // config.loggman.info(`The Post Body: `, theBody);
    theResponse = {
      hello: theBody.name
    }

    return theResponse;
  });

}


export {routes};