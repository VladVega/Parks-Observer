/**
 * Grid Database utility class.
 * @file: /cdnServer/database/GridFS.js
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
        mongo.connect(Config.mongoGridStoreConnectionURL , {}, function(err, db){
            s.db=db;
            callback(err);
        });
    },
	getReadStream: function(filename, callback){
        var gs = new GridStore(this.db, filename, "r");
        gs.open(function(err, gridStore) {
            callback(err, gridStore.stream(), gridStore.contentType)
        });
	},
	newStringId: function(){
		return new this.db.bson_serializer.ObjectID().toString();
	}
};

module.exports = GridFS;
