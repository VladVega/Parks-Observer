/**
 * Utility Class
 * @file: /application/public/js/utility.js
 * @author: Vladimir Bukhin
 * @Description: Contains utility functions for front end javascript.
 */

var Utility= (function(){
    return {
        getFormattedDate: function(isoDateStr){
            return new Date(isoDateStr).toUTCString();
        }
    };
}());