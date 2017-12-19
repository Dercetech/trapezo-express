'use strict';
module.exports = function configure(injector) {

    // Initialize: Super admin
    injector.register('initAdmin', require('./services/init-admin'));
};