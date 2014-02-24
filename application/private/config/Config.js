/**
 * Config class.
 * @file: /application/private/config/Config.js
 * @author: Vladimir Bukhin
 * @Description: Here lies configurables having to do with ports/server information but also
 *              information that has to do with the type of configurable observer we would like to deal with.
 */


module.exports= function(server_root, node_env){
    var Config={};

    Config.envName= node_env;
    Config.serverPort= process.env.PORT || 5000;
    Config.serverRoot= server_root;

    //Add the observer type specific information
    if(process.env.THEME_FILE){
        Config.typeConfig=require(Config.serverRoot+'private/config/'+process.env.THEME_FILE);
        console.log('Using config: '+ process.env.THEME_FILE);
    }else{
        //default
        Config.typeConfig=require(Config.serverRoot+'/private/config/Parks.js');
    }
    _.extend(Config,Config.typeConfig);

    switch(Config.envName){
        case 'prod':
            Config.cdnPort= process.env.PORT || 5000;
            Config.cdnURL= 'http://'+Config.system_info.heroku.cdn_server_name+'.herokuapp.com/';
            break;
        case 'local':
            Config.cdnPort= 5001;
            Config.cdnURL= 'http://localhost:'+Config.cdnPort +'/';
            break;
    }

    //Paths
    Config.docRoot = Config.serverRoot + "public/";
    Config.tempStorage = Config.serverRoot + 'temporaryStorage';

    Config.standardFields=[
        {
            ui_label: 'Date',
            db_field_name: 'observation_date',
            index: 'non-unique'
        },
        {
            ui_label: 'GPS Coordinates',
            db_field_name: 'location',
            index: 'spatial'
        },
        {
            ui_label: 'Email',
            db_field_name: 'email'
        }
    ];

    Config.allFields= Config.standardFields.concat(Config.typeConfig.fields);

    Config.dbFieldNames=function(){
        var fieldNames=[];
        for (var i = Config.allFields.length -1 ; i >= 0; i--){
            fieldNames.push(Config.allFields[i].db_field_name);
        }
        return fieldNames;
    }();
    return Config;
};
