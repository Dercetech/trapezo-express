'use strict';
module.exports = function configure(injector) {

	// Base routes of the application
	injector.register('routes', require('./routes'));
	
	{
        // 404 handler
        injector.register('fourOhFourHandler', require('./handlers/404-handler'));
	}


	// API route
    injector.register('apiRoute', require('./api/api-route'));
    {
        // Route: Authentication
        injector.register('authenticationRoute', require('./api/core-routes/authentication-route'));

        // Custom routes
    }
};