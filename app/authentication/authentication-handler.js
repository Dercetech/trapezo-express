'use strict';
module.exports = function authenticationHandlerFactory(config, UserSchema, authenticationTokenGenerator){
    
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
				let token = authenticationTokenGenerator(user._id, user.user, user.roles);
				res.set("Authorization", token);
				res.send("OK");
			}
			else throw {name: 401};
		})
		
		.catch(err => { 
			switch(err.name){
				case 401	: res.sendStatus(401); break;
				default		: res.status(500).send(err);
			 }
		});
    }
}