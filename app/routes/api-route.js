'use strict';
module.exports = function apiRouteFactory(

		// Token handling
		authenticationTokenDecode,
		authenticationTokenCheck,
		authenticationTokenRoles,
		
		// Revocation
		revokeCheck,
		
		// Routes
		authenticationRoute,
		userRoute
	){
    
    // Requires
    let express	= require('express');
    let router	= express.Router();

    // Route: API root

    // Greet the curious one
    router.get('/', function(req, res){
        res.send('Hello, welcome to server API.');
    });
	
	
    // Route: authentication
	router.use('/authenticate', authenticationRoute);
	
	
    // Tokens are expected from here /////////
    router.use(authenticationTokenDecode);

    // Token revocation zone begins //////////
    router.use(revokeCheck);	
	
    // Authentication required from here /////
    router.use(authenticationTokenCheck);
	
	
    // Route: authentication
	router.use('/users', userRoute);
	
    return router;
}