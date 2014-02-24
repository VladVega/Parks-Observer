/**
 * Main
 * @file: /application/private/main.js
 * @author: Vladimir Bukhin
 * @Description: File that is called to run the application. Starts database connections, calls server start and initializes
 * node libraries and globals.
*/


//Global utility, Config, and db class references
Config=null;
_ = require('underscore');
Async = require('async');
Ejs= require('ejs');
docDB= null;
gridDB= null;

//Only for initializations - stops process. Global
HandleError= {
    init: function( err, thingThatFailedToInit ){
        if(err){
            console.log(thingThatFailedToInit + ' connection start error');
            console.dir(err);
            process.exit();
        }
    }
};

(function(){

    var server_root= __dirname.substr(0,__dirname.indexOf('private') ),
        node_env= process.env.NODE_ENV,
        fs= require('fs');
    console.log('Server Root: ',server_root );
    Config = require(server_root+'private/config/Config.js')(server_root, node_env);

    docDB= new (require(Config.serverRoot + 'private/database/Database.js'))();
    gridDB= new (require(Config.serverRoot + 'private/database/GridFS.js'))();

    var AppServer= require(Config.serverRoot + 'private/server/AppServer.js'),
        ApiHandler= require(Config.serverRoot + 'private/server/ApiHandler.js');

    function startDatabases(callback){
        docDB.start(function(err){
            HandleError.init( err, 'Document Database' );

            gridDB.start(function(err){
                HandleError.init( err, 'Grid Database' );

                console.log('Started databases successfully.');
                callback();
            });
        });
    }

    startDatabases(function(){

        fs.mkdir(Config.tempStorage, 0755);//create storage dir

        AppServer.setup(function(app){
            ApiHandler(app);
        });
    })
}());

