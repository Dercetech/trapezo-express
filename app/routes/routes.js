'use strict';
module.exports = function routesFactory(
		apiRoute,
		fourOhFourHandler
	){

    let express     = require('express');
    let path        = require('path');
	
	function registerExternalRoutes(expressApp, externalRoutes){
		for (var route of externalRoutes) {
			expressApp.use(route.endpoint, route.router);
		}
	}
	
    function configureRoutes(expressApp){

		// Static content - should upgrade Trapezo to provide true server root
		let pathToSite = path.join(__dirname, '..', '..', 'public', 'www');
		expressApp.use(/*"/",*/express.static(pathToSite));

		// Init the app
		/*expressApp.get('/', (req, res) => {
			res.send("Hello, curious one!");
		});*/
		
	    // API
	    expressApp.use('/api', apiRoute);
		
		// Finally, default to 404
		expressApp.use(fourOhFourHandler);
    }

    return {
		registerExternalRoutes	: registerExternalRoutes,
		configureRoutes			: configureRoutes
	};
}