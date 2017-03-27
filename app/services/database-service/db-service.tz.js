'use strict';
module.exports = function configure(injector) {

    // Database service - manual connect
    injector.register('dbService', require('./db-service'));
    
    // Database service - auto connect (connection ensured before dependency injection resolution)
    injector.register('dbServiceAutoConnect', require('./db-service-auto-connect'));
};