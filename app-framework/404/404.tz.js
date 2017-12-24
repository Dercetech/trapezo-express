'use strict';
module.exports = function configure(injector) {

    // 404 handler
    injector.register('fourOhFourHandler', require('./handlers/404-handler'));
};