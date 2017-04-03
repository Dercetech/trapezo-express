'use strict';
module.exports = function dbServiceFactory(config){

    // Requires
	let Promise 	= require("bluebird");

    // Mongoose setup
    // mongoose.Promise = global.Promise;      	// Using ES6 native Promise breaks in Openshift.
    let mongoose    = require("mongoose");
	mongoose.Promise = Promise					// Bluebird (or Q) is recommenced: http://mongoosejs.com/docs/promises.html

    let databaseService = {
        status              : 0,                	// -1: error, 0: not init, 1: OK
        connect             : connect,				// Uses DI-resolved config file
        connectWithConfig   : connectWithConfig,	// Expects config = { "database" : { "url" : "mongodbConnectionString" }}
        disconnect          : disconnect,
		getDriver			: () => mongoose
    }
	
    function connectWithConfig(aConfig){
        
		//console.log('connecting... ' + aConfig.database.url);
		
		return new Promise( (resolve,reject) => {
			
			// Don't reconnect
			if(databaseService.status === 1){
				reject({ name : "dbServiceAlreadyConnected" });
			}
			
			else{

				//console.log('connexion establishing...');
				mongoose.connect(aConfig.database.url);
				
				// Handle DB connection success
				mongoose.connection.on('open', function(){
					//console.log('MongoDB connection established');
					databaseService.status = 1;
					resolve();
				});

				// In case of issue
				// mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
				mongoose.connection.on('error', function(err){
					databaseService.status = -1;
					reject(err);
				});
			}
		});
    }
    
    function connect(){
        return connectWithConfig(config);
    }
    
    function disconnect(){

		// ES6 generator function, bitch!
		function* entries(obj) {
			for (let key of Object.keys(obj)) {
				yield [key, obj[key]];
			}
		}
		
		// Clear schema and model cache
		for (let [key, value] of entries(mongoose.models)) {
			//console.log('deleting model ' + key);
			delete mongoose.models[key];
		}
	
		for (let [key, value] of entries(mongoose.modelSchemas)) {
			//console.log('deleting model schema ' + key);
			delete mongoose.modelSchemas[key];
		}
		
		
		return new Promise( (resolve, reject) => {
			mongoose.disconnect().then(() => {
				databaseService.status = 0;
				resolve();
			})
		});
    }
    
    return databaseService;
}