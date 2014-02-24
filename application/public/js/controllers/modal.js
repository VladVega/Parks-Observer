/**
 * Modal AngularJS Controller
 * @file: /application/public/js/controllers/modal.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for callling manager updates and showing modal data to users.
 */

function ModalCntrl($scope, $http, $rootScope) {

    $scope.$on( 'open-modal', function( event, data, refreshDataList ) {
        console.log('modal data', data);
        $scope.editing=false;
        $scope.savingInProgress=false;
        var modalElem= $('#globalModal'),
            image= modalElem.find('img.modal-image'),
            map= modalElem.find('#map_canvas_one_marker').hide(),
            mapLoader=modalElem.find('.loading-map').show(),
            imageLoader= modalElem.find('.loading-modal-image').hide();

        if(!$scope.data || $scope.data.cdnUrl != data.cdnUrl){//make sure image is different from previous otherwise it wont show later.
            image.hide();
            imageLoader.show();
        }
        $scope.data=data;

        angular.forEach(extraFieldsArr, function(fieldObj){
            if(fieldObj.filterable && fieldObj.discrete_fields){
                $scope[fieldObj.db_field_name+ 's']=fieldObj.discrete_fields;
                var selectedObj;
                angular.forEach($scope[fieldObj.db_field_name+ 's'], function(fieldOption){
                    if(fieldOption.name == $scope.data[fieldObj.db_field_name]){
                        selectedObj= fieldOption;
                    }
                });
                if(angular.isObject(selectedObj)){//if there is a choice already selected
                    $scope[fieldObj.db_field_name]=selectedObj;
                }else{//if nothing selected
                    $scope[fieldObj.db_field_name]= $scope[fieldObj.db_field_name+ 's'][0];
                }
            }else{
                $scope[fieldObj.db_field_name]= $scope.data[fieldObj.db_field_name];
            }
        });

        $scope.deleteEntry= function(){
            var confirmed= confirm('Are you sure you want to delete?');
            if(confirmed){
                $http.post("/deleteObservation/", {observationId: $scope.data._id}).success(function(newIssue){
                    modalElem.modal('hide');
                    refreshDataList();
                });
            }

        };

        $scope.saveChanges= function(){
            var formData={};
            $scope.savingInProgress=true;

            angular.forEach(extraFieldsArr, function(fieldObj){
                if(angular.isObject( fieldObj) && $scope[fieldObj.db_field_name]){
                    var value;
                    if(angular.isObject($scope[fieldObj.db_field_name])){
                        value= $scope[fieldObj.db_field_name].val || $scope[fieldObj.db_field_name].name;
                    }else{
                        value=  $scope[fieldObj.db_field_name];
                    }
                    if( $scope.data[fieldObj.db_field_name] != value){
                        formData[fieldObj.db_field_name]= value;
                    }
                }
            });

            if(!jQuery.isEmptyObject(formData)){
                formData.observationId= $scope.data._id;
                $http.post("/updateObservation/", formData).success(function(newIssue){
                    $rootScope.$broadcast( 'open-modal', newIssue, refreshDataList);
                    refreshDataList();
                });
            }else{
                $scope.editing = false;
            }
        };

        setTimeout(function(){
            if(modalElem.is(":visible")){
                loadMapAndImage();
            }else{
                modalElem.on('shown', function () {
                    loadMapAndImage()
                });
                modalElem.modal('show');
            }
        },
 2);
        function loadMapAndImage(){
            var modalBody= modalElem.find('.modal-body');
            image.ready(function(){//executed only if image is different from previous
                imageLoader.hide();
                var originalBodyHeight= modalBody.height();
                image.show();
                //modalBody.height(originalBodyHeight + image.height());
            });
            //console.log('data location', data.location);
            googleMap.createPartial(data.location);
            mapLoader.hide();
            //var originalBodyHeight= modalBody.height();
            map.show();
            //map.height(originalBodyHeight + map.height());

        }
    });

    $scope.formatDate= function(isoDate){
        return Utility.getFormattedDate(isoDate);
    };







}