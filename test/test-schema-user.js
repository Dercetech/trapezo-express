"use strict";
describe('Users API endpoint', () => {

	// Requires
	let express		= require('express');
	let chai 		= require("chai");
	let chaiHttp 	= require("chai-http");
	let should 		= chai.should();
	let assert		= chai.assert;

	chai.use(chaiHttp);
	
	let cfg, server, httpServer, User;

	before(done => {
		
		require("trapezo").resolve(module, function(config, main, UserSchema){
			
			cfg = config;
			server = main;
			User = UserSchema;
			
			server.start()
				.then(aHttpServer => {
					httpServer = aHttpServer;
					return Promise.all([
						User.find({"user" : "testUserCreation"}).remove().exec(),
						null]);
				})
				.then(meta => { done() })
				.catch(err => {  done(err) });				
		});
	});

	after((done) => {
		server.stop().then(() => done());
	});
	
    beforeEach(done => {
		Promise.all([
			//User.find({"user" : "testAuthenticationUser"}).remove().exec()
		])
			.then(meta => { done() })
			.catch(err => {  done(err) });
    });
	
	describe('CRUD routes', done => {
		
		it('JOT has expected roles', done => {

			done();
		});
	});
});