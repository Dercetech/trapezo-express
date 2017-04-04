"use strict";
describe('DB Schema: User', () => {

	// Requires
	let Promise		= require('bluebird');
	let chai 		= require("chai");
	let chaiHttp 	= require("chai-http");
	let should 		= chai.should();
	let assert		= chai.assert;
	
	let cfg, cfgHash, dbService, mongoose, User;
	let originalYear;
		
	before(done => {
		require("trapezo").resolve(module, function (config, dbServiceAutoConnect, UserSchema) {
			cfg = config;
			cfgHash = config.security.hashing.PBKDF2;
			originalYear = cfgHash.year;
			dbService = dbServiceAutoConnect;			// DB connection is ready before dependencies resolution
			mongoose = dbService.getDriver();
			User = UserSchema;
			done();
		});
	});

	after(done => {
		Promise.all([
			// User.find({"user" : "testUserCreation"}).remove().exec(),
			// User.find({"user" : "testUserPwdHash"}).remove().exec()
		])
			.then(meta => { dbService.disconnect(); done(); })			// Very important do disconnect, see note below
			.catch(err => { dbService.disconnect();	done(err); })
	});
	
	/*
		Why is disconnect so important?
		See dbService.disconnect implementation. It destroys all mongoose models and schemas that were registered within this process.
		Potential issue:
		- Test 1 & 2 are both using the User schema
		- UserSchema relies on the config object's hash year to compute complexity
		- Test 1's resolve creates one config
		- Test 2's resolve creates one config, too
		- Test 2 will use the first User schema that was created and that one will 
	*/

    beforeEach(done => {
		Promise.all([
			User.find({"user" : "testUserCreation"}).remove().exec(),
			User.find({"user" : "testUserPwdHash"}).remove().exec()
		])
			.then(meta => { done() })
			.catch(err => {  done(err) });
    });
	
	describe('Creation', () => {
        
		it('should work', done => {
			
			let testUser = new User();
			testUser.user = "testUserCreation";
			testUser.pwd = "aPwdToHash";
			
            testUser.save()
				.then(aUser => {
					aUser.user.should.equal("testUserCreation");
					done()
				})
				.catch(err => { done(err) });
		});
	});
	
	describe('Password', () => {
		
		it('comparison using wrong password should fail', (done) => {
			
			let testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
            testUser.save()
				.then(aUser => aUser.comparePassword("VladPutinCanDecryptHasheZ"))
				.then((result) => {
					assert(result, "hashed input password matches original hash in database"); 
					done();
				})
				.catch(err =>  done())
		});
		
		it('comparison using same password, iteration count & salt should succeed', (done) => {
			
			let testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
            testUser.save()
				.then(aUser => aUser.comparePassword("VladPutinCanDecryptHashes"))
				.then((result) => {
					assert(result, "hashed input password matches original hash in database"); 
					done();
				})
				.catch(err =>  done(err) );
		});
		
		it('complexity incrased with login after a year passes', (done) => {
		
			let testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
			let originalPassword, updatedPassword;
			
			// Example of the beauty of ES6 promises vs readability
			testUser.save()
			
				// Step 1: Save user, increase complexity and compare password
				.then(aUser => {
					originalYear = cfgHash.year;
					originalPassword = aUser.pwd.split(':');
					cfgHash.year--;	// Incrase complexity
					return aUser.comparePassword("VladPutinCanDecryptHashes");
				})
				
				// Step 2: Ensure that deprecated complexity still validates the password
				.then(result => {
					assert(result, "deprecated password hash should still allow authentication");
					return User.findOne({'user' : 'testUserPwdHash'}, 'pwd').exec()
				})
				
				// Step 3: Validate that hash and salt have been regenerated and compleity has doubled
				.then(updatedUser => {
					updatedPassword = updatedUser.pwd.split(':');
					assert(parseInt(originalPassword[0]) * 2 === parseInt(updatedPassword[0]), "iteration count has doubled with year increase");
					assert(originalPassword[1] !== updatedPassword[1], "salt has been regenerated");
					assert(originalPassword[2] !== updatedPassword[2], "hashes cannot be identical");

					return updatedUser.comparePassword("VladPutinCanDecryptHashes");
				})
				
				// Step 4: Compare passwords again (with no complexity++), hashes mustn't have changed
				.then(result => User.findOne({'user' : 'testUserPwdHash'}, 'pwd').exec())
				.then(nonUpdatedUser => {
					let nonUpdated = nonUpdatedUser.pwd.split(':');		
					assert(parseInt(nonUpdated[0]) === parseInt(updatedPassword[0]), "iteration must be similar as update just happened");
					assert(nonUpdated[1] === updatedPassword[1], "salt has not been regenerated");
					assert(nonUpdated[2] === updatedPassword[2], "hash is identical");
					assert(originalYear === ++cfgHash.year, "year has been restored"); // Reset complexity (y0)
					done();	// Arhooo!
				})
				.catch(err =>  done(err));				
		});
		
		it('should be updated when modifying the model and a year has passed', (done) => {
			
			let testUser = new User();
			testUser.user = "testUserPwdHash";
			testUser.pwd = "VladPutinCanDecryptHashes";
			
			let originalPassword, updatedPassword, nonUpdatedPassword;
			
			testUser.save()
			
				// Step 1: Modify model and increase complexity - should regen hash
				.then(aUser => {
					originalPassword = aUser.pwd.split(':');
					aUser.roles.push('bear-rider');		// Add a role to validate a hash is regen'ed when when complixity increased in the meantime
					cfgHash.year--;						// Incrase complexity
					return aUser.save();
				})
				
				// Step 2: Ensure salt&hash were regen'ed, then use a db-side update (push) - 
				.then(updatedUser => {
					updatedPassword = updatedUser.pwd.split(':');
					
					assert(parseInt(originalPassword[0]) * 2 === parseInt(updatedPassword[0]), "iteration count has doubled with year increase");
					assert(originalPassword[1] !== updatedPassword[1], "salt has been regenerated");
					assert(originalPassword[2] !== updatedPassword[2], "hashes cannot be identical");
					
					cfgHash.year--; // Incrase complexity (y-2)
					return User.updateOne({user: 'testUserPwdHash'}, {$pushAll: {roles:['VaznagrajdonBudetTolkoAddin']}}, {upsert:true});
				})
				
				// Step 3: Hash shouldn't be regen'ed by db-side update-push
				.then(() => User.findOne({user: 'testUserPwdHash'}, 'pwd').exec())
				.then(nonUpdatedUser => {
					nonUpdatedPassword = nonUpdatedUser.pwd.split(':');
					
					assert(parseInt(nonUpdatedPassword[0]) === parseInt(updatedPassword[0]), "iteration count must be similar - update via db push");
					assert(nonUpdatedPassword[1] === updatedPassword[1], "salt has not been regenerated");
					assert(nonUpdatedPassword[2] === updatedPassword[2], "hash is identical");
					
					cfgHash.year++; // Reset complexity (to y-1)
					return nonUpdatedUser.save();
				})
				
				// Step 4: Back to y-1 (from y-2), hash&salt shouldn't be regen'ed
				.then(lastUpdatedUser => {
					let lastUpdatedPassword = lastUpdatedUser.pwd.split(':');

					assert(parseInt(nonUpdatedPassword[0]) === parseInt(lastUpdatedPassword[0]), "iteration count is similar, complexity was already y-1");
					assert(nonUpdatedPassword[1] === lastUpdatedPassword[1], "salt has not been regenerated");
					assert(nonUpdatedPassword[2] === lastUpdatedPassword[2], "hash is identical");
					
					// Reset complexity (y0)							
					assert(originalYear === ++cfgHash.year, `year has been restored from ${cfgHash.year} to ${originalYear}`);
					done();		// This - is - Sparta!
				})
				
				.catch(err =>  done(err));
		});
	});
});