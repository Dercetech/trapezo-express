'use strict';
module.exports = function configure(injector) {

	// Middleware: Token roles
	injector.register('revokeCheck', require('./revoke-check-middleware'));	
};