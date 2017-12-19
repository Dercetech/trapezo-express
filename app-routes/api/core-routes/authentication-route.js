'use strict';
module.exports = function authenticationRouteFactory(authenticationHandler){

    // Requires
    const express	= require('express');
    const router = express.Router();

	// Authentication endpoint
    router.get('/', (req, res) => { res.send("Klaatu barada nikto!") });
	
    // Authentication endpoint
    router.post('/', authenticationHandler);

    return router;
};