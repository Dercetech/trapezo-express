'use strict';
module.exports = function configure(injector) {

    // Register Mongoose model in a trapezo-safe way (in case of multiple .resolve() calls within the same process)
    injector.register('registerMongooseModel', require('./db-mongoose-model-register'));

    // Database service - manual connect
    injector.register('dbService', require('./db-service'));
    
    // Database service - auto connect (connection ensured before dependency injection resolution)
    injector.register('dbServiceAutoConnect', require('./db-service-auto-connect'));
};