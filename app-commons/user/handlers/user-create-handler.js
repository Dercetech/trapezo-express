'use strict';
module.exports = function userCreateHandlerFactory(config, UserSchema){
    
    return function userCreateHandler(req, res){
	
		if(!(req.body.user && req.body.pwd && req.body.roles)){
			res.status(400).send("user, pwd & roles are required");
		}
		else if(req.body.user === "me"){
			res.status(400).send("username 'me' is not valid");
		}
		else if(req.body.user === "groot"){
			res.status(400).send("username 'groot' is not valid");
		}
		else{
			let newUser = new UserSchema();
			newUser.user = req.body.user;
			newUser.pwd = req.body.pwd;
			newUser.roles = req.body.roles;
		
			newUser.save()
				.then( createdUser => {
					res.send(createdUser);
				})
				.catch( err => {
					switch(err.code){

						// 11000: Entry already exist
						case 11000: return res.status(400).send('duplicate unique id'); break;

						// Default case:
						default: return res.status(500).send(err);
					}
				});
		}
	}
}