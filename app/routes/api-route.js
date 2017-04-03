'use strict';
module.exports = function apiRouteFactory(
		
		authenticationRoute
	){
    
    // Requires
    let express	= require('express');
    let router	= express.Router();

    // Route: API root ///////////////////////

    // Greet the curious one
    router.get('/', function(req, res){
        res.send('Hello, welcome to server API.');
    });


    // Route: authentication /////////////////
		
	router.use('/authenticate', authenticationRoute);

	
    // Authentication required from here /////
    //router.use(authMiddleware);

    return router;
}