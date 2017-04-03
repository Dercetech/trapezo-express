'use strict';
module.exports = function configure(injector) {
    
    // Model: user
    injector.register('UserSchema', require('./user-schema'));
};