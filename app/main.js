'use strict';
module.exports = function(
    config					// Main config file
    ,routes					// Routes config utility: sets routes for this app and possibly inject external/test routes
    ,initAdmin				// If the env variable CFG_GROOT is set, the super admin "groot" will be created. Otherwise, it will be deleted.
    ,configureExpress		// Express config: body parsers, CORS middleware
    ,dbServiceAutoConnect	// Resolves the database connection object AFTER link was established
    //,dbService			// Link must be established manually - code becomes less linear to read
){

    // Requires
    const express   = require('express');
    const app       = express();
    //const morgan  = require('morgan');
    const fs      	= require('fs');
    const path      = require('path');
    const Promise	= require('bluebird');

    const http	= require('http');
    const https	= require('https');

    // SSL/HTTPs credentials (optional, see config.js)
    let credentials = {};
    if(config.server.portSSL){
        const privateKey  = fs.readFileSync(path.join('ssl', 'key.pem'), 'utf8');
        const certificate = fs.readFileSync(path.join('ssl', 'server.crt'), 'utf8');
        credentials = { key: privateKey, cert: certificate, requestCert: false, rejectUnauthorized: false };
    }

    let dbService, httpServer = null, httpsServer = null;
    let initStatus = 0;

    const facade = {
        registerExternalRoutes	: registerExternalRoutes,
        start           		: start,
        getHttpServer   		: getHttpServer,
        getHttpsServer   		: getHttpsServer,
        stop            		: stop
    };

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

    // Better use the dependency that resolves upon DB readiness (aka dbServiceAutoConnect)
    function initDatabase(){
        return new Promise( (resolve, reject) => {
            // dbService.connect(() => { resolve() });
            dbService = dbServiceAutoConnect;
            resolve();
        });
    }

    function start(){

        return Promise.all( (initStatus === 0) ? [initAdmin(), initRoutes(), initDatabase()] : [])

        // Ensure DB is up after init routines have resolved
            .then( () => {
                if (dbService.status !== 1) throw {
                    name: "databaseNotAvailable",
                    message: "Database unavailable - server will not start"
                };
                return true;
            })

            // Start at least a basic HTTP server - HTTPS is upon request (cert, key and server must be made available)
            .then( () => new Promise.all([

                // HTTP server
                new Promise( (resolve, reject) => {
                    const httpServer = http.createServer(app);
                    httpServer.listen(config.server.port, config.server.address, () => resolve(httpServer));
                }),

                // HTTPS server
                new Promise( (resolve, reject) => {
                    if(config.server.portSSL){
                        const httpsServer = https.createServer(credentials, app);
                        httpsServer.listen(config.server.portSSL, config.server.address, () => resolve(httpsServer));
                    }
                    else{
                        resolve(null);
                    }
                })
            ]));
    }

    function getHttpServer(){
        return httpServer;
    }


    function getHttpsServer(){
        return httpsServer;
    }

    function stop(){
        return new Promise( (resolve, reject) => {
            Promise.all([dbService.disconnect()])
                .then( () => {
                    if(httpServer) httpServer.close();
                    if(httpsServer) httpsServer.close();
                    resolve();
                })
                .catch( (err) => {
                    reject(err);
                });
        });
    }

    return facade;
};