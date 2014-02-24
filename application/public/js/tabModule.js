/**
 * Tab module
 * @file: /application/public/js/tabModule.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for switching tab content and restful hash urls.
 */

angular.module('tabModule', []).
    directive('tabs', function($rootScope) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: function($scope, $element, $route) {
                var panes = $scope.panes = [];

                //tooltips for tabs
                setTimeout(function(){
                    $($element).find('li').each(function(i, elem){
                        $(elem).tooltip({});
                    });
                },1);

                //On hash url change
                $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
                    var hash= window.location.hash;
                    var newPaneName= hash.split('/')[1] || 'home';
                    if($scope.currPaneName != newPaneName){//don't reload if same pane
                        $scope.currPaneName=newPaneName;
                        $scope.select(newPaneName);
                        $(document).scrollTop(0);
                    }

                });

                $scope.select = function(name) {
                    angular.forEach(panes, function(pane) {
                        pane.selected= (pane.name == name );
                    });
                    setTimeout(function(){
                        // needs to happen after tab change dom process has occured especially after the initial load of the controller.
                        $rootScope.$broadcast( 'tab-change-to-'+name );
                    },1)
                };

                this.addPane = function(pane) {
                    if (panes.length == 0) $scope.select(pane);
                    panes.push(pane);
                }
            },
            template:
                '<div class="tabbable">' +
                    '<ul class="nav nav-tabs">' +
                    '<li ng-repeat="pane in panes" ng-class="{active: pane.selected}" title="{{pane.tooltip}}">'+
                    //'<a href="#{{pane.title}}" ng-click="select(pane)">{{pane.title}}</a>' +
                    '<a ng-href="#/{{pane.name}}/">{{pane.title}}</a>' +
                    '</li>' +
                    '</ul>' +
                    '<div class="tab-content" ng-transclude></div>' +
                    '</div>',
            replace: true
        };
    }).
    directive('pane', function() {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@', name:'@', tooltip:'@' },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template:
                '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
                    '</div>',
            replace: true
        };
    });
