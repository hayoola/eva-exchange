'use strict';

import config from '../config/index.js';
import { build } from './app.js';


//console.log('config ', config);
config.loggman.info('Welcome to EvaExchange!');
// const app = fastify({logger: true});

// eslint-disable-next-line no-unused-vars
/* app.get('/', async (request, reply) => {
  
  return { hello: 'world' };
});
*/



const start = async () => {
  
  let theApp = null;

  try {
    
    theApp = await build({logger: true});
    await theApp.listen(3000, `0.0.0.0` );
  
  } catch (err) {
    
    // app.log.error(err);
    config.loggman.error(`Error in starting the server! err: ${err}`);
    process.exit(1);
  }
}


start();

