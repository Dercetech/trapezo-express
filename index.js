/* ***************************************************** *\
|*	   ___  _______  __________________________ __		  *|
|*		  / _ \/ __/ _ \/ ___/ __/_  __/ __/ ___/ // /	  *|
|*		 / // / _// , _/ /__/ _/  / / / _// /__/ _  / 	  *|
|*		/____/___/_/|_|\___/___/ /_/ /___/\___/_//_/  	  *|
|*												  		  *|
|*	 Trapezo Express, web server with DI, Dercetech 2017  *|
|*          written by Jérémie "Jem" Mercier              *|
|*														  *|
\* ************ http://www.dercetech.com **************** */

/*
	Use this as a project stub:
	- It allows seamless dependency injection using Trapezo (v1.1).
	- Comes with 50+ unit tests (Trapezo-based).
	- Implements best-practice* token authentication.
	- Written in ES6.
	- Project structure is a suggestion - based on domains instead of roles.
	- Mongoose wrapping.
	
	*It implements the guidelines found in the following article regarding best practices:
	https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/
*/

'use strict';

// Trapezo boilerplate line: Run server start routine when reflected dependencies are resolved
require('trapezo').resolve(module, function(main){

    // Start server
    main.start().then( (servers) => {

    	const httpServer = servers[0];
    	const httpsServer = servers[1];
		
		// Get version from package.json
		let version = process.env && process.env.npm_package_version;
	    
		// Display running version
		if(version) console.log("Dercetech Trapezo-Express server ready (v" + version + ")");
		else console.log("Dercetech Trapezo-Express server ready - please run using 'npm start'.");
		
		// Display running environment
		if(process.env.NODE_ENV) console.log(`Environment: ${process.env.NODE_ENV}`)
		
		// Output API status
	    console.log('HTTP API  : ' + httpServer.address().address + ':' + httpServer.address().port);
	    if(httpsServer) console.log('HTTPS API : ' + httpsServer.address().address + ':' + httpsServer.address().port);
    });
});