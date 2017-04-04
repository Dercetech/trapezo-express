'use strict';
module.exports = function configure(injector) {

    // Schema: user
    injector.register('UserSchema', require('./user-schema'));
	
    // Route: user
    injector.register('userRoute', require('./user-route'));
};