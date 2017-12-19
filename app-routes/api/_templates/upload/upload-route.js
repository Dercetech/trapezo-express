'use strict';
module.exports = (config) => {
    
    // Requires
    const express	= require('express');
    const router	= express.Router();

    const fs      = require('fs');
    const path    = require('path');
    const Promise = require("bluebird");
    const formidable = require('formidable');   // https://github.com/felixge/node-formidable - non-buffered direct-to-disk form/file uploader

    const baseUploadFolder = config.filesystem.uploads;

    // Greet the curious one
    router.get('/', (req, res) => res.send('Please POST formdata.') );


    function onFileBegin(formFieldName, file){
        file.path = path.join(baseUploadFolder,  file.name);
    }

    function onFile(formFieldName, file){
        console.log('> file ' + file.name + ' was received. POST formdata field: ' + formFieldName);
    }

    function onEnd(){
        console.log('-> files were uploaded successfully');
    }

    router.post('/', [], (req, res) => {

        const form = new formidable.IncomingForm();

        // Hash the inbound file
        form.hash = 'sha256';

        form.on('fileBegin', onFileBegin);  // as a file upload has started
        form.on('file', onFile);            // as a file is received
        form.on('end', onEnd);              // after files are uploaded, before parse

        form.parse(req, (err, fields, files) => {
            res.json({});
        });
    });




    return router;
};