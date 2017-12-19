'use strict';
module.exports = function authenticationTokenRoleCheckMiddlewareFactory(){

    // This middleware will prevent access to routes in case all required roles are not granted.

    // Not to be mistaken with the req.tokenHasRole(role:string) added by the token-decode-middleware
    // which should be used as part of the business logic implementation of handlers.

    function requestedRolesProvided(requested, roles){
        let matching = 0;
        requested.forEach(function(role){
            matching += roles.indexOf(role) >= 0 ? 1 : 0;
        });
        return requested.length === matching;
    }

    return function authenticationTokenRoleCheck(expectedRoles){

        if(expectedRoles.constructor !== Array){
            if(typeof expectedRoles === 'string' || expectedRoles instanceof String){
                expectedRoles = [expectedRoles];
            }
            else{
                throw "Roles can only be a String or an Array. Provided: " + expectedRoles;
            }
        }

        return function(req, res, next){

            // Validate presence of a decoded token
			if(req.decodedToken && requestedRolesProvided(expectedRoles, req.decodedToken.roles)){
                next();
            }

            // Error 403: Access forbidden
            else{
                // TODO report
                // console.log('<ALERT> Tampering attempt: user [' + req.decodedToken.user + '] requested uri: ' + req.url);
                return res.sendStatus(403);
            }
        };
    };
};