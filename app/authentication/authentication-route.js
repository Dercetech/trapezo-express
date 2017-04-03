'use strict';
module.exports = function authenticationRouteFactory(authenticationHandler){

    // Requires
    let express	= require('express');
    let router = express.Router();

    // Ensure the "engine" role is granted
    //router.use(roleCheckMiddleware('admin'));

	// Authentication endpoint
    router.get('/', (req, res) => { res.send("Klaatu barada nikto!") });
	
    // Authentication endpoint
    router.post('/', authenticationHandler);


    return router;
}