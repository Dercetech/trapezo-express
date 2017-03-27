'use strict';
module.exports = function configure(injector) {
    
    // Register config as dependency - run factory to obtain single item
    injector.register('config', require('./config'));

    // Config: Express
    injector.register('configureExpress', require('./express'));
};