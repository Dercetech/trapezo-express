'use strict';
module.exports = function revokeSchemaFactory(config, registerMongooseModel){

	let Promise		= require('bluebird');
    let Schema      = require('mongoose').Schema;
	   
    let RevokeSchema = new Schema({
        
        // Username
        'user'  : { 'type' : String, 'required' : true, 'index' : { 'unique' : true }}
    });

	return registerMongooseModel('Revoke', RevokeSchema);
}