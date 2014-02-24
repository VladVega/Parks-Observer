/**
 * Map Tab AngularJS Controller
 * @file: /application/public/js/controllers/map.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for retrieving observations as map markers subject to filtration.
 */

function MapCntrl($scope, $http, $rootScope) {

    $scope.daysLimits=[
        {name: 'All'},
        {name: 'Day', val:1},
        {name: 'Week', val:7},
        {name: 'Thirty Days', val:30},
        {name: 'Year', val:365}
    ];
    $scope.daysLimit=$scope.daysLimits[0];

    $scope.distanceFilters=[{name: 'All'}];
    var radiuses= [1,2,5,10];
    angular.forEach(radiuses, function(radius){
        $scope.distanceFilters.push({
            name: 'Within '+radius+' degree radius.',
            field:'location',
            maxDistance: radius
        });
    });
    $scope.distanceFilter= $scope.distanceFilters[0];

    //extra fields
    angular.forEach(extraFieldsArr, function(fieldObj){
        if(fieldObj.filterable && fieldObj.discrete_fields){
            $scope[fieldObj.db_field_name+ 's']=[{name:'All'}].concat(fieldObj.discrete_fields)
            $scope[fieldObj.db_field_name]= $scope[fieldObj.db_field_name+ 's'][0]
        }
    });

    $scope.getData= function(){
        var query={},date;
        if($scope.daysLimit.val){
            date = new Date();
            date.setDate(date.getDate() - $scope.daysLimit.val);
            query.minDate=date.toISOString();
        }
        if($scope.distanceFilter.field){
            $scope.distanceFilter.near= $scope.localGpsArray;
            query.location=$scope.distanceFilter;
        }

        angular.forEach(extraFieldsArr, function(fieldObj){
            if(angular.isObject($scope[fieldObj.db_field_name]) && $scope[fieldObj.db_field_name].name != 'All' ){
                if(!angular.isObject(query.matches)){
                    query.matches={};
                }
                query.matches[fieldObj.db_field_name]=$scope[fieldObj.db_field_name].val || $scope[fieldObj.db_field_name].name;
            }
        });
        $http.post("/observations/",query).success(function(resultJSON){
            var data= resultJSON.results;
            if(angular.isNumber(resultJSON.totalCount)){
                $scope.totalCount=resultJSON.totalCount;
                console.log('total count:', $scope.totalCount);
            }
            googleMap.createMarkers(data);
        });
    };
    $scope.$on( 'tab-change-to-map', function( event ) {
        googleMap.createFull(
            function(issue){
                $('#globalModal').modal('show');
                $rootScope.$broadcast( 'open-modal', issue, $scope.getData );
                $rootScope.$digest();
            }
            ,function(localGpsArray){
                $scope.localGpsArray= localGpsArray;
                $scope.$digest();//recompute bound options after callback.
        });
        $scope.getData();
    });

}