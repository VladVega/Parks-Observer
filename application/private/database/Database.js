/**
 * Database utility class.
 * @file: /application/private/database/Database.js
 * @author: Vladimir Bukhin
 * @Description: All document store access revolves around the interface provided by this class.
 */


 var mongo = require('mongodb'),
     observationCollectionName= 'observations';

function Database(){//not a singlton so that program can open multiple connections with a single node instance.
    this.db=null;
}

Database.prototype={

	/**
	 * This method initializes the database class.
	 */
	start: function (callback){
        var s= this;
        mongo.connect(Config.system_info.mongo_uri.document_store , {}, function(err, db){
            if(err){
                callback(err);
                return;
            }
            s.db=db;
            s.initCollectionsAndIndexs(callback);
        });
	},

    //this is done every time so that config-added fields or indexes take effect. nothing happens if nothing changes.
    initCollectionsAndIndexs: function(callback){
        this.db.createCollection(observationCollectionName, function(err,collection){
            var arrFuncts=[];
            _.each(Config.allFields,function(field){
                var options={}, index;
                if(field.index == 'unique'){
                    options['unique']=true;
                    index= field.db_field_name;
                }else if (field.index == 'spatial'){
                    index= {};
                    index[field.db_field_name]="2d";
                }else if(field.index == 'non-unique'){
                    index= field.db_field_name;
                }else{
                    return;
                }
                arrFuncts.push(function(callback){
                    collection.ensureIndex(index, options, callback);
                });
            });
            Async.parallel(arrFuncts, callback);
        });
    },

    loadAll: function(query, options, callback){
        _.extend((options || {}), {safe: true});
        this.db.collection(observationCollectionName, function(err, collection){
            if (err){
                callback(err);
                return;
            }
            collection.find(query, null, options, function(err, cursor){
                if(err){
                    callback(err);
                    return;
                }

                var totalNum;
                cursor.count(function(err, count){
                    totalNum=count;
                    cursor.toArray(function(err, docs){
                        callback(null, docs, totalNum);
                    });
                });
                cursor.explain(function(err, docs){
                    var validKeys= _.intersection([
                            'cursor',
                            'n', //number matched docs found
                            'nscannedObjects', //documents only
                            'nscanned', //documents and indexes
                            'scanAndOrder', //true when the query cannot use the index for returning sorted results.
                            //'indexOnly', //true if completely covered by index
                            'millis', //time taken
                            'indexBounds' //index bounds used
                        ], _.keys(docs)),
                        explain= _.pick(docs, validKeys);
                    console.log('query', query,' num_limit: ', options.limit, ' sort_options: ', options.sort);
                    console.log('explain:');
                    console.dir( explain);
                    console.log('Total num:', totalNum);

                });
            });






        });
    },
	/**
	 * This method saves one object.
	 * @param: obj is the json object to be saved. Must not contain '_id' field.
	 * @param: collectionName
	 * @param: index
	 * @return: Callback full object saved or error.
	 */
	insert: function (obj, callback){
        this.db.collection(observationCollectionName, function(err, collection){
            if (err){
                callback(err);
                return;
            }

            collection.insert(obj, {safe:true}, function(err, object) {
                if(err){
                    callback(err);
                    return;
                }
                callback(null, _.isArray(object) ? object[0] : object);
            });
		});
	},

    updateOne: function (id, updates, callback){
        var s= this;
        this.db.collection(observationCollectionName, function(err, collection){
            if (err){
                callback(err);
                return;
            }

            collection.findAndModify({_id: new s.db.bson_serializer.ObjectID(id)},{},
                    {$set:updates}, {new: true}, function(err, object) {
                if(err){
                    callback(err);
                    return;
                }
                callback(null, _.isArray(object) ? object[0] : object);
            });
        });
    },
    removeOne: function (id, callback){
        var s= this;
        this.db.collection(observationCollectionName, function(err, collection){
            if (err){
                callback(err);
                return;
            }

            collection.findAndModify({_id: new s.db.bson_serializer.ObjectID(id)},{}, {}, {remove: true}, function(err, object) {
                if(err){
                    callback(err);
                    return;
                }
                callback(null, _.isArray(object) ? object[0] : object);
            });
        });
    }
};

module.exports = Database;