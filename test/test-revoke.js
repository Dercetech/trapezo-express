"use strict";
describe('Token revoke', () => {

	// Requires
	let express		= require('express');
	let chai 		= require("chai");
	let chaiHttp 	= require("chai-http");
	let should 		= chai.should();
	let assert		= chai.assert;

	chai.use(chaiHttp);
	
	let cfg, server, httpServer, User, Revoke, revokes;
	let userToken;

	before(done =>  require("trapezo").resolve(module, function(config, main, UserSchema, RevokeSchema, revokeList){
		
		cfg = config;
		server = main;
		User = UserSchema;
		Revoke = RevokeSchema;
		revokes = revokeList;
		
		let revokeTestUser = new User();
		revokeTestUser.user = "revokeTestUser";
		revokeTestUser.pwd = "WhyIsTheRumAlwaysGone?";
		revokeTestUser.roles.push('user', 'pirate');
					
		server.start()
			.then(aHttpServer => {
				httpServer = aHttpServer;
				return Promise.all([
					User.find({"user" : "revokeTestUser"}).remove().exec(),
					Revoke.find({}).remove().exec(),
					null]);
			})
			.then( () => Promise.all([
					revokeTestUser.save(),
					null]) )
			.then( () => revokeList.refreshList() )
			.then( () => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "revokeTestUser", pwd: "WhyIsTheRumAlwaysGone?" }) )
			.then(res => { 
				assert(res.headers.authorization, "authorization header must be set");
				userToken = res.headers.authorization;
				done();
			})
			.catch(err => {  done(err) });
	}));

	after((done) => {
		server.stop().then(() => done());
	});
	
    beforeEach(done => {
		Promise.all([])
			.then(meta => { done() })
			.catch(err => { done(err) });
    });
	
	describe('revoke flows', done => {
		it('Logging in should update revoke list from DB', done => {
			
			// Test revoke list contents - should be empty
			let list = revokes.getList();
			assert(Object.keys(list).length === 0, "no revokes should be in place at this point");
			
			// Add a revoke entry
			let aRevoke = new Revoke();
			aRevoke.user = "revokeTestUser";
			aRevoke.save()
				
				// 10. Test revoke list contents - should still be empty
				.then( () => {
					assert(Object.keys(revokes.getList()).length === 0, "no revokes should be in cached listed at this point");
					
					return chai.request(httpServer)
						.get("/api/users/me").set("x-access-token", userToken)
						.set('content-type', 'application/x-www-form-urlencoded')
						.send();
				})
				
				// 20. API call shouldn't update revoke list; test, list should still be empty
				.then( () => {
					assert(Object.keys(revokes.getList()).length === 0, "no revokes should be in cached listed at this point");
				})
				
				// 30. Login again to trigger reload of revokations
				.then( () => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "revokeTestUser", pwd: "WhyIsTheRumAlwaysGone?" }) )
				 
				 // 35. Login should be successful
				.then(res => { 
					return assert(res.headers.authorization, "authorization header must be set");
				})
				
				// 40. Revokation list should have been updated by login mechanism
				.then( () => {
					assert(Object.keys(revokes.getList()).length === 1, "inserted revoke should now be in cache");
					
				})
				/*
				.then( () => chai.request(httpServer)
						.get("/api/users/me").set("x-access-token", userToken)
						.set('content-type', 'application/x-www-form-urlencoded')
						.send() )
				
				.then( (res) => {
					let user = JSON.parse(res.text);
					assert(user.user === "revokeTestUser", "username should be returned as revoke list referesh was not re-triggered");
					// Test revoke list contents - should no longer be empty
					assert(Object.keys(revokes.getList()).length === 0, "inserted revoke should now be in cached listed");
				})
				
				.then( () => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "revokeTestUser", pwd: "WhyIsTheRumAlwaysGone?" }) )
			
			// Authenticate
			chai.request(httpServer)
				.get("/api/users/me").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user === "revokeTestUser", "username should be returned");
					done();
				})
				*/
				.then(() => done() )
				.catch( err => {
					done(err);
				});
			
			// Re-check revoke list
		});
		it('Deletion of a user must revoke his token');
		it('Update of a user roles must revoke his token');
		it('Token regen can only happen if it was not revoked');		
	});
});