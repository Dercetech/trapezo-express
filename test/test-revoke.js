"use strict";
describe('Token revoke', () => {

	// Requires
	let express		= require('express');
	let chai 		= require("chai");
	let chaiHttp 	= require("chai-http");
	let should 		= chai.should();
	let assert		= chai.assert;

	chai.use(chaiHttp);
	
	let cfg, server, httpServer, User;
	let userToken;

	before(done =>  require("trapezo").resolve(module, function(config, main, UserSchema){
		
		cfg = config;
		server = main;
		User = UserSchema;
		
		let revokeTestUser = new User();
		revokeTestUser.user = "revokeTestUser";
		revokeTestUser.pwd = "WhyIsTheRumAlwaysGone?";
		revokeTestUser.roles.push('user', 'pirate');
					
		server.start()
			.then(aHttpServer => {
				httpServer = aHttpServer;
				return Promise.all([
					User.find({"user" : "revokeTestUser"}).remove().exec(),
					null]);
			})
			.then( () => Promise.all([
					revokeTestUser.save(),
					null]) )
					
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
			.catch(err => {  done(err) });
    });
	
	describe('revoke flows', done => {
		it('Logging in should update revoke list from DB', done => {
			
			chai.request(httpServer)
				.get("/api/users/me").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user === "revokeTestUser", "username should be returned");
					done();
				})
				.catch( err => {
					done(err);
				});
			
		});
		it('Deletion of a user must revoke his token');
		it('Update of a user roles must revoke his token');
		it('Token regen can only happen if it was not revoked');		
	});
});