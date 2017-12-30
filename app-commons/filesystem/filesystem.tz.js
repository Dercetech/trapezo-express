'use strict';
module.exports = function configure(injector) {
    
    // Filesystem utils
    injector.register('filesystemUtils', require('./filesystem-utils.service'));
};