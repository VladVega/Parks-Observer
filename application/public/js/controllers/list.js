/**
 * List Tab AngularJS Controller
 * @file: /application/public/js/controllers/list.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for retrieving observations in a list based on filtration.
 */

function ListCntrl($scope, $http, $rootScope) {

    //controls
    $scope.daysLimits=[
        {name: 'All'},
        {name: 'Day', val:1},
        {name: 'Week', val:7},
        {name: 'Thirty Days', val:30},
        {name: 'Year', val:365}
    ];
    $scope.daysLimit=$scope.daysLimits[0];

    $scope.maxItemsLimits=[
        {name: 'All'},
        {name: '10', val:10},
        {name: '20', val:20},
        {name: '50', val:50},
        {name: '100', val:100}
    ];
    $scope.maxItemsLimit=$scope.maxItemsLimits[1];

    //extra fields
    angular.forEach(extraFieldsArr, function(fieldObj){
        if(fieldObj.filterable && fieldObj.discrete_fields){
            $scope[fieldObj.db_field_name+ 's']=[{name:'All'}].concat(fieldObj.discrete_fields)
            $scope[fieldObj.db_field_name]= $scope[fieldObj.db_field_name+ 's'][0]
        }
    });

    $scope.formatDate= function(isoDate){
        return Utility.getFormattedDate(isoDate);
    };

    //table
    $scope.columns = [
        {name: "Date", fieldKey: "observation_date"},
        {name: "Location", fieldKey: "location"}

    ];
    angular.forEach(extraFieldsArr, function(fieldObj){
        if(angular.isObject(fieldObj)){
            $scope.columns.push({name: fieldObj.ui_label, fieldKey: fieldObj.db_field_name})
        }
    });
    $scope.columns.push({name: "Image", fieldKey: "cdnUrl"});

    $scope.getDataResult= function(){
        return $scope.dataResult;
    };

    //sorting
    $scope.sort = {
        column: 'name',
        descending: false
    };

    $scope.selectedCls = function(column) {//TODO
        return column == $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    $scope.changeSorting = function(column) {
        var sort = $scope.sort;
        if (sort.column == column) {
            sort.descending = !sort.descending;
        } else {
            sort.column = column;
            sort.descending = false;
        }
    };



    $scope.openModal= function(row){
        $rootScope.$broadcast( 'open-modal', row, $scope.getData);
    };

    $scope.page=1;

    $scope.paginateNext= function(){
        if($scope.hasNext){
            $scope.page += 1;
            $scope.getData();
        }
    };
    $scope.paginatePrevious= function(){
        if($scope.hasPrevious){
            $scope.page -= 1;
            $scope.getData();
        }
    };

    //get data
    $scope.getData= function(resetPagination){
        var query={},date;

        if(resetPagination){
            $scope.page=1;
        }

        if($scope.daysLimit.val){
            date = new Date();
            date.setDate(date.getDate() - $scope.daysLimit.val);
            query.minDate=date.toISOString()
        }

        query.sort={
            field: 'observation_date',
            order: 'desc'
        };

        if($scope.maxItemsLimit.val){
            var limit= parseInt($scope.maxItemsLimit.val);
            query.limit= limit + 1; //add one to find out if there is a next
            query.skip= limit * ($scope.page - 1);
        }

        angular.forEach(extraFieldsArr, function(fieldObj){
            if(angular.isObject($scope[fieldObj.db_field_name]) && $scope[fieldObj.db_field_name].name != 'All' ){
                if(!angular.isObject(query.matches)){
                    query.matches={};
                }
                query.matches[fieldObj.db_field_name]= $scope[fieldObj.db_field_name].val || $scope[fieldObj.db_field_name].name;
            }
        });

        $http.post("/observations/",query).success(function(resultJSON){
            var data= resultJSON.results;
            if(angular.isArray(data)){
                if(limit < data.length){
                    data.pop();
                    $scope.hasNext= true;
                }else{
                    $scope.hasNext= false;
                }
                $scope.hasPrevious= $scope.page > 1 ;
                $scope.dataResult = data;
            }
            if(angular.isNumber(resultJSON.totalCount)){
                $scope.totalCount=resultJSON.totalCount;
                console.log('total count:', $scope.totalCount);
            }
            $scope.showObservationNumbers= ((query.skip) + (data.length ? 1 : 0) ) +'-'+ ((data.length) + query.skip);
        });
    };


    $scope.$on( 'tab-change-to-list', function( event ) {
        $scope.getData();
    });

    //Resize images depending on screen size
    $scope.image_height = window.innerWidth/40;
    $scope.image_width = window.innerHeight/40;
    angular.element(window).bind('resize', function() {
        $scope.image_height = window.innerWidth/40;
        $scope.image_width = window.innerHeight/40;
        $scope.$apply();
    });
}