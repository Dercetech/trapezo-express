'use strict';
module.exports = function apiRouteFactory(

		// Token handling
		authenticationTokenDecode,
		authenticationTokenCheck,
		authenticationTokenRoles,
		
		// Revocation
		// revokeCheck,				// moved to external dependency - too much overhead for the auth µService
		
		// Routes
		authenticationRoute,
		userRoute,

        // Templates
        genericUploadHandler
	){
    
    // Requires
    const express	= require('express');
    const router	= express.Router();

    // Route: API root

    // Greet the curious one
    router.get('/', function(req, res){
        res.send('Hello, welcome to server API.');
    });
	
	
    // Route: authentication
	router.use('/authenticate', authenticationRoute);

	// Template: upload
    router.use('/upload', genericUploadHandler);


    // Tokens are expected from here /////////
    router.use(authenticationTokenDecode);
	
    // Authentication required from here /////
    router.use(authenticationTokenCheck);

    // User management
    router.use('/users', userRoute);


    return router;
};