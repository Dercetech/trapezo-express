'use strict';
module.exports = function userUpdateHandlerFactory(config, UserSchema){
    
    return function userUpdateHandler(req, res){
	
		let user = req.params.user;
		let updateStatements = {};
		let fieldsToUpdateCount = 0;
		
		let adminOnlyFields = ["user", "roles"];
		let allUsersFields = [];
		
		// Admins can update userName and roles
		if(req.tokenHasRole("admin")){
			// Username 'me' must be rejected
			if(req.body.user){
				switch(req.body.user){
					case "me" : return res.status(400).send("username 'me' is not valid");
					case "groot" : return res.status(400).send("username 'groot' is not valid"); break;
					default : break;
				}
			}
			
			for(let field of adminOnlyFields) {
				if(req.body[field]) {
					updateStatements[field] = req.body[field];
					fieldsToUpdateCount++;
				}
			}
		}
		
		// Regular users won't be allowed updating another user's data
		else if(user !== req.decodedToken.user){
			return res.status(403).send('insufiscient clearance to update data from other users');	// TODO Should store a tamper alert for this user
		}
		
		// With these checks in place, it is now safe to iterate over all-user update fields
		for(let field of allUsersFields) {
			if(req.body[field]){
				updateStatements[field] = req.body[field];
				fieldsToUpdateCount++;
			}
		}
		
		// Update query options
		let options = {
			//multi: false		// this to perform the updateOne equivalent. Still, it's based on user name, which should be unique by index
			new: true			// return the altered document
		}
		
		// Special treatement for passwords - the preSave hashing&co must run
		if(req.body.pwd){
			UserSchema.findOne({user: user}).exec()
			.then(theUser => {
				theUser.pwd = req.body.pwd;
				return theUser.save()
			})
			.then( theUser => {
				if(fieldsToUpdateCount) updateFields();
				else res.send(theUser);
			})
			.catch(err => {
				return res.status(500).send(err);
			});
		}
		
		else updateFields();
		
		function updateFields() {
			UserSchema.findOneAndUpdate({user: user}, updateStatements, options)
				.then(updatedUser => {
					delete updatedUser.__v;
					res.send(updatedUser);
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