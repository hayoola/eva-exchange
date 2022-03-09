'use strict';

//import config from '../config/index.js';
import { fastify } from 'fastify';
import { HandlerFiles } from './route-handler-registry.js';
import fastifyMultipart from 'fastify-multipart';



async function build( inOpts={}) {

  //config.loggman.info('Zenith build app starts ...');

  // The dynamic way of `let theModule = await import('./routes/root.js');`
  let theImportPromises = new Array(HandlerFiles.length);

  for( let i = 0; i < HandlerFiles.length; i++ ) {
    let thePath = HandlerFiles[i].path;
    theImportPromises[i] = import(thePath )
  }

  await Promise.all( theImportPromises);

  const theApp = fastify(inOpts);

  // Upload support
  await theApp.register( fastifyMultipart);
  
  // The dynamic way of `await theApp.register( theModule.routes );`
  let theRegisterPromises = new Array(HandlerFiles.length);

  for( let i = 0; i < theRegisterPromises.length; i++ ) {
    
    // We want the 'value' of the Promise, so we have to `await`
    //  for it, despite it has been fulfilled already!
    // This await will immediately returns
    let theModule = await theImportPromises[i];
    theRegisterPromises[i] = theApp.register( theModule.routes, { prefix: HandlerFiles[i].prefix } );
  }

  await Promise.all( theRegisterPromises);

  return theApp;

}


export { build };