'use strict';
module.exports = function revokeCheckMiddlewareFactory(config){

	let revokeList = {}

    return function revokeCheckMiddleware(req, res, next){
		
		next();
    };
}