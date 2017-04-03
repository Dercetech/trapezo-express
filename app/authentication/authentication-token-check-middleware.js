'use strict';
module.exports = function authenticationTokenCheckMiddlewareFactory(config){
    
	/* Reminder: 401 vs 403
	
	Status codes 401 (Unauthorized) and 403 (Forbidden) have distinct meanings.

	A 401 response indicates that access to the resource is restricted, and the request did not provide any HTTP authentication.
	It is possible that a new request for the same resource will succeed if authentication is provided.
	The response must include an HTTP WWW-Authenticate header to prompt the user-agent to provide credentials.

	A 403 response generally indicates one of two conditions:
	-	Authentication was provided, but the authenticated user is not permitted to perform the requested operation.
	-	The operation is forbidden to all users. For example, requests for a directory listing return code 403 when directory listing has been disabled.
	
	*/
	
    return function authenticationTokenCheck(req, res, next){
        return (req.decodedToken && req.decodedToken.user) ? next() : res.sendStatus(401);
    };
}