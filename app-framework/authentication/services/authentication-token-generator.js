'use strict';
module.exports = function authenticationTokenGeneratorFactory(config){
    
	/*
		A good artcile Jem appreciated before writing this:
		https://dev.to/neilmadden/7-best-practices-for-json-web-tokens
	*/
	
    // Requires
    const jwt = require('jsonwebtoken');
	
	// JOT token config
	const tokenCfg = config.security.jot;

    return function authenticationTokenGenerator(_id, userName, roles){

		const token = jwt.sign(

			// payload
			{
				'id'    : _id,
				'user'  : userName,
				'roles' : roles
			},
			
			// Secret
			tokenCfg.tokenSecret,
			
			// options
			{
				expiresIn  	: tokenCfg.expiration,
				header		: { }
			}
		);
		
		// Remove token header (why give hints to a script kiddie?)
		//let segments = token.split('.');
		//token = '.' + segments[1] + '.' + segments[2];
		
		// Jem sez: How to obtain token claims?
		// let tokenClaims = new Buffer(token.split('.')[1], 'base64').toString();
		return token;
    }
};