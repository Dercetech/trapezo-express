'use strict';
module.exports = function configure(injector) {

	// Token generation service
	injector.register('authenticationTokenGenerator', require('./services/authentication-token-generator'));

	// Route: Authentication
	injector.register('authenticationRoute', require('./authentication-route'));

	// Handler: Authentication
	injector.register('authenticationHandler', require('./handlers/authentication-handler'));
	
	// Middleware: Token decode
	injector.register('authenticationTokenDecode', require('./middleware/authentication-token-decode-middleware'));

	// Middleware: Token presence (i.e. is this an authenticated call?)
	injector.register('authenticationTokenCheck', require('./middleware/authentication-token-check-middleware'));
	
	// Middleware: Token roles
	injector.register('authenticationTokenRoles', require('./middleware/authentication-token-roles-middleware'));
};