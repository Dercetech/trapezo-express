# Dercetech Authentication Microservice
Written by Jérémie Mercier (Jem), based on the best practices detailed in Sophos guidelines:
https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/

Using Trapezo dependency injection library (also written by Jérémie Mercier, yay).

## Initial setup
The following ENV variables are needed:
set CFG_PWD=za0ZA9-aLongPasswordThatDoesntMakeMuchSenseUnlessItTriesToEscapeABruteforceAlgorithmButThenWhatRelevantDataDoIExposeQuesitonMark
set CFG_MDB=mongodb://127.0.0.1:27017/micro-auth
set CFG_MDB_TEST=mongodb://127.0.0.1:27017/micro-auth-test
set CFG_MDB_PROD=mongodb://127.0.0.1:27017/micro-auth-prod

## Misc & cheat sheets
Markdown syntax: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet