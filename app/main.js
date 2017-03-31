'use strict';
module.exports = function(
		config					// Main config file
		,routes					// Routes config utility: sets routes for this app and possibly inject external/test routes
		,configureExpress		// Express config: body parsers, CORS middleware
		,dbServiceAutoConnect	// Resolves the database connection object AFTER link was established
		//,dbService			// Link must be established manually - code becomes less linear to read
	){

	// Requires
	let express     = require('express');       //
	let app         = express();                //
	//let morgan      = require('morgan');      //
	let path        = require('path');          //
	let Promise		= require('bluebird');		//

    let dbService, httpServer = null;
	let initStatus = 0;

	let facade = {
		registerExternalRoutes	: registerExternalRoutes,
	    start           		: start,
	    getHttpServer   		: getHttpServer,
	    stop            		: stop
	}

	function registerExternalRoutes(externalRoutes){
		
		if(initStatus !== 0) throw { name : "ServerAlreadyInitialized", description : "Attempting to add routes to an already running server" };
		else routes.registerExternalRoutes(app, externalRoutes ? externalRoutes : []);
	}
	
	function initApp(){
		return new Promise( (resolve, reject) => {
			
			// Express setup (includes header config & CORS)
			configureExpress(app);
			
			// Logging setup
			//app.use(morgan('dev'));

			// Routes
			routes.configureRoutes(app);
			resolve();
		});
	}
	
	function initDatabase(){
		return new Promise( (resolve, reject) => {
			// dbService.connect(() => { resolve() });
			dbService = dbServiceAutoConnect;
			resolve();
		});
	}
	
    function start(){
		return new Promise( (resolve, reject) => {
			Promise.all( (initStatus === 0) ? [initApp(), initDatabase()] : []).then( () => {
				initStatus = 1;
			
				if(dbService.status !== 1) throw { name: "databaseNotAvailable", message: "Database unavailable - server will not start" };
				if(false) {} else httpServer = app.listen(config.server.port, config.server.address, () => resolve(httpServer));
			});
		});
    }

	function getHttpServer(){
	    return httpServer;
	}

    function stop(){
		return new Promise( (resolve, reject) => {
			Promise.all([dbService.disconnect()])
			.then( () => {
				if(facade.server) httpServer.stop();
				resolve();
			})
			.catch( (err) => {
				reject(err);
			});
		});
    }

	return facade;

	// Start server /////////////////////////////
	////////////////////////////////////////////
}