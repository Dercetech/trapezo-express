'use strict';
module.exports = function configure(injector) {

	// Base routes of the application
	injector.register('routes', require('./routes'));

	// API route
    injector.register('apiRoute', require('./api-route'));
};