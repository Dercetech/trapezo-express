'use strict';

module.exports = function(){

    const fs    = require('fs');
    const path  = require('path');

    return {

        doesPathExist   : doesPathExist,
        ensureExists    : ensureExists,

        readFileAsPromise   : readFileAsPromise
    };

    // TODO: Add mocha test
    // TODO: Split to add a parseToJson method
    function readFileAsPromise(path){
        return new Promise( (resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if(err) reject(err);
                else {
                    let gameData;
                    try{
                        gameData = JSON.parse(data);
                        resolve(gameData);
                    }
                    catch(err){
                        reject(err);
                    }
                }
            });
        });
    }

    // TODO: Convert to ES6
    function ensureExists(aPath, mask, cb){

        // Mask is optional
        if ('function' === typeof mask){
            cb = mask;
            mask = '0777';
        }

        const parentPath = aPath.substring(0, aPath.lastIndexOf(path.sep));

        doesPathExist(parentPath, function(err, exists, isDirectory, isFile){

            if(err){
                cb(err);
            }

            // Parent folder exists
            else if(exists){
                createFolder(aPath, mask, cb);
            }

            // Parent folder doesn't exist
            else{
                ensureExists(parentPath, mask, function(){
                    ensureExists(aPath, mask, cb);
                })
            }
        });
    }

    // TODO: Convert to ES6
    function doesPathExist(path, callback){
        fs.stat(path, function(error, stats){
            if(error){
                if(error.code == "ENOENT"){
                    callback(null, false);
                }
                else{
                    callback(error, false)
                }
            }
            else{
                callback(null, true, stats.isDirectory(), stats.isFile());
            }
        });
    }

    // TODO: Convert to ES6
    function createFolder(path, mask, callback){

        fs.mkdir(path, mask, function(err){

            if (err) {
                if (err.code == 'EEXIST'){
                    callback(null); // ignore the error if the folder already exists
                }
                else{
                    callback(err); // something else went wrong
                }
            }
            else{
                callback(null); // successfully created folder
            }
        });
    }
};