'use strict';
module.exports = function configure(injector) {

    // Main entry point - configures Express & co
    injector.register('main', require('./main'))

    // Initialize: Super admin
    injector.register('initSuperAdmin', require('./initialize-super-admin'));
};