/**
 * Grid Database utility class.
 * @file: /application/private/database/GridFS.js
 * @author: Vladimir Bukhin
 * @Description: All grid store access revolves around the interface provided by this class.
 */

var mongo = require('mongodb'),
    GridStore =  mongo.GridStore;

function GridFS(){
    this.db=null;
}

GridFS.prototype={
    start: function(callback){
        var s= this;
        mongo.connect(Config.system_info.mongo_uri.grid_store , {}, function(err, db){
            s.db=db;
            callback(err);
        });
    },

	writeFile: function(filePath, contentType, callback){
        var s= this;
        var fname= s.newStringId() ,
            gs = new GridStore(this.db, fname, "w", {content_type: contentType} );
        gs.open(function(err, gs) {
            if(err){
                callback(err);
                return;
            }
            gs.writeFile( filePath, function(err){
                if(err){
                    callback(err);
                    return;
                }
                gs.close(function(err, result){
                    if(err){
                        callback(err);
                        return;
                    }
                    callback(null, fname);
                });
            });

		});
	},
	//will need be stream later for better perfomance.
	read: function(filename){
        var s= this;
		return function(callback, error){
			GridStore.read(s.db, filename, function(err, data){
				if(err){
                    error(ErrorHandler.createNew( 2, err, 'could not read from grid',  null ,{ fname: filename }));
                }else{
					callback(data);
				}
			});
		};
	},

	removeOne: function(filename){
        var s= this;
		return function(callback, error){
			GridStore.unlink(s.db, filename, function(err) {
				if(err){
                    error(ErrorHandler.createNew( 2, err, 'could not read from grid',  null ,{ fname: filename }));
                }else{
                    callback();
				}
            });
		};
	},
	newStringId: function(){
		return new this.db.bson_serializer.ObjectID().toString();
	}
};

module.exports = GridFS;
