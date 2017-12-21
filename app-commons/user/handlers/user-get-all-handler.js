'use strict';
module.exports = function userGetAllHandlerFactory(config, UserSchema){
    
    return function userGetAllHandler(req, res){

        let query = {};
		let fields = "user";
		
		if(req.tokenHasRole("admin")){
			fields += " _id";
			fields += " roles";
		}
		else{
			query.user = req.decodedToken.user;
		}
        
        UserSchema.find(query, fields).lean().exec()
			.then( items => {
				res.send({ users: items });
			})
			.catch( err => res.status(500).send('Users could not be retrieved: ' + err));
	}
}