'use strict';
module.exports = function authenticationTokenDecodeMiddlewareFactory(config){
    
	/*
		A good artcile Jem appreciated before creating these token middlewares:
		https://dev.to/neilmadden/7-best-practices-for-json-web-tokens
	*/
	
    // Requires
    let jwt     = require('jsonwebtoken');
	
	// JOT token config
	let tokenCfg = config.security.jot;

    return function authenticationTokenDecode(req, res, next){
    
        // Obtain token using any of the following:
        // POST body, query param, x-access-token
        let token =  (req.body ? req.body.token : null) || req.query.token || req.headers['x-access-token'];

		// Raise warning in case of a decodedToken already present
		if(req.decodedToken){
			console.log('authenticationTokenDecodeMiddleware: decoded token already in place');
		}
		
        // Decode token
        if(token){
			jwt.verify(token, tokenCfg.tokenSecret, (err, decoded) => {
				
				// Error handling
				if(err){
					res.sendStatus(400);	// 400: bad request, malformed token
				}

				// Save decoded token in request for other routes
				else{
					req.decodedToken = decoded;
					next();
				}
			});
        }
		
		// No token provided
		else next();
    };
}