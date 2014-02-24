/**
 * Home Tab AngularJS Controller
 * @file: /application/public/js/controllers/home.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for loading the home pag map data onto the screen.
 */
function HomeCntrl($scope, $http, $rootScope) {
    $scope.getData= function(){
        $http.post("/observations/",{}).success(function(resultJSON){
            var data= resultJSON.results;
            googleMap.setStaticMarkers(data);
        });
    };
    $scope.getData();
    $scope.$on( 'tab-change-to-home', function( event ) {
        googleMap.createStatic();
        $scope.getData();
    });

}