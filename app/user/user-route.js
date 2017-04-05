'use strict';
module.exports = function userRouteFactory(
	
		UserSchema,
		
		// Middleware: token related
		authenticationTokenRoles,
		
		// Handlers
		userGetAllHandler,
		userGetOneHandler,
		userCreateHandler,
		userUpdateHandler,
		userDeleteHandler
	){

    // Requires
    let express	= require('express');
    let router = express.Router();

	// Get all users
    router.get('/',  userGetAllHandler);

	// Get current user
	router.get('/me', (req, res) => {
		req.params.user = req.decodedToken.user;
		userGetOneHandler(req, res);
	});

	// Get specified user
	router.get('/:user', userGetOneHandler);	

	// Create user
	router.post('/', authenticationTokenRoles ('admin'), userCreateHandler);
	
	// Update current user
	router.put('/me', (req, res) => {
		req.params.user = req.decodedToken.user;
		userUpdateHandler(req, res);
	});
	
	// Update specified user
	router.put('/:user', userUpdateHandler);
	
	// Delete specified user
	router.delete('/:user', userDeleteHandler);

    return router;
}