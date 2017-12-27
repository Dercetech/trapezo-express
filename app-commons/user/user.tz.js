'use strict';
module.exports = function configure(injector) {

    // Schema: user
    injector.register('UserSchema', require('./models/user-schema'));

    // Route: User management
    injector.register('userRoute', require('./routes/user-route'));

    // Handler: get all
	injector.register('userGetAllHandler', require('./handlers/user-get-all-handler'));
	
	// Handler: get one
	injector.register('userGetOneHandler', require('./handlers/user-get-one-handler'));	
	
	// Handler: create
	injector.register('userCreateHandler', require('./handlers/user-create-handler'));

	// Handler: update
	injector.register('userUpdateHandler', require('./handlers/user-update-handler'));

	// Handler: delete
	injector.register('userDeleteHandler', require('./handlers/user-delete-handler'));
};