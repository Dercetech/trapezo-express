'use strict';
module.exports = function userDeleteHandlerFactory(config, UserSchema){
    
    return function userDeleteHandler(req, res){
		
		let user = req.params.user;
		
		// Admins alone can delete users - "delete me" should be achieve by disabling the user by his own request
		if(req.tokenHasRole("admin")){
			
			// Username 'me' must be rejected
			if(user === "me"){
				return res.status(400).send("username 'me' is not valid");
			}
			
			// Username 'groot' can only be deleted by groot
			else if(user === "groot"){
				return res.status(403).send("I am groot");
			}
			
			else{
				UserSchema.remove({user: user})
				.then( () => {
					res.send("OK");
				})
				.catch( err => {
					return res.status(500).send(err);
				})
			}
		}
		
		else return res.status(403).send('insufiscient clearance to delete a user');	// TODO Should store a tamper alert for this user
	}
};