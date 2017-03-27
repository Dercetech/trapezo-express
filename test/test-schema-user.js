"use strict";

// Requires
var mongoose    = require("mongoose");
var Promise		= require("bluebird");

var chai 		= require("chai");
var chaiHttp 	= require("chai-http");
var should 		= chai.should();
var assert		= chai.assert;

var cfg, cfgHash, dbService, User;

// Before all tests in this file
before((done) => {

	// Set environment to TEST
	process.env.NODE_ENV = "test";

    require("trapezo").resolve(module, function(config, dbServiceAutoConnect, UserSchema) {
		cfg = config;
		cfgHash = config.security.hashing.PBKDF2;
		dbService = dbServiceAutoConnect;	// DB connection is ready before dependencies resolution
		User = UserSchema;
		
		// Start testing
		done();
    });
});

// After all tests are run: cleanup!

after((done) => {

	var cleanupPromises = [
		User.find({"user" : "testUserCreation"}).remove().exec(),
		User.find({"user" : "testUserPwdHash"}).remove().exec()
	];

	// Promise.all these
	Promise.all(cleanupPromises).then(
		(meta) => {
			dbService.disconnect();
			done();
		}, (err) => {
			console.log('Error: ' + err);
			dbService.disconnect();			// Jem sez: Don't overlook closing DB connection!
			done();
		});
});


// Actual tests //////////////////////////////

