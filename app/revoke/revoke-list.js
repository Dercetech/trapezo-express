'use strict';
module.exports = function revokeListFactory(wtDone, config, RevokeSchema){

	let list = {};

	refreshList()
		.then( () => { 
			wtDone({
				getList				: getList,
				refreshList			: refreshList,
				revokeUser			: revokeUser,
				revokeUserBeforeNow	: revokeUserBeforeNow
			});
		})
		.catch(err => err);
	
	function getList(){
		return list;
	}
	
	function refreshList(){
				
		return new Promise( (resolve, reject) => {
			
			// Cleanup current list
			let keys = Object.keys(list);
			for(let i = 0; i < keys.length; i++){
				delete list[keys[i]];
			}
			
			RevokeSchema.find({}).lean().exec()
				.then( entries => {

					for(let i = 0; i < entries.length; i++){
						let revokeDefinition = entries[i];
						addRevokeToList(revokeDefinition.user, revokeDefinition.issuedBefore);
					}
					//console.log(Object.keys(list).length + ' revocations in place');
					resolve();
				})
				.catch( err =>  reject(err) );
		})
	}
	
	function addRevokeToList(userToRevoke, expireTokensIssuedBeforeTimestamp){
		if( (!list[userToRevoke]) || (list[userToRevoke] < expireTokensIssuedBeforeTimestamp) ){
			list[userToRevoke] = expireTokensIssuedBeforeTimestamp;
		}
	}
	
	function revokeUser(userToRevoke, issuedBefore, revocationExpires){
		
		// Add to revoke list
		addRevokeToList(userToRevoke, expireTokensIssuedBeforeTimestamp);
		
		// Save in database
		let revocation = RevokeSchema();
		revocation.user = userToRevoke;
		revocation.issuedBefore = issuedBefore;
		revocation.expiresAfter = revocationExpires;
		return revocation.save();
	}
	
	function revokeUserBeforeNow(userToRevoke){
		return revokeUser(userToRevoke, new Date().getTime() / 1000, revocation.revokeBefore + config.security.jot.expiration);
	}
}