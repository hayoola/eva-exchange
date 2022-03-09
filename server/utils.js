'use strict';





/**
 * Add an 'OPTIONS' method handler to the inRoute for 
 *  managing 'CORS'
 * @param {string} inRoute 
 * @param {import('fastify').FastifyInstance} inFastifyInstance 
 * @returns void
*/
function addCorsOptions(
  inRoute,
  inFastifyInstance,
  inMethod
) {

  inFastifyInstance.options(inRoute, async (inRequest, inReply) => {

    let theResponseBody = {};
    const theMethod = inMethod ? inMethod : `POST`;
    
    inReply.header("Allow", `OPTIONS, ${theMethod}`);
    inReply.header("Access-Control-Allow-Origin", "*");
    inReply.header("Access-Control-Allow-Methods", theMethod);
    
    inReply.header("Access-Control-Allow-Headers", "*");

    inReply.send(theResponseBody);

  });

}








export {
  addCorsOptions
};