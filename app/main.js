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

	var express     = require('express');       //
	var app         = express();                //
	//var morgan      = require('morgan');      //
	var path        = require('path');          //


    // Express setup (includes header config & CORS)
	configureExpress(app);

    // Logging setup
    //app.use(morgan('dev'));

    // Database setup
    var dbService = dbServiceAutoConnect;
    /*dbService.connect(() => { });*/

    // Routes setup
    configureRoutes(app);

	// Server configuration //////////////////////
	/////////////////////////////////////////////


	/////////////////////////////////////////////
	// Start server /////////////////////////////

	// Start HTTP server (Express shorthand)

    var httpServer = null;

	var facade = {
	    start           : start,
	    getHttpServer   : getHttpServer,
	    stop            : stop
	}

    function start(onReady){
        if(dbService.status !== 1) throw { name: "databaseNotAvailable", message: "Database unavailable - server will not start" };
        if(false) {} else httpServer = app.listen(config.server.port, config.server.address, onReady);
    }

	function getHttpServer(){
	    return httpServer;
	}

    function stop(){
        dbService.disconnect();
        if(facade.server) httpServer.stop();
    }

	return facade;

	// Start server /////////////////////////////
	////////////////////////////////////////////
}