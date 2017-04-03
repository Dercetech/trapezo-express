'use strict';
module.exports = function registerMongooseModelFactory(config){

    let mongoose    = require("mongoose");
	
	function registerMongooseModel(modelName, schema){
		let model;
		
		try {
			model = mongoose.model(modelName, schema);
		}
		catch(err){
			// Do NOT recover the schema from a previous trapezo.resolve session, models might keep references to obsolete code
			console.log('WARNING: is your app running multiple trapezo.resolve(...) calls? Probably your test cases. If so, make sure to dbService.disconnect to ensure that cached schemas and models are reset.');
			delete mongoose.models[modelName];
			delete mongoose.modelSchemas[modelName];
			model = mongoose.model(modelName, schema);
		}
		
		return model;
	}
    
    return registerMongooseModel;
}