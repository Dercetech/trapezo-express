'use strict';
module.exports = function routesFactory(
	config,
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

        // Static content - best handled by Trapezo UI!
        const pathToSite = path.join(__dirname, '..', 'public', 'www');

        expressApp.use(/*"/",*/express.static(pathToSite));

        // Let the server provide static content for this
        // expressApp.get('/', (req, res) => res.json({}) );

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