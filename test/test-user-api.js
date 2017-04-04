"use strict";
describe('API: Users endpoints', () => {

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
					User.find({"user" : "testUserEndpointAdminUser"}).remove().exec(),
					User.find({"user" : "testUserEndpointCreatedUser"}).remove().exec(),
					null]);
			})
			.then( meta => {
				
				let adminUser = new User();
				adminUser.user = "testUserEndpointAdminUser";
				adminUser.pwd = "yaVijuTvoyoZelanie";
				adminUser.roles.push('admin');
				
				return Promise.all([
					adminUser.save(),
					null])
			})
			.then( () => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "testUserEndpointAdminUser", pwd: "yaVijuTvoyoZelanie" }) )
			.then(res => { 
				assert(res.headers.authorization, "authorization header must be set");
				adminToken = res.headers.authorization;
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
	
	describe('CRUD routes', done => {
		
		it('Admin could create a user', done => {
			chai.request(httpServer)
				.post("/api/users").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testUserEndpointCreatedUser", pwd: "vladimirCanGuessThePasswordOfChuckNorris", roles: ["user"]})
				.then( res => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "testUserEndpointCreatedUser", pwd: "vladimirCanGuessThePasswordOfChuckNorris" }) )
				.then(res => { 
					assert(res.headers.authorization, "authorization header must be set");
					userToken = res.headers.authorization;
					done();
				})
				.catch( err => {
					done(err.response.res.text);
				});
		});
		
		it('Creation of duplicate user should be rejected', done => {
			chai.request(httpServer)
				.post("/api/users").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testUserEndpointCreatedUser", pwd: "vladimirCanGuessThePasswordOfChuckNorris", roles: ["user"]})
				.then( res => {
					done("creation should have been rejected");
				})
				.catch( err => {
					assert(err.status === 400, "should be a bad request");
					assert(err.response.res.text.indexOf('duplicate unique id') !== -1, "should be duplicate error");
					done();
				});
		});
		
		it('Creation should be rejected in the absence of user, pwd and roles', done => {
			chai.request(httpServer)
				.post("/api/users").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testUserEndpointCreatedUser", pwd: "vladimirCanGuessThePasswordOfChuckNorris"})
				.then( res => {
					done("missing 'roles' should have crashed the test");
				})
				.catch( err => {
					assert(err.response.res.text.indexOf("user, pwd") !== -1, "complains about sth else than missing fields");
					done();
				});
		});
		
		it('should list at least users from the admin perspective', done => {
			
			chai.request(httpServer)
				.get("/api/users").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let users = JSON.parse(res.text);
					assert(users.length >= 2, "there should be at least 2 users");
					done();
				})
				.catch( err => {
					done(err.response.res.text);
				});
		});
		
		it('should list 1 user from the created user perspective', done => {
			
			chai.request(httpServer)
				.get("/api/users").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let users = JSON.parse(res.text);
					assert(users.length == 1, "there should be exactly 1 user returned");
					done();
				})
				.catch( err => {
					done(err.response.res.text);
				});
		});
		
		it('should should be impossible for the created user to create users', done => {
			chai.request(httpServer)
				.post("/api/users").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testUserEndpointCreatedUserOnlyForAdmins", pwd: "vladimirCanGuessThePasswordOfChuckNorris", roles: ["trash"]})
				.then( res =>
					done("basic user should not be able to create users"))
				.catch( err => {
					assert(err.status === 403, "should be a forbidden 403");
					assert(err.response.res.text.indexOf('Forbidden') !== -1, "should be forbidden");
					done();
				});
		});
		
		it('should should be impossible for the created user to obtain data from other users');
		it('should should be impossible for the created user to delete users');
	});
});