'use strict';
module.exports = function configure(injector) {

	// Routes of the application
	injector.register('configureRoutes', require('./routes'));

	// API route
    injector.register('apiRoute', require('./api-route'));
	
	// 404 handler
	injector.register('fourOhFourHandler', require('./handlers/404-handler'));
};