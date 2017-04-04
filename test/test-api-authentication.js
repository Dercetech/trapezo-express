"use strict";
describe('Authentication', () => {

	// Requires
	let express		= require('express');
	let chai 		= require("chai");
	let chaiHttp 	= require("chai-http");
	let should 		= chai.should();
	let assert		= chai.assert;

	chai.use(chaiHttp);
	
	let cfg, tokenCfg, server, httpServer, User;
	let userToken, adminToken;
	let originalExpiration, originalTokenRenew;

	before(done => {
		
		require("trapezo").resolve(module, function(
			config,
			main,
			routes,
			UserSchema,
			authenticationTokenDecode,
			authenticationTokenCheck,
			authenticationTokenRoles){
			
			server = main;
			User = UserSchema;
			
			cfg = config;
			tokenCfg = config.security.jot;
			originalExpiration = tokenCfg.expiration;
			originalTokenRenew = tokenCfg.renew;
			
			// Create 4 different routes (public, authenticated, role:user, role:admin)
			let router	= express.Router();
			
			// register the test routes
			server.registerExternalRoutes([{endpoint : '/test-api-authentication', router : router}]);
			
			// Available to all
			router.get('/', (req, res) => {
				res.send('test API ok');
			});
			
			// Subsequent calls will be subject ot token decode
			router.use(authenticationTokenDecode);

			// Test token contents
			router.get('/test-token-contents', (req, res) => {
				res.json(req.decodedToken);
			});
			
			// Test token contents
			router.post('/test-token-contents', (req, res) => {
				res.json(req.decodedToken);
			});
			
			// Need authentication
			router.get('/authenticated-only', authenticationTokenCheck, (req, res) => {
				res.send('OK');
			});
			
			// Need user rights from here
			// router.use(authenticationTokenRoles('user'));
			
			router.get('/user-only', authenticationTokenRoles('user'), (req, res) => {
				res.send('OK');
			});
			

			// Need admin rights for this one
			router.use(authenticationTokenRoles('admin'));
			router.get('/admin-only', (req, res) => {
				res.send('OK');
			});
			
			// start server
			server.start()
				.then(aHttpServer => {
					httpServer = aHttpServer;
					return Promise.all([
						User.find({"user" : "testAuthenticationUser"}).remove().exec(),
						User.find({"user" : "testAuthenticationUser_ADMIN"}).remove().exec()]);
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
	
	describe('token creation', done => {
		
		it('JOT has expected roles', done => {

			let testUser = new User();
			testUser.user = "testAuthenticationUser";
			testUser.pwd = "dontLookBehindYouSlenderManIsClose";
			testUser.roles.push('user', 'test');
			
			let adminUser = new User();
			adminUser.user = "testAuthenticationUser_ADMIN";
			adminUser.pwd = "dontLookBehindYouSlenderManIsClose";
			adminUser.roles.push('admin');
			
			// Step 1: Create test users
			adminUser.save().then( (aUser) => {
				
					return chai.request(httpServer)
					.post("/api/authenticate")
					.set('content-type', 'application/x-www-form-urlencoded')
					.send({user: "testAuthenticationUser_ADMIN", pwd: "dontLookBehindYouSlenderManIsClose" })				
				})
				.then( (res) => {
					assert(res.headers.authorization, "authorization header must be set");
					let authorizationHeader = res.headers.authorization;
					adminToken = authorizationHeader;
					// let data = JSON.parse(res.text);
					// assert(data.hasOwnProperty("token"), "a token should have been returned");
					// adminToken = data.token;
					
					return testUser.save()

				})
				.then(aUser => {
					aUser.user.should.equal("testAuthenticationUser");
					
					// Step 2 : Query endpoint
					return chai.request(httpServer).get("/api/authenticate").send();
				})		
				.then( (res) => {
					assert(res.status === 200, "base GET query should be successful");
					
					// Step 3 : Authenticate
					return chai.request(httpServer)
						.post("/api/authenticate")
						.set('content-type', 'application/x-www-form-urlencoded')
						.send({user: "testAuthenticationUser", pwd: "dontLookBehindYouSlenderManIsClose" });
				})
				
				.then( (res) => {
					assert(res.status === 200, "base POST query should be successful");				
					
					// Parse token
					// let data = JSON.parse(res.text);
					// assert(data.hasOwnProperty("token"), "a token should have been returned");
					// userToken = data.token;
					
					let authorizationHeader = res.headers.authorization;
					userToken = authorizationHeader;
					
					// Obtain token roles
					let tokenClaims = new Buffer(userToken.split('.')[1], 'base64').toString();
					let roles = (JSON.parse(tokenClaims)).roles;
					// console.log(tokenClaims); {iat: ..., exp: ...}
					assert(roles[0] === "user", "the token has role 'user'");
					assert(roles[1] === "test", "the token has role 'test'");				
					done();
				})
				
				// Step 2: Call API
				.catch(err => console.log(err) && done(err) );
		});
	});
	
	
	describe("route protection", done => {
		
		before(done => {
			done();
		});
		
		it('should not apply to routes without authentication token', done => {
			chai.request(httpServer).get("/test-api-authentication").send()
				.then(res => {
					done();
				})
				.catch(err => { console.log(err); done(err) } );
		});

		it('should decode the token provided via header x-access-token', done => {
			chai.request(httpServer)
				.get("/test-api-authentication/test-token-contents")
				.set("x-access-token", userToken)
				.send()
				.then(res => {
					done(res.body.user === "testAuthenticationUser" ? null : {name: "usernameNotProvided", message: "seems no username or wrong one was returned by token decode test"});
				})
				.catch(err => { /*console.log(err);*/ done(err) } );
		});
		
		it('should act accordingly when no token is provided for decoding', done => {
			chai.request(httpServer)
				.get("/test-api-authentication/test-token-contents").send()
				.then(res => {
					done(res.body.user == null ? null : {name: "tokenError", message: "there should be no username when no token was provided"});
				})
				.catch(err => { /*console.log(err);*/ done(err) } );
		});
		
		it('should decode the token provided via query', done => {
			chai.request(httpServer)
				.get("/test-api-authentication/test-token-contents?token=" + userToken)
				//.set("x-access-token", userToken)
				.send()
				.then(res => {
					done(res.body.user === "testAuthenticationUser" ? null : {name: "usernameNotProvided", message: "seems no username or wrong one was returned by token decode test"});
				})
				.catch(err => { /*console.log(err);*/ done(err) } );
		});
		
		it('should act accordingly when bad token is provided via query', done => {
			chai.request(httpServer)
				.get("/test-api-authentication/test-token-contents?token=crap")
				//.set("x-access-token", userToken)
				.send()
				.then(res => {
					done({ name: "tokenDecodeShouldHaveFailed"});
				})
				.catch(err => {
						if(err.status === 400) done();
						else done(err)
					} );
		});
		
		it('should decode the token provided via POST body', done => {
			chai.request(httpServer)
				.post("/test-api-authentication/test-token-contents")
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({token: userToken})
				.then(res => {
					done(res.body.user === "testAuthenticationUser" ? null : {name: "usernameNotProvided", message: "seems no username or wrong one was returned by token decode test"});
				})
				.catch(err => { /*console.log(err);*/ done(err) } );
		});
		
		it('should act accordingly when bad token is provided via POST body', done => {
			chai.request(httpServer)
				.post("/test-api-authentication/test-token-contents")
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({token: "crap.will.fail"})
				.then(res => {
					done({ name: "tokenDecodeShouldHaveFailed"});
				})
				.catch(err => {
						if(err.status === 400) done();
						else done(err)
					} );
		});

		it('should allow authenticated users to access authenticated-only routes', done => {
			chai.request(httpServer).get("/test-api-authentication/authenticated-only")
			.set("x-access-token", userToken)
			.send()
			.then(res => {
					done(res.text === "OK" ? null : res);
				})
				.catch(err => done(err) );
		});

		it('should allow access to user-only routes when proper role is set', done => {
			chai.request(httpServer).get("/test-api-authentication/user-only")
			.set("x-access-token", userToken)
			.send()
			.then(res => {
					done();
				})
				.catch(err => done(err) );
		});
		
		it('should prevent access to user-only routes without proper roles', done => {
			chai.request(httpServer).get("/test-api-authentication/user-only")
			.set("x-access-token", adminToken)
			.send()
			.then(res => {
					done({ name: "shouldFailBecauseUserRoleIsMissing"});
				})
				.catch(err => {
						if(err.status === 403) done();
						else done(err)
					} );
		});

		it('should allow access to admin-only routes when proper role is set', done => {
			chai.request(httpServer).get("/test-api-authentication/admin-only")
			.set("x-access-token", adminToken)
			.send()
			.then(res => {
					done();
				})
				.catch(err => done(err) );
		});
		
		it('should prevent access to admin-only routes without proper roles', done => {
			chai.request(httpServer).get("/test-api-authentication/admin-only")
			.set("x-access-token", userToken)
			.send()
			.then(res => {
					done({ name: "shouldFailBecauseAdminRoleIsMissing"});
				})
				.catch(err => {
						if(err.status === 403) done();
						else done(err)
					} );
		});
	});

	describe("token lifecycle", done => {
		
		afterEach( done => { 
			tokenCfg.expiration = originalExpiration;
			tokenCfg.renew = originalTokenRenew;
			done();
		});

		beforeEach( done => { 
			tokenCfg.expiration = originalExpiration;
			tokenCfg.renew = originalTokenRenew;
			done();
		});
		
		it("should refuse token that expired", done => {
			
			tokenCfg.expiration = 0;
			let expiredToken;
			
			// Authenticate after token ttl is set to 0
			chai.request(httpServer)
				.post("/api/authenticate")
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testAuthenticationUser", pwd: "dontLookBehindYouSlenderManIsClose" })
				.then( res => {
					
					let authorizationHeader = res.headers.authorization;
					expiredToken = authorizationHeader;
					
					return chai.request(httpServer)
						.get("/test-api-authentication/test-token-contents")
						.set("x-access-token", expiredToken)
						.send();
				})
				.then( res => {
					done({name: "tokenShouldHaveExpired"});
				})
				.catch(err => {
					assert(err.status === 401, "token should have expired");
					done();
				});
		});
		
		it("should renew tokens that reached half-life", done => {
			
			// Alter expiration delay to have a new token created - test lasts less than 100ms leading to identical JOT
			tokenCfg.expiration = originalExpiration / 2 ;
			let initialToken, regeneratedToken;
			
			chai.request(httpServer)
				.post("/api/authenticate")
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testAuthenticationUser", pwd: "dontLookBehindYouSlenderManIsClose" })
				.then( res => {

					let authorizationHeader = res.headers.authorization;
					initialToken = authorizationHeader;

					// Reset token config
					tokenCfg.expiration = originalExpiration;
					tokenCfg.renew = originalExpiration;

					return chai.request(httpServer)
						.get("/test-api-authentication/test-token-contents")
						.set("x-access-token", initialToken)
						.send();
				})
				.then( res => {
					assert(res.headers.authorization, "Authorization header should be set as token half-life was reached");
					let authorizationHeader = res.headers.authorization;
					regeneratedToken = authorizationHeader;
					assert(initialToken !== regeneratedToken, "regenerated token should not be identical to original one");
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		
		it("should not renew tokens before they reach their half-life", done => {
					
			chai.request(httpServer)
				.post("/api/authenticate")
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({user: "testAuthenticationUser", pwd: "dontLookBehindYouSlenderManIsClose" })
				.then( res => chai.request(httpServer)
					.get("/test-api-authentication/test-token-contents")
					.set("x-access-token", res.headers.authorization)
					.send())
				.then( res => {
					assert(!res.headers.authorization, "Authorization header should not be set as token half-life was not reached");
					done();
				})
				.catch(err => {
					done(err);
				});
		});
	});
});