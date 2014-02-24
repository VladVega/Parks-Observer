/**
 * Json Views
 * @file: /application/private/view/json/View.js
 * @author: Vladimir Bukhin
 * @Description: File that formats observation JSON views.
*/
var View= {
    formatObservations: function(db_observations){
        var result;
        if(_.isArray(db_observations)){
            result = [];
            _.each(db_observations, function(db_observation){
                result.push(View.formatOneObservation(db_observation));
            });
        }else if(_.isObject(db_observations)){
            result= View.formatOneObservation(db_observations);
        }
        return result;
    },
    formatOneObservation: function(db_observation){
        var file_info= db_observation.file_info;
        if(_.isObject(db_observation.file_info)){
            db_observation.cdnUrl= Config.cdnURL+ file_info.grid_filename + '/' + file_info.original_filename;
        }
        return db_observation;
    }
};

module.exports= View;