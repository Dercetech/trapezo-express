'use strict';
module.exports = function configure(injector) {

    // Schema: Revoke
    injector.register('RevokeSchema', require('./revoke-schema'));

	// Middleware: Revoke check
	injector.register('revokeCheck', require('./revoke-check-middleware'));	
};