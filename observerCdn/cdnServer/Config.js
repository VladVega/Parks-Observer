/**
 * Config Class.
 * @file: /cdnServer/Config.js
 * @author: Vladimir Bukhin
 * @Description: Here the mongo database and port on which to run the cdn server is selected.
 */


module.exports= function(server_root, node_env){
    var Config={};

    Config.envName= node_env;
    Config.serverRoot= server_root;
    switch(Config.envName){

        case 'prod':
            Config.cdnPort= process.env.PORT || 5000;
            break;
        case 'local':
            Config.cdnPort= 5001;
            break;
    }

    Config.mongoGridStoreConnectionURL = 'mongodb://heroku_app9013164:sgrmf52r23v6ifqpr1bufu4cdq@ds041367.mongolab.com:41367/heroku_app9013164';

    return Config;
};
