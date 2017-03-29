'use strict';
module.exports = function(
		config					// Main config file
		,configureExpress		// Express config: body parsers, CORS middleware
		,configureRoutes		// Routes config: sets routes for this app
		,dbServiceAutoConnect	// Resolves the database connection object AFTER link was established
		//,dbService			// Link must be established manually - code becomes less linear to read
	){
	
	//////////////////////////////////////////////
	// Server configuration //////////////////////

	let express     = require('express');       //
	let app         = express();                //
	//let morgan      = require('morgan');      //
	let path        = require('path');          //


    // Express setup (includes header config & CORS)
	configureExpress(app);

    // Logging setup
    //app.use(morgan('dev'));

    // Database setup
    let dbService = dbServiceAutoConnect;
    /*dbService.connect(() => { });*/

    // Routes setup
    configureRoutes(app);

	// Server configuration //////////////////////
	/////////////////////////////////////////////


	/////////////////////////////////////////////
	// Start server /////////////////////////////

	// Start HTTP server (Express shorthand)

    let httpServer = null;

	let facade = {
	    start           : start,
	    getHttpServer   : getHttpServer,
	    stop            : stop
	}

    function start(){
		
		return new Promise( (resolve, reject) => {
			if(dbService.status !== 1) throw { name: "databaseNotAvailable", message: "Database unavailable - server will not start" };
			if(false) {} else httpServer = app.listen(config.server.port, config.server.address, () => resolve(httpServer));
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