'use strict';

module.exports = function dbServiceFactory(wtDone, dbService){
    dbService.connect().then(() => wtDone(dbService) ).catch(err => { console.log(err) });
}