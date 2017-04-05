"use strict";
describe('Initialization', () => {

	// Requires
	let express		= require('express');
	let chai 		= require("chai");
	let chaiHttp 	= require("chai-http");
	let should 		= chai.should();
	let assert		= chai.assert;

	chai.use(chaiHttp);

	describe('CFG_GROOT environment variable', done => {
		it('Set, user groot exists: it is able to authenticate', done => {
			
			process.env.CFG_GROOT = "IamGroot";
			
			require("trapezo").resolve(module, function(config, main, UserSchema){
				
				main.start()
					.then( httpServer => {
						return chai.request(httpServer)
						.post("/api/authenticate")
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({user: "groot", pwd: process.env.CFG_GROOT })				
					})
					.then( res => {
						assert(res.headers.authorization, "authorization header must be set");
						let authorizationHeader = res.headers.authorization;
						return main.stop();
					})
					.then(() => done())
					.catch(err => { done(err) });
			});
		});
	
		it('Unset, User groot doesnt exist', done => {
			
			delete process.env.CFG_GROOT;
			
			require("trapezo").resolve(module, function(config, main, UserSchema){
				
				main.start()
					.then( res =>  UserSchema.find({user: "groot"}).exec() )
					.then( list => {
						assert(list.length === 0, "no user should match groot");
						return main.stop();						
					})
					.then(() => done())
					.catch(err => { done(err) });
			});
		});
	});
});