'use strict';
module.exports = function initializeSuperAdminFactory(UserSchema){
	
    return function initializeSuperAdmin(){

		return new Promise( (resolve, reject) => {
	
			UserSchema.remove({user: "groot"})
				.then( () => {
					
					if(process.env.CFG_GROOT){
						let groot = new UserSchema();
						groot.user = "groot";
						groot.pwd = process.env.CFG_GROOT;
						groot.roles = ["user", "admin", "groot"];
						console.log('WARNING: Superadmin groot is active, not recommended for prod use');
						return groot.save()
					}
					else resolve();
				})
				.then( () => resolve () )
				.catch( err => reject(err) );
		})
    }
}