'use strict';

module.exports = function dbServiceFactory(wtDone, dbService){

    dbService.connect(function(){
       wtDone(dbService); 
    });
}