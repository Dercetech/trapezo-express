'use strict';
module.exports = function userSchemaFactory(config, registerMongooseModel){

	let Promise		= require('bluebird');
    let Schema      = require('mongoose').Schema;
    let forge      	= require('node-forge');
	
	let hashConfig = config.security.hashing.PBKDF2;
    
    let UserSchema = new Schema({
        
        // Username
        'user'  : { 'type' : String, 'required' : true, 'index' : { 'unique' : true }},

		// Displayname
        'displayName'  : { 'type' : String },

		// Email
        'email'  : { 'type' : String },

        // Password (iterations:salt:hash)
        'pwd'   : { 'type' : String, 'required' : true, 'select' : false },

        // Roles
        'roles' : [String]
        
    });

    // Prior to 'save' operation: password is hashed
    UserSchema.pre('save', preSave);

    // Compare input password with database hash
    UserSchema.methods.comparePassword = comparePassword;

	function getIterationCount(inYear){
		
		if(!inYear){
			let d = new Date();
			inYear = d.getFullYear();
		}
		
		let exponnent = inYear - hashConfig.year;
		let iterations = hashConfig.iterations * Math.pow(hashConfig.multiplier, exponnent);
		
		return iterations;
	}
	
    function preSave(next){
    
        let user = this;
		
		let passwordHasBeenModified = user.isModified('pwd');
		let iterations = getIterationCount();
		let complexityHasIncreased = false;
		try{
			complexityHasIncreased = parseInt(user.pwd.split([":"])[0]) < iterations;
		} catch (err) {
			
		}
		
		// Should update password?
		// 1. Has password changed?
		if(!passwordHasBeenModified && !complexityHasIncreased){
			return next();
		}
				
        // Salt
		let salt = forge.random.getBytesSync(hashConfig.saltBytes);
		salt = new Buffer(salt).toString('base64')
		
		// Measure time - the higher, the slowest offline GPU cracking will be, BUT the easiest it will be for DDOS logon attempts to saturate the µService
        let clockIn = new Date().getTime();
		
		// Derived key (password-based derivation key algo - seems good alongside with bcrypt and scrypt)
		forge.pkcs5.pbkdf2(user.pwd, salt, iterations, 32, (err, hash) => {
		
			// Error handling
			if(err) return next(err);
			
			// Set hashed password
			user.pwd = "" + iterations + ":" + salt + ":" + new Buffer(hash).toString('base64');
			
			// Measure time
			let clockOut = new Date().getTime();
			let time = clockOut - clockIn;
			// console.log('hashing has taken ' + time);
			
			// Done.
			next();
		});
    };

	
    function comparePassword(inputPassword){

        let user = this;
		return new Promise( (resolve, reject) => {
			
			let segments = user.pwd.split(':');
			let iterations = parseInt(segments[0]);
			let salt = segments[1];
			let hash = new Buffer(segments[2], 'base64').toString();
				
			forge.pkcs5.pbkdf2(inputPassword, salt, iterations, 32, (err, inputHash) => {
				
				if(err) reject(err);
				else if(hash === inputHash){
					
					// Has complexity increased?
					if(getIterationCount() === iterations){	// No need to update, authentication success
						resolve(true);							
					}
					else{									// Force re-save of input password
						user.pwd = inputPassword;
						user.save()
							.then(aUser => resolve(true))
							.catch(err => reject(err));
					}
				}
				
				// Wrong password
				else resolve(false);
			});
		});
    }
	
	return registerMongooseModel('User', UserSchema);
}