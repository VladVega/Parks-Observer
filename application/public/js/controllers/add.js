/**
 * Add Observation AngularJS Controller
 * @file: /application/public/js/controllers/add.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for the add observation tab: error checking, form submission with image data, showing configurable fields.
 */
function AddCntrl($scope, $http, $rootScope) {
    $('img.loading.add-observation').hide();

    //extra fields - only filters though
    angular.forEach(extraFieldsArr, function(fieldObj){
        if(fieldObj.filterable && fieldObj.discrete_fields){
            $scope[fieldObj.db_field_name+ 's']=[{name:'Please Select', val:''}].concat(fieldObj.discrete_fields);
            $scope[fieldObj.db_field_name]= $scope[fieldObj.db_field_name+ 's'][0]
        }
    });

    if(!$scope.loc){
        $scope.loc= {};
    }

    var emailValidationRegex= /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

    $scope.submit= function(){
        var myFile = document.getElementById('upload_file').files[0],
            formData = new FormData(), waitingForAddressCallback= false,
            errorText='';
        $('img.loading.add-observation').show();
        if(myFile){
            formData.append('file', myFile);
        }
        if($scope.email){
            if(angular.isString($scope.email) && emailValidationRegex.test($scope.email)){
                formData.append('email', $scope.email);
            }else{
                errorText+='The email you entered is invalid. '
            }
        }else{
            errorText+='Please enter a valid email address. '
        }
        if($scope.loc){
            var location;
            if($scope.loc.useCurrentPosition && $scope.localGpsArray){
                formData.append('location', JSON.stringify($scope.localGpsArray));
            }else if($scope.loc.gps && $scope.loc.gps.long && $scope.loc.gps.lat){
                location = '['+$scope.loc.gps.lat + ','+ $scope.loc.gps.long +']';
                formData.append('location', location);
            }else if($scope.loc.address){
                waitingForAddressCallback = true;
                googleMap.getGPSLocFromAddress($scope.loc.address, function(err, lat, long){
                    if(err){
                        console.log(err);
                        waitingForAddressCallback = false;
                        return;
                    }
                    location = '['+lat + ','+ long +']';
                    console.log('address loc', location);
                    formData.append('location', location);
                    waitingForAddressCallback = false;
                });
            }
        }else{
            errorText+='Please enter either an address or gps coordinates. '
        }

        //extra fields - only filters though
        angular.forEach(extraFieldsArr, function(fieldObj){
            if(angular.isObject( fieldObj) && $scope[fieldObj.db_field_name]){
                var value;
                if(angular.isObject($scope[fieldObj.db_field_name])){
                    value= angular.isDefined($scope[fieldObj.db_field_name].val) ? $scope[fieldObj.db_field_name].val : $scope[fieldObj.db_field_name].name;
                }else{
                    value= $scope[fieldObj.db_field_name];
                }

                if(value){
                    formData.append(fieldObj.db_field_name, value);
                }else if(fieldObj.required){
                    errorText+='Please enter a value for "'+fieldObj.ui_label+'". '
                }
            }
        });

        if(errorText){
            $('img.loading.add-observation').hide();
            $('.add-observation-error').text(errorText);
            return;
        }else{
            $('.add-observation-error').text('');
        }
        // Create our XMLHttpRequest Object
        var xhr = new XMLHttpRequest();

        // Open our connection using the POST method

        xhr.onreadystatechange =angular.bind(this, function(ev){
            if (xhr.readyState == 4 && xhr.responseText) {
                try{
                    try{
                        var issue= JSON.parse(xhr.responseText);

                        $rootScope.$broadcast( 'open-modal', issue);
                        $rootScope.$digest();
                    }catch(er){}
                    $('img.loading.add-observation').hide();
                    $('.send-obs-form').each(function(){
                        this.reset();
                    });
                }catch(e){
                    console.log('unable to parse server response to form')
                }
            }
        }) ;
        xhr.open("POST", '/observe/');

        // Send the file
        var interval= setInterval(function(){
            if(!waitingForAddressCallback){
                clearInterval(interval);
                xhr.send(formData);
            }
        },100)

    };

    $scope.clearForm= function(){
        angular.forEach(extraFieldsArr, function(fieldObj){
            if(angular.isObject( fieldObj) && $scope[fieldObj.db_field_name]){
                if(angular.isObject($scope[fieldObj.db_field_name])){
                    $scope[fieldObj.db_field_name]= $scope[fieldObj.db_field_name+'s'][0];
                }else{
                    $scope[fieldObj.db_field_name]= '';
                }
            }
        });
    };

    $scope.$on( 'tab-change-to-send', function( event ) {
        googleMap.getCurrentPosition(
            function(localGpsArray){
                $scope.loc.useCurrentPosition=true;
                $scope.localGpsArray= localGpsArray;
                $scope.$digest();//recompute bound options after callback.
            });
    });

}