describe('DB Schema: User', () => {

    beforeEach((done) => {

		var cleanupPromises = [];

		// Promise.all these
		Promise.all(cleanupPromises).then(
			(meta) => { done() },
			(err) => { 
				console.log('Error: ' + err);
				done(err);
			});
    });
	
	describe('Creation', () => {
		
		beforeEach((done) => {
					
			var cleanupPromises = [];
			
			cleanupPromises.push(User.find({"user" : "testUserCreation"}).remove().exec());

			// Promise.all these
			Promise.all(cleanupPromises).then(
				(meta) => { done() },
				(err) => { 
					console.log('Error: ' + err);
					done(err);
				});
		});
        
		// Test 
		it('should work', (done) => {
			
			var testUser = new User();
			testUser.user = "testUserCreation";
			testUser.pwd = "aPwdToHash";
			
            testUser.save(function (err, aUser){

				// There should be no error
				if(err) console.log(err);
				should.equal(err, null);
				
				// Username should be set properly
				aUser.user.should.equal("testUserCreation");

				done();	// Arhooo!
            });
		});
	});
	
	describe('Password', () => {
		
		beforeEach((done) => {
					
			var cleanupPromises = [];
			
			cleanupPromises.push(User.find({"user" : "testUserPwdHash"}).remove().exec());

			// Promise.all these
			Promise.all(cleanupPromises).then(
				(meta) => { done() },
				(err) => { 
					console.log('Error: ' + err);
					done(err);
				});
		});
		
		it('comparison using same iteration count and salt should give the same hash', (done) => {
			
			var testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
            testUser.save((err, aUser) => {

				// There should be no error
				should.equal(err, null);
			
				// Compare saved hash with re-input password
				aUser.comparePassword("VladPutinCanDecryptHashes", (result) => {
					assert(result === true, "hashed input password matches original hash in database");

					done();	// Arhooo!
				});
            });
		});
		
		it('comparison against a wrong password fails', (done) => {
			
			var testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
            testUser.save((err, aUser) => {

				// There should be no error
				should.equal(err, null);
			
				// Compare saved hash with re-input password
				aUser.comparePassword("ChuckNorrisCanDecryptHashes", (result) => {
					assert(result === false, "different password should output a different hash");

					done();	// Arhooo!
				});
            });
		});
		
		it('complexity incrased with login after a year passes', (done) => {
			
			var testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
            testUser.save((err, aUser) => {

				// There should be no error
				should.equal(err, null);
			
				// Store original password - this to ensure a new one will be generated as a year passes
				var originalYear = cfgHash.year;
				var originalPassword = aUser.pwd;
			
				// Incrase complexity
				cfgHash.year--;
				
				// Compare saved hash with re-input password
				aUser.comparePassword("VladPutinCanDecryptHashes", (result) => {
					assert(result === true, "deprecated password hash should still allow authentication");

					User.findOne({'user' : 'testUserPwdHash'}, 'pwd', (err, updatedUser) => {
						
						var original = originalPassword.split(':');
						var updated = updatedUser.pwd.split(':');
						
						assert(parseInt(original[0]) * 2 === parseInt(updated[0]), "iteration count has doubled with year increase");
						assert(original[1] !== updated[1], "salt has been regenerated");
						assert(original[2] !== updated[2], "hashes cannot be identical");
						
						aUser.comparePassword("VladPutinCanDecryptHashes", (result) => {
							
							User.findOne({'user' : 'testUserPwdHash'}, 'pwd', (err, nonUpdatedUser) => {
						
								var nonUpdated = nonUpdatedUser.pwd.split(':');
								
								assert(parseInt(nonUpdated[0]) === parseInt(updated[0]), "iteration must be similar as update just happened");
								assert(nonUpdated[1] === updated[1], "salt has not been regenerated");
								assert(nonUpdated[2] === updated[2], "hash is identical");
								
								// Reset complexity (y0)							
								assert(originalYear === ++cfgHash.year, "year has been restored");
								
								done();	// Arhooo!
							});
						});
					});
				});
            });
		});
	
		it('should be updated when modifying the model and a year has passed', (done) => {
			
			var testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
            testUser.save((err, aUser) => {

				// There should be no error
				should.equal(err, null);
				
				// Keep track of original complexity
				var originalYear = cfgHash.year;
				var originalPassword = aUser.pwd;
			
				// Compare saved hash with re-input password
				aUser.roles.push('bear-rider');
				
				// Incrase complexity (y-1)
				cfgHash.year--;
				
				
				aUser.save((err, updatedUser) => {
					
					var original = originalPassword.split(':');
					var updated = updatedUser.pwd.split(':');

					assert(parseInt(original[0]) * 2 === parseInt(updated[0]), "iteration count has doubled with year increase");
					assert(original[1] !== updated[1], "salt has been regenerated");
					assert(original[2] !== updated[2], "hashes cannot be identical");
					
					// Incrase complexity (y-2)
					cfgHash.year--;
					
					// Push operation shouldn't go through the "save process" (involving preSave hook)
					User.updateOne({user: 'testUserPwdHash'}, {$pushAll: {roles:['bear-rider']}}, {upsert:true}, (err, meta) => {

						User.findOne({user: 'testUserPwdHash'}, 'pwd', (err, nonUpdatedUser) => {
														
							var nonUpdated = nonUpdatedUser.pwd.split(':');
							
							assert(parseInt(nonUpdated[0]) === parseInt(updated[0]), "iteration count must be similar - update via db push");
							assert(nonUpdated[1] === updated[1], "salt has not been regenerated");
							assert(nonUpdated[2] === updated[2], "hash is identical");
							
							// There should be no error
							should.equal(err, null);
							
							// Reset complexity (to y-1)
							cfgHash.year++;
							
							aUser.save((err, lastUpdatedUser) => {
								
								var lastUpdated = lastUpdatedUser.pwd.split(':');
								
								assert(parseInt(nonUpdated[0]) === parseInt(lastUpdated[0]), "iteration count is similar, complexity was already y-1");
								assert(nonUpdated[1] === lastUpdated[1], "salt has not been regenerated");
								assert(nonUpdated[2] === lastUpdated[2], "hash is identical");
								
								// Reset complexity (y0)							
								assert(originalYear === ++cfgHash.year, "year has been restored");
								
								done();		// This - is - Sparta!
							});
						});
					});
				});				
            });
		});
	});
});