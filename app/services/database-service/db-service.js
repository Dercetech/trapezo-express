'use strict';
module.exports = function dbServiceFactory(config){

    // Requires
    var mongoose    = require("mongoose");

    // Mongoose setup
    // mongoose.Promise = global.Promise;      	// Using ES6 native Promise breaks in Openshift.
    mongoose.Promise = require("bluebird")		// Bluebird (or Q) is recommenced: http://mongoosejs.com/docs/promises.html

    var databaseService = {
        status              : 0,                	// -1: error, 0: not init, 1: OK
        connect             : connect,				// Uses DI-resolved config file
        connectWithConfig   : connectWithConfig,	// Expects config = { "database" : { "url" : "mongodbConnectionString" }}
        disconnect          : disconnect
    }

    function connectWithConfig(aConfig, callback){
        
        //console.log('connexion establishing...');
        mongoose.connect(aConfig.database.url);
        
        // Handle DB connection success
        mongoose.connection.on('open', function(){
            //console.log('MongoDB connection established');
            databaseService.status = 1;
            callback(null);
        });

        // In case of issue
        // mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
        mongoose.connection.on('error', function(err){
            databaseService.status = -1;
            callback(err);
        });
    }
    
    function connect(callback){
        connectWithConfig(config, callback);
    }
    
    function disconnect(){
        databaseService.status = 0;
        mongoose.disconnect();
    }
    
    return databaseService;
}