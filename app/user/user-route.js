'use strict';
module.exports = function userRouteFactory(){

    // Requires
    let express	= require('express');
    let router = express.Router();

	// Users endpoint
    router.get('/', (req, res) => { res.send("Klaatu barada nikto!") });

    return router;
}