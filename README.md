# Trapezo-Express server
**Trapezo-Express** is the project stub proposed by [Jérémie Mercier (Jem)](https://www.linkedin.com/in/jeremiemercier/) implementing the seamless [Trapezo](https://github.com/Dercetech/trapezo) dependency injection framework for Node.js. [Follow Jem's projects on twitter](https://twitter.com/dercetech).

## Quick start
You may begin with running the tests. To do so:
- install [MongoDB](https://www.mongodb.com/download-center#community) (community edition will do)
- Set the below environment variables
- run `npm install`
- run `npm test` and see all 50 tests succeed.
-- Mocha tests will automatically set the environment to "test"
-- See "test/test-env-setup.js"

Environment variables in Windows:
`set CFG_PWD=aPasswordToSecureToken`
`set CFG_MDB_TEST=mongodb://127.0.0.1:27017/trapezo-xp-test`

Environment variables in UNIX/MacOS:
`CFG_PWD=aPasswordToSecureToken`
`CFG_MDB_TEST=mongodb://127.0.0.1:27017/trapezo-xp-test`
## Installation
### Environment variables in dev
Development is the default environment. No specific variable is to be set to run in development mode.

`set CFG_PWD=aPasswordToSecureToken_forDev`
`set CFG_MDB=mongodb://127.0.0.1:27017/trapezo-xp-dev`
- **hint** Remove the `set` command on UNIX/MacOS machines.

### Environment variables in production

`set CFG_PWD=aPasswordToSecureToken_forProd`
`set CFG_MDB_PROD=mongodb://127.0.0.1:27017/trapezo-xp-prod`
`set NODE_ENV=prod`
- **hint** Remove the `set` command on UNIX/MacOS machines.
- **hint** Environment check at runtime available in `process.env.NODE_ENV`.
## Developer guide
By convention, all configuration files are under the `./config` root folder.
A client facing website or app can be stored under `./public/www`.
**Most of your work** should happen under the `./app/` folder. Check the existing files & folders:
- each subfolder represents a domain: authentication, user, routes, your custom services & domaines.
- Take `./app/routes` and inspect `routes.tz.js`, `routes.js` and `api-route.js` as these define the REST api scruture and authentication middleware usage.
- Note that `require` calls are made within `.tz.js` files. Learn more about these on the [Github readme page of Trapezo](https://github.com/Dercetech/trapezo).
- It's best to copy-paste existing schema (`./app/user/`), routes, handlers and middlewares from the existing files.
## Notes
- Token Authentication is written based on the best practices detailed in the [Sophos guidelines](https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/).
- [Token revocation](https://github.com/Dercetech/token-revoke) is made available via a Trapezo-Express plugin (currently under development).
- Improvements will be added later on both as updates and plugins.
## History
- **version 1.0.0** : Rebranded [authentication micro service](https://github.com/Dercetech/auth-microservice) to offer a project stub allowing to focus on implementing business logic rather than rewriting the common denominator of cloud projects.
- **Prior to 1.0.0** : see Jérémie Mercier's [authentication micro service](https://github.com/Dercetech/auth-microservice) for full Git history.