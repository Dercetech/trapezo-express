'use strict';
module.exports = function(
		config					// Main config file
		,routes					// Routes config utility: sets routes for this app and possibly inject external/test routes
		,initSuperAdmin			// If the env variable CFG_GROOT is set, the super admin "groot" will be created. Otherwise, it will be deleted.
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

	// Express setup (includes header config & CORS)	// Important to configure Express first: bodyparser MUST be available before configuring custom routes
	configureExpress(app);

	// Logging setup
	//app.use(morgan('dev'));
	
	
	function registerExternalRoutes(externalRoutes){

		if(initStatus !== 0) throw { name : "ServerAlreadyInitialized", description : "Attempting to add routes to an already running server" };
		else routes.registerExternalRoutes(app, externalRoutes ? externalRoutes : []);
	}
	
	function initRoutes(){
		return new Promise( (resolve, reject) => {
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
			Promise.all( (initStatus === 0) ? [initSuperAdmin(), initRoutes(), initDatabase()] : []).then( () => {
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
				if(httpServer) httpServer.close();
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