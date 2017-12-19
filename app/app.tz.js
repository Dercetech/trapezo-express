'use strict';
module.exports = function configure(injector) {

    // Main entry point - configures Express & co
    injector.register('main', require('./main'));
};