'use strict';
module.exports = function userGetOneHandlerFactory(config, UserSchema){
    
    return function userGetOneHandler(req, res){ 

		let fields = "_id user";
		let user = req.params.user;
		
		if(req.tokenHasRole("admin")){
			fields += " roles";
		}
		else if(user !== req.decodedToken.user){
			return res.status(403).send('insufiscient clearance to access data from other users');	// Good to add /:user/public-profile
		}
	
        let query = {};
		query.user = user;
		        
        UserSchema.findOne(query, fields).lean().exec()
			.then( item => res.send(item) )
			.catch( err => res.status(500).send('User could not be retrieved: ' + err));
	}
}