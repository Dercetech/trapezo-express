'use strict';
module.exports = function initializeAdminFactory(UserSchema){

    return () => new Promise( (resolve, reject) => {

        UserSchema.remove({user: "groot"})
            .then( () => {

                if(process.env.CFG_GROOT){
                    let groot = new UserSchema();
                    groot.user = "groot";
                    groot.pwd = process.env.CFG_GROOT;
                    groot.roles = ["user", "admin", "groot"];
                    console.log('WARNING: Superadmin is active, not recommended in continuous production mode.');
                    return groot.save()
                }
                else resolve();
            })
            .then( () => resolve () )
            .catch( err => reject(err) );
    });
};