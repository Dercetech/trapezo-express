'use strict';
module.exports = function revokeCheckMiddlewareFactory(config){

    return function revokeCheckMiddleware(req, res, next){
       next();
    };
}