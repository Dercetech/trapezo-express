let gulp		= require('gulp');
let spawn       = require('child_process').spawn;

gulp.task('default', () => {
    console.log('');
    console.log('Set env variables and start');
    console.log(' > Say "gulp run:dev"                use local Mongo server and serve API for dev.');
    console.log(' > Say "gulp run:prod"               use local Mongo server and serve API for prod.');
    console.log('');
});

gulp.task('set-env:prod', () => {
    process.env.CFG_ENV = 'prod';
    process.env.CFG_GROOT = 'groot';
    process.env.CFG_PWD = 'aProductionPasswordTocChange';
    process.env.CFG_MDB= 'mongodb://127.0.0.1:27017/my-app';
});

gulp.task('set-env:dev', () => {
    process.env.CFG_ENV = 'dev';
    process.env.CFG_GROOT = 'groot';
    process.env.CFG_PWD = 'CanIHazCheezburgarz';
    process.env.CFG_MDB= 'mongodb://127.0.0.1:27017/my-app';
});

gulp.task('run:dev', ['set-env:dev'], function(done) {
    spawn('node', ['index.js'], { stdio: 'inherit' });
});


gulp.task('run:prod', ['set-env:prod'], function(done) {
    spawn('node', ['index.js'], { stdio: 'inherit' });
});
