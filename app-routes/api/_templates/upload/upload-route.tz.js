'use strict';
module.exports = function configure(injector) {

	// Base routes of the application
	injector.register('genericUploadHandler', require('./upload-route'));
};