'use strict';
module.exports = function userRouteFactory(UserSchema, authenticationTokenRoles){

    // Requires
    let express	= require('express');
    let router = express.Router();

	// Users endpoint
    router.get('/', (req, res) => { 

        var query = {};
		var fields = "_id user";
		
		if(req.tokenHasRole("admin")){
			fields += " roles";
		}
		else{
			query.user = req.decodedToken.user;
		}

        
        UserSchema.find(query, fields).lean().exec()
			.then( items => {
				res.send(items);
			})
			.catch( err => res.status(500).send('IEx tasks could not be retrieved: ' + err));
	});
	
	
	router.post('/', authenticationTokenRoles ('admin'), (req, res) => {
	
		if(!(req.body.user && req.body.pwd && req.body.roles)){
			res.status(400).send("user, pwd & roles are required");
		}
		else{
			let newUser = new UserSchema();
			newUser.user = req.body.user;
			newUser.pwd = req.body.pwd;
			newUser.roles = req.body.roles;
		
			newUser.save()
				.then( () => {
					res.send("Klaatu barada nikto!")
				})
				.catch( err => {
					switch(err.code){

						// 11000: Entry already exist
						case 11000: return res.status(400).send('duplicate unique id');

						// Default case:
						default: return res.status(500).send(err);
					}
				});
		}
	});

    return router;
}