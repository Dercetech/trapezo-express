'use strict';
module.exports = function configure(injector) {

    // Schema: Revoke
    injector.register('RevokeSchema', require('./revoke-schema'));

    // Service: Revoke list
    injector.register('revokeList', require('./revoke-list'));

	
	// Middleware: Revoke check
	injector.register('revokeCheck', require('./revoke-check-middleware'));	
};