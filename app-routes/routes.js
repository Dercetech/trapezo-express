'use strict';
module.exports = function routesFactory(
		apiRoute,
		fourOhFourHandler
	){

    const express     = require('express');
    const path        = require('path')

	function registerExternalRoutes(expressApp, externalRoutes){
		for (let route of externalRoutes) {
			expressApp.use(route.endpoint, route.router);
		}
	}
	
    function configureRoutes(expressApp){

		// Static content - should upgrade Trapezo to provide true server root
		let pathToSite = path.join(__dirname, '..', 'public', 'www');
		expressApp.use(/*"/",*/express.static(pathToSite));

		expressApp.get('/', (req, res) => {
			res.json({});
		});
		
	    // API
	    expressApp.use('/api', apiRoute);
		
		// Finally, default to 404
		expressApp.use(fourOhFourHandler);
    }

    return {
		registerExternalRoutes	: registerExternalRoutes,
		configureRoutes			: configureRoutes
	};
};