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
	let adminToken, userToken;

	before(done =>  require("trapezo").resolve(module, function(config, main, UserSchema){
		
		cfg = config;
		server = main;
		User = UserSchema;
		
		server.start()
			.then(aHttpServer => {
				httpServer = aHttpServer;
				return Promise.all([
					//User.find({"user" : ""}).remove().exec(),
					null]);
			})
			.then( meta => {
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
		it('Logging in should update revoke list from DB');
		it('Deletion of a user must revoke his token');
		it('Update of a user roles must revoke his token');
		it('Token regen can only happen if it was not revoked');		
	});
});