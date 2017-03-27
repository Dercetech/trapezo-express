'use strict';
module.exports = function userSchemaFactory(config){

    var mongoose    = require('mongoose');
    var Schema      = mongoose.Schema;
    var forge      	= require('node-forge');
	
	var hashConfig = config.security.hashing.PBKDF2;
    
    var UserSchema = new Schema({
        
        // Username
        'user'  : { 'type' : String, 'required' : true, 'index' : { 'unique' : true }},
        
        // Password (iterations:salt:hash)
        'pwd'   : { 'type' : String, 'required' : true, 'select' : false },

        // Roles
        'roles' : { 'type': Array },
        
    });

    // Prior to 'save' operation: password is hashed
    UserSchema.pre('save', preSave);

    // Compare input password with database hash
    UserSchema.methods.comparePassword = comparePassword;

	function getIterationCount(inYear){
		
		if(!inYear){
			var d = new Date();
			inYear = d.getFullYear();
		}
		
		var exponnent = inYear - hashConfig.year;
		var iterations = hashConfig.iterations * Math.pow(hashConfig.multiplier, exponnent);
		
		return iterations;
	}
	
    function preSave(next){
    
        var user = this;
		
		var passwordHasBeenModified = user.isModified('pwd');
		var iterations = getIterationCount();
		var complexityHasIncreased = parseInt(user.pwd.split([":"])[0]) < iterations;
		
		// Should update password?
		// 1. Has password changed?
		if(!passwordHasBeenModified && !complexityHasIncreased){
			return next();
		}
				
        // Salt
		var salt = forge.random.getBytesSync(hashConfig.saltBytes);
		salt = new Buffer(salt).toString('base64')
		
		// Measure time - the higher, the slowest offline GPU cracking will be, BUT the easiest it will be for DDOS logon attempts to saturate the µService
        var clockIn = new Date().getTime();
		
		// Derived key (password-based derivation key algo - seems good alongside with bcrypt and scrypt)
		forge.pkcs5.pbkdf2(user.pwd, salt, iterations, 32, (err, hash) => {
		
			// Error handling
			if(err) return next(err);
			
			// Set hashed password
			user.pwd = "" + iterations + ":" + salt + ":" + new Buffer(hash).toString('base64');
			
			// Measure time
			var clockOut = new Date().getTime();
			var time = clockOut - clockIn;
			// console.log('hashing has taken ' + time);
			
			// Done.
			next();
		});
    };

	
    function comparePassword(inputPassword, callback){

        var user = this;

		var segments = user.pwd.split(':');
		var iterations = parseInt(segments[0]);
		var salt = segments[1];
		var hash = new Buffer(segments[2], 'base64').toString();
			
        forge.pkcs5.pbkdf2(inputPassword, salt, iterations, 32, function(err, inputHash) {
		
			// Error handling
			if(err) return callback(false, err);
			
			// Correct password
			else if(hash === inputHash){
				
				// Has complexity increased?
				var expectedIterations = getIterationCount();
				
				if(expectedIterations === iterations){
					// No need to update, authentication success
					callback(true);
				}
				else{
					// Force re-save of input password
					user.pwd = inputPassword;
					user.save((err, aUser) => {
						if(err) return callback(false, err);
						else return callback(true);
					});
				}
			}
			
			// Wrong password
			else{
				callback(false);
			}
		});
    }

    return mongoose.model('User', UserSchema);
}