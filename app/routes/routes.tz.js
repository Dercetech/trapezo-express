'use strict';
module.exports = function configure(injector) {

	// Routes of the API
	injector.register('configureRoutes', require('./routes'));

	// Route: 404
	injector.register('use404Route', require('./handlers/use-404-route'));
};