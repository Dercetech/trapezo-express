'use strict';
module.exports = function authenticationTokenDecodeMiddlewareFactory(config, authenticationTokenGenerator){
    
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
					switch(err.name){
						
						/*
							Expired tokens, Jem asked himself: 401 or 403?
							-	The 401 (Unauthorized) status code indicates that the request has not been applied because it lacks valid authentication credentials for the target resource. The server generating a 401 response MUST send a WWW-Authenticate header field (Section 4.1) containing at least one challenge applicable to the target resource.
							-	A server that receives valid credentials that are not adequate to gain access ought to respond with the 403 (Forbidden) status code.
						*/
						
						case "TokenExpiredError" 	: res.sendStatus(401); break;		// 401: token has expired,
						default 					: res.sendStatus(400);				// 400: bad request, malformed token
					}					
				}

				else{
					
					// Add function to check presence of role
					req.tokenHasRole = function(theRole){
						return req.decodedToken.roles.indexOf(theRole) !== -1;
					}

					// Half life renewal
					let renewIn = (decoded.exp - tokenCfg.renew) - (new Date().getTime() / 1000);
					if(renewIn <= 0){
						token = authenticationTokenGenerator(decoded.id, decoded.user, decoded.roles);
						jwt.verify(token, tokenCfg.tokenSecret, (err, decoded) => {
							res.set("Authorization", token);
							req.decodedToken = decoded;
							next();
						});
					}
					
					else{
						// Save decoded token in request for other routes
						req.decodedToken = decoded;
						next();
					}
				}
			});
        }
		
		// No token provided
		else next();
    };
}