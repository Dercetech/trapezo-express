'use strict';
module.exports = function configFactory(){

    var path    = require('path');

	// Environment
	var environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'prod';
	
    //////////////////////////////////////////
    // Server configuration //////////////////

    // 1. Server configuration ///////////////
    
	// Port
	var port = process.env.PORT || 8086;

	// Address
	var address = process.env.IP || "127.0.0.1";
    
    
    // 1.1 Special environment: Openshift ////
    if(process.env.OPENSHIFT_NODEJS_PORT){
    	port = process.env.OPENSHIFT_NODEJS_PORT;
    	address = process.env.OPENSHIFT_NODEJS_IP;
    	console.log('Openshift detected: ' + address + ':' + port);
    }
    

    // 2. Database configuration /////////////
    
    // MongoDB
    var dbUrl = null;
	switch(environment){
		case "dev"	: dbUrl = process.env.CFG_MDB; break;
		case "test"	: dbUrl = process.env.CFG_MDB_TEST; break;
		case "prod"	: dbUrl = process.env.CFG_MDB_PROD; break;
	}
	
    if(!dbUrl){
        console.log('Config error: Environment variable CFG_MDB not set.');
    }


    // 3. Variables //////////////////////////
    
		// Token auth secret
		var tokenSecret = process.env.CFG_PWD;
		if(!tokenSecret){
			console.log('Config error: Environment variable CFG_PWD not set.');
		}


    // 4. File system ////////////////////////
    var dataFolder      = path.join(__dirname.replace("config", ""), "data");
    
    // 4.1 Special environment: Openshift
    if(process.env.OPENSHIFT_DATA_DIR){
        dataFolder      = process.env.OPENSHIFT_DATA_DIR;
    }
    
    // 4.2 Set folders
    //var someFolder = path.join(dataFolder, "submissions");    


    // Server configuration //////////////////
    /////////////////////////////////////////
    
    
    return {

		"environment"	: environment,
	
        "server" : {
			"port"      : port,
			"address"   : address	
		},
        
        "database" : {
			"url"	: dbUrl
			
		},
                
        "fs" : {
			"dataFolder"	: dataFolder		// root data folder
		},
		
		"security" : {
			
			// Secret used when generating JOTs
			"tokenSecret"	: tokenSecret,
			
			// Hashing algorithms configuration
			"hashing" : {
				
				// Password hashing & storage uses Password-Based Key Derivation Function 2
				"PBKDF2" : {
					"saltBytes"	: 32,											// Salt is 32 bytes long - longer won't make hashing longer
					"year" 		: 2016, "iterations" : 20000, "multiplier" : 2	// In 2016, iterate 20k; 2017 40k, 2018 80k, etc.
				}
			}
		}
        
    };
}