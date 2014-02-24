/**
 * API Handler class.
 * @file: /application/private/server/ApiHandler.js
 * @author: Vladimir Bukhin
 * @Description: Sets up all the API and handling.
 */

var View= require(Config.serverRoot + 'private/view/json/View.js'),
    fs=require('fs');


var ApiController = function(app){
    /**
     * @post body: All fields optional. matches can contain any number of field-value combinations but fields cannot be duplicated.
     * Schema for input:
     *  {
     *      matches:{
     *          'fieldKey': 'exact match value',
     *          'fieldKey': /javascript regex/
     *      },
     *      location:{ //find docs near this location
     *          near: [lat, -long
     *          maxDistance: 'number' //
     *      },
     *      minDate: 'date', //any javascript date string
     *      sort:{
     *          field: 'fieldName'
     *          order: 'number' //1 or 0
     *      }
     *      limit: 'number'
     *      skip:'number'
     *  }
     *
     *  Schema for output:(example)
     *  [
     *      {
     *          completed: 'No',
                description: 'hi',
                issue_type: 'Broken Bench',
                email: 'vbslds@fhsdk.com',
                location: [ 37.76796849999999, -122.4278309 ],
                observation_date: '2012-11-29T08:05:14.650Z',
                file_info:{
                    grid_filename: '50b7173a274a9130b8000007',
                    original_filename: 'Screen Shot 2012-10-11 at 12.41.12 PM.png',
                    mime_type: 'image/png'
                },
                _id: 50b71742274a9130b800000c,
                cdnUrl: 'http://localhost:5001/50b7173a274a9130b8000007/Screen Shot 2012-10-11 at 12.41.12 PM.png'
            },
     *  ]
     *
     *
     */
    app.post('/observations/*', function(req, res, next){
        var body = req.body, query={}, options={};
        //near object queries location near the location indicated in value, maxDistance number can also be set.
        //It is also possible
        if(_.isObject(body.location)){
            var location={};
            if(_.isArray(body.location.near) && body.location.near.length == 2){
                location['$near'] =body.location.near;
                if(body.location.maxDistance && _.isNumber(parseFloat(body.location.maxDistance)) ){
                    location['$maxDistance'] =body.location.maxDistance;
                }
            }
            query['location']= location;
        }

        //Date min Handling
        if(body.minDate && new Date(body.minDate).toString() != 'Invalid Date'){
            query['observation_date']= {$gte : new Date(body.minDate).toISOString()};
        }

        if(_.isObject(body.sort) && body.sort.field ){
            options.sort= [[body.sort.field, body.sort.order]];
        }


        if(body.limit && _.isNumber(parseInt(body.limit)) ){ //if value is NaN then its still a number. Ex: parseFloat('')===NaN
            options.limit= body.limit
        }else{
            options.limit=1000;//think about this one a bit
        }
        if(body.skip && _.isNumber(parseInt(body.skip)) ){
            options.skip= body.skip
        }

        //key/value pairs where values exactly match the intended object, or values are javascript regular expressions
        if(_.isObject(body.matches)){
            _.extend(query, body.matches);
        }
        docDB.loadAll(query, options, function(err, resultArr, totalNum){
            if(err){
                next(err);
            }else{
                res.json({'results' :View.formatObservations(resultArr), totalCount: totalNum});
            }
        })
    });
    /**
     * @file: attached
     * @post body: All fields optional but field names must be these specified.
     *
     * Schema for input:
     *  {
     *      //General fields:
     *      (file attachment)
     *      location: [40.88888, -50.678898],
     *      email: 'String'
     *
     *
     *      //Parks fields
     *      description: 'string'
     *      issue_type:'string'
     *  }
     *
     *  *  Schema for output:(example)
     *      {
     *           completed: 'No',
                 description: 'hi',
                 issue_type: 'Broken Bench',
                 email: 'vbslds@fhsdk.com',
                 location: [ 37.76796849999999, -122.4278309 ],
                 observation_date: '2012-11-29T08:05:14.650Z',
                 file_info:{
                    grid_filename: '50b7173a274a9130b8000007',
                    original_filename: 'Screen Shot 2012-10-11 at 12.41.12 PM.png',
                    mime_type: 'image/png'
                 },
                 _id: 50b71742274a9130b800000c,
                 cdnUrl: 'http://localhost:5001/50b7173a274a9130b8000007/Screen Shot 2012-10-11 at 12.41.12 PM.png'
            },
     */
    app.post('/observe/*', function(req, res, next){
        var fileInfo, //path,type,name, are keys of this object given to us by the bodyparser middleware used for file uploads.
            body=req.body;
        if(!_.isObject(body) || _.isEmpty(body)){
            next(new Error('Request body does not exist or is empty.'));
            return;
        }

        var newValidObservation= _.pick(body, Config.dbFieldNames);

        //Date Handling
        if(newValidObservation.observation_date && new Date(newValidObservation.observation_date).toString() != 'Invalid Date'){
            newValidObservation.observation_date= new Date(newValidObservation.observation_date).toISOString();
        }else{
            newValidObservation.observation_date= new Date().toISOString();//default to now
        }

        //Completed Handling
        newValidObservation.completed= 'No';

        //location
        if(newValidObservation.location && _.isString(newValidObservation.location) ){
            try{
                newValidObservation.location= JSON.parse(newValidObservation.location);
            }catch(e){}
        }

        //file included
        if(req.files && (fileInfo= req.files.file) &&
            fileInfo.path && _.isString(fileInfo.path) &&
            fileInfo.type && _.isString(fileInfo.type) &&
            fileInfo.name && _.isString(fileInfo.name)){

            gridDB.writeFile(fileInfo.path, fileInfo.type, function(err, gridId){
                fs.unlink(fileInfo.path);
                if(err){
                    next(err);
                }else {
                    newValidObservation.file_info={
                        grid_filename: gridId,
                        original_filename: fileInfo.name,
                        mime_type: fileInfo.type
                    };
                    saveDocumentAndRespond();
                }
            })
        }else{
            saveDocumentAndRespond();
        }
        function saveDocumentAndRespond(){
            docDB.insert(newValidObservation, function(err, savedObservation){
                if(err){
                    next(err);
                }else {
                    res.json(View.formatObservations(savedObservation));
                }
            })
        }
    });

    /***
     * Description: Update An Observation
     * Requirement: Have the manager session cookie
     *
     * input:(example)
     * {
     *     //Parks fields
     *      description: 'string'
     *      issue_type:'string'
     * },
     *
     * output: the observation before deletion
     */
    app.post('/updateObservation/*', function(req, res, next){
        var body=req.body,
            cookies= req.cookies;

        if(cookies && cookies['observersid'] != 'authed' ){
            next(new Error('User is not authorized as a data manager.'));
            return;
        }

        if(!_.isObject(body) || _.isEmpty(body)){
            next(new Error('Request body does not exist or is empty.'));
            return;
        }

        var validKeys= _.intersection(Config.dbFieldNames, _.keys(body)),
            updateFields= _.pick(body, validKeys);

        docDB.updateOne(body.observationId,updateFields, function(err, savedObservation){
            if(err){
                next(err);
            }else {
                res.json(View.formatObservations(savedObservation));
            }
        })
    });

    /***
     * Description: Delete An Observation
     *
     * input:
     * {
     *     observationId: 'idString'
     * },
     *
     * output: the observation before deletion
     */
    app.post('/deleteObservation/*', function(req, res, next){
        var body=req.body,
            cookies= req.cookies;
        if(cookies && cookies['observersid'] != 'authed' ){
            next(new Error('User is not authorized as a data manager.'));
            return;
        }

        if(!_.isObject(body) || _.isEmpty(body)){
            next(new Error('Request body does not exist or is empty.'));
            return;
        }

        if(body.observationId){
            docDB.removeOne(body.observationId, function(err, savedObservation){
                if(err){
                    next(err);
                }else {
                    res.json(View.formatObservations(savedObservation));
                }
            })
        }else{
            next(new Error('Request body does not have observation id.'));
        }
    });
};

module.exports = ApiController;