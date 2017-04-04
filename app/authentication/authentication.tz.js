'use strict';
module.exports = function configure(injector) {

	// Token generation service
	injector.register('authenticationTokenGenerator', require('./authentication-token-generator'));

	// Route: Authentication
	injector.register('authenticationRoute', require('./authentication-route'));

	// Handler: Authentication
	injector.register('authenticationHandler', require('./authentication-handler'));
	
	// Middleware: Token decode
	injector.register('authenticationTokenDecode', require('./authentication-token-decode-middleware'));

	// Middleware: Token presence (i.e. is this an authenticated call?)
	injector.register('authenticationTokenCheck', require('./authentication-token-check-middleware'));
	
	// Middleware: Token roles
	injector.register('authenticationTokenRoles', require('./authentication-token-roles-middleware'));	
};