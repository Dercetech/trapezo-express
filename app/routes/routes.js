'use strict';
module.exports = function configureRoutesFactory(
		use404Route
	){

    var express     = require('express');
    var path        = require('path');

    function configureRoutes(expressApp){

		// Static content - should upgrade Trapezo to provide true server root
		var pathToSite = path.join(__dirname, '..', '..', 'public', 'www');
		expressApp.use(/*"/",*/express.static(pathToSite));

		// Init the app
		/*expressApp.get('/', (req, res) => {
			res.send("Hello, curious one!");
		});*/

	    // Api
	    //expressApp.use('/api', apiRoute);

		// Finally, default to 404
		use404Route(expressApp);
    }

    return configureRoutes;
}