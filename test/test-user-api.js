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
					User.find({"user" : "temporaryNameToBeReplacedAfterWards"}).remove().exec(),
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
		
		it('Admin can create a user', done => {
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
		
		it('Admin rights allow listing other users', done => {
			
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
		
		it('User rights allow listing users, but only with himself in response', done => {
			
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

		it('A user can get his own data via /me', done => {
			
			chai.request(httpServer)
				.get("/api/users/me").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user == "testUserEndpointCreatedUser", "username should be returned");
					done();
				})
				.catch( err => {
					done(err.response.res.text);
				});
		});
		
		it('A user can get his own data via /<username>', done => {
			
			chai.request(httpServer)
				.get("/api/users/testUserEndpointCreatedUser").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user == "testUserEndpointCreatedUser", "username should be returned");
					done();
				})
				.catch( err => {
					done(err.response.res.text);
				});
		});

		it('Admins can get the data of other users', done => {
			
			chai.request(httpServer)
				.get("/api/users/testUserEndpointCreatedUser").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user == "testUserEndpointCreatedUser", "username should be returned");
					done();
				})
				.catch( err => {
					done(err.response.res.text);
				});
		});
		
		it('User rights dont allow getting data of other users', done => {
			
			chai.request(httpServer)
				.get("/api/users/testUserEndpointAdminUser").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send()
				.then( res => {
					done("created user is not allowed to obtain data of other user");
				})
				.catch( err => {
					assert(err.status === 403, "status should be forbidden");
					assert(err.response.res.text.indexOf('clearance') !== -1, "forbidden should be due to lack of sufficient clearance");
					done();
				});
		});
		
		it('User rights dont allow creating users', done => {
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
		
		it('Admin can change the username of anyone', done => {
			chai.request(httpServer)
				.put("/api/users/testUserEndpointCreatedUser").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "temporaryNameToBeReplacedAfterWards"})
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user === "temporaryNameToBeReplacedAfterWards", "renaming a user is possible for an admin");
					return chai.request(httpServer)
						.put("/api/users/temporaryNameToBeReplacedAfterWards").set("x-access-token", adminToken)
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({pwd: "blablaMyPasswordChanged42"})
				})
				.then( () => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "temporaryNameToBeReplacedAfterWards", pwd: "blablaMyPasswordChanged42" }))
				.then( (res) => {
					assert(res.headers.authorization, "authorization header must be set");
					return chai.request(httpServer)
						.put("/api/users/temporaryNameToBeReplacedAfterWards").set("x-access-token", adminToken)
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({roles: ["guineapig"]})
				})
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.roles.indexOf("guineapig") !== -1, "roles should have been updated");
					done();
				})
				.catch( err => {
					done(err);
				});
		});
		
		it('Renaming a user using an already existing name is impossible', done => {
			chai.request(httpServer)
				.put("/api/users/testUserEndpointAdminUser").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "temporaryNameToBeReplacedAfterWards"})
				.then( res => {
					done("setting an existing name should have failed");
				})
				.catch( err => {
					assert(err.status === 400, "should be a bad request 400");
					assert(err.response.res.text.indexOf('duplicate') !== -1, "should be duplicate issue");
					
					return chai.request(httpServer)
					.put("/api/users/temporaryNameToBeReplacedAfterWards").set("x-access-token", adminToken)
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "testUserEndpointCreatedUser"})
				})
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user === "testUserEndpointCreatedUser", "renaming a user to normal should work");
					done();
				})
				.catch( err => {
					done(err.response ? err.response.res.text : err);
				});
		});

		it('Admin can change the password of anyone AND login is still possible', done => {
				chai.request(httpServer)
						.put("/api/users/testUserEndpointCreatedUser").set("x-access-token", adminToken)
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({pwd: "blablaMyPasswordChanged42"})
				.then( () => chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "testUserEndpointCreatedUser", pwd: "blablaMyPasswordChanged42" }))
				.then( (res) => {
					assert(res.headers.authorization, "authorization header must be set");
					done();
				})
				.catch( err => {
					done(err);
				});
		});
		
		it('Admin can change the roles of anyone', done => {
				chai.request(httpServer)
						.put("/api/users/testUserEndpointCreatedUser").set("x-access-token", adminToken)
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({roles: ["guineapig"]})
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.roles.indexOf("guineapig") !== -1, "roles should have been updated");
					done();
				})
				.catch( err => {
					done(err);
				});
		});
		
		it('A user can only modify his password - then can authenticate with the new password', done => {
			
			chai.request(httpServer)
				.put("/api/users/testUserEndpointCreatedUser").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "notPossible", pwd: "theBluewhaleSaid:OhNo,NotAgain", roles: ["crapHaha"]})
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user === "testUserEndpointCreatedUser", "renaming ignored for regular user");
					assert(user.roles.indexOf("crapHaha") === -1, "roles update ignored for regular user");
					
					return chai.request(httpServer)
						.post("/api/authenticate")
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({user: "testUserEndpointCreatedUser", pwd: "theBluewhaleSaid:OhNo,NotAgain" })
				})
				.then( res => {
					assert(res.headers.authorization, "authorization header must be set");
					done();
				})
				.catch (err => {
					done(err);
				});
		});
		
		it('A user can only modify his password - identical, but using "/me"', done => {
			
			chai.request(httpServer)
				.put("/api/users/me").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "notPossiblez", pwd: "blablaMyPasswordChanged42", roles: ["crapHahaz"]})
				.then( res => {
					let user = JSON.parse(res.text);
					assert(user.user === "testUserEndpointCreatedUser", "renaming ignored for regular user");
					assert(user.roles.indexOf("crapHahaz") === -1, "roles update ignored for regular user");
					
					return chai.request(httpServer)
						.post("/api/authenticate")
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({user: "testUserEndpointCreatedUser", pwd: "blablaMyPasswordChanged42" })
				})
				.then( res => {
					assert(res.headers.authorization, "authorization header must be set");
					done();
				})
				.catch (err => {
					done(err);
				});
		});
		
		it('is forbidden to be named "groot"', done => {
			chai.request(httpServer)
				.post("/api/users").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "groot", pwd: "vladimirCanGuessThePasswordOfChuckNorris", roles: ["user"]})
				.then( res => {
					done("creation should have been rejected, 'groot' is not a valid name");
				})
				.catch( err => {
					assert(err.status === 400, "should be a bad request");
					assert(err.response.res.text.indexOf("username 'groot' is not valid") !== -1, "should be an error related to using 'me' as username");
					done();
				});
		});
		
		it('is forbidden to be named "me"', done => {
			chai.request(httpServer)
				.post("/api/users").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "me", pwd: "vladimirCanGuessThePasswordOfChuckNorris", roles: ["user"]})
				.then( res => {
					done("creation should have been rejected, 'me' is not a valid name");
				})
				.catch( err => {
					assert(err.status === 400, "should be a bad request");
					assert(err.response.res.text.indexOf("username 'me' is not valid") !== -1, "should be an error related to using 'me' as username");
					done();
				});
		});
		
		it('is forbidden to be renamed to "groot"', done => {
			chai.request(httpServer)
				.put("/api/users/testUserEndpointCreatedUser").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "groot"})
				.then( res => {
					done("update should have been rejected, 'groot' is not a valid name");
				})
				.catch( err => {
					assert(err.status === 400, "should be a bad request");
					assert(err.response.res.text.indexOf("username 'groot' is not valid") !== -1, "should be an error related to using 'groot' as username");
					done();
				});
		});
		
		it('is forbidden to be renamed to "me"', done => {
			chai.request(httpServer)
				.put("/api/users/testUserEndpointCreatedUser").set("x-access-token", adminToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "me"})
				.then( res => {
					done("update should have been rejected, 'me' is not a valid name");
				})
				.catch( err => {
					assert(err.status === 400, "should be a bad request");
					assert(err.response.res.text.indexOf("username 'me' is not valid") !== -1, "should be an error related to using 'me' as username");
					done();
				});
		});
		
		it('A user cannot modify other users\' data', done => {
			chai.request(httpServer)
				.put("/api/users/testUserEndpointAdminUser").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({pwd: "hola"})
				.then( res => {
					done("update should have been rejected, basic user rights dont allow fiddling with other users' data");
				})
				.catch( err => {
					assert(err.status === 403, "should be forbidden");
					assert(err.response.res.text.indexOf('clearance') !== -1, "forbidden should be due to lack of sufficient clearance");
					done();
				});
		});
		
		it('A regular user cannot delete himself', done => {
			chai.request(httpServer)
				.delete("/api/users/testUserEndpointCreatedUser").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.then( res => {
					done("regular users shouldn't be able to delete any users, even themselve");
				})
				.catch( err => {
					assert(err.status === 403, "code is forbidden");
					assert(err.response.res.text.indexOf('insufiscient clearance') !== -1, "error is about insufiscient rights");
					done();
				})
		});
		
		it('A regular user cannot delete other users', done => {
			chai.request(httpServer)
				.delete("/api/users/testUserEndpointAdminUser").set("x-access-token", userToken)
				.set('content-type', 'application/x-www-form-urlencoded')
				.then( res => {
					done("regular users shouldn't be able to delete any users, even themselve");
				})
				.catch( err => {
					assert(err.status === 403, "code is forbidden");
					assert(err.response.res.text.indexOf('insufiscient clearance') !== -1, "error is about insufiscient rights");
					done();
				})
		});
		
		it('An admin can delete users', done => {
			chai.request(httpServer)
				.delete("/api/users/testUserEndpointCreatedUser")
				.set("x-access-token", adminToken).send()
				.then( res => chai.request(httpServer)
					.get("/api/users/testUserEndpointCreatedUser")
					.set("x-access-token", adminToken).send() )
				.then( res => {
					assert(res.text === "", "no user found");
					done();
				})
				.catch( err => {
					console.log(err);
					done();
				})
		});

		it('Groot cannot be deleted via api', done => {
			chai.request(httpServer)
				.delete("/api/users/groot")
				.set("x-access-token", adminToken).send()
				.then( res => {
					done("Groot cannot be deleted via API");
				})
				.catch( err => {
					assert(err.status === 403);
					done();
				})
		});		
	});
});