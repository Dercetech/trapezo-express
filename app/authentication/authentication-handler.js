'use strict';
module.exports = function authenticationHandlerFactory(config, UserSchema){
    
	/*
		A good artcile Jem appreciated before writing this:
		https://dev.to/neilmadden/7-best-practices-for-json-web-tokens
	*/
	
    // Requires
    let jwt = require('jsonwebtoken');
	
	// JOT token config
	let tokenCfg = config.security.jot;

    return function authenticationHandler(req, res){

        let userName = req.body.user;
        let pwd = req.body.pwd;
		let user;

		// Step1: Look for user and validate password
        UserSchema.findOne({'user'  : userName}).select('_id user pwd roles').exec()
		.then(aUser => {
			user = aUser;
            if(!user) throw {name: 403 };
			else return user.comparePassword(req.body.pwd);
		})
		
		// Step2: Generate token
		.then(isValid => {
			if(isValid){
				let token = jwt.sign(

					// payload
					{
						'id'    : user._id,
						'user'  : user.user,
						'roles' : user.roles
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
				res.json({'token': token}); //, 'roles': user.roles});
			}
			
			else throw {name: 403};
		})
		
		.catch(err => { 
			switch(err.name){
				
				case 403	: res.sendStatus(403); break;
				default		: res.status(500).send(err);
			 }
		});
    }
}