'use strict';
module.exports = function revokeCheckMiddlewareFactory(revokeList){

	let list = revokeList.getList();
	
    return function revokeCheckMiddleware(req, res, next){
		
		// If authentication happened, refresh revokation list from server (to be disabled on auth microservice in prod, endable on project stub)
		console.log('>>>>>> ' + res.get('Authorization') );
		
		
		let user = req.decodedToken.user;
		if(revokeList[user]) {
			res.status(401).send("token has expired");
		}
		else next();
    };
}