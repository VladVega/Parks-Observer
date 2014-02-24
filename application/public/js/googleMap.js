/**
 * Google Map interface class
 * @file: /application/public/js/googleMap.js
 * @author: Vladimir Bukhin
 * @Description: Responsible for creating google map and managing markers and current location.
 */

var googleMap= (function(){
    var mapObj,localMap,localMarker, onMarkerClickHandler, geocoder, currentlocation, currentMarkers=[], staticMap, staticMarkers=[];

    return {
        createFull: function(markerClickHandler, currentLocationAvailable){
            if(mapObj){
                google.maps.event.trigger(mapObj, "resize");
            }else{
                var mapOptions = {
                    center: new google.maps.LatLng(39.50, -98.35),
                    zoom: 4,
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                    sensor: true
                };
                mapObj = new google.maps.Map(document.getElementById("map_canvas_full"), mapOptions);
                onMarkerClickHandler= markerClickHandler;
            }
            if(currentLocationAvailable){
                this.getCurrentPosition(currentLocationAvailable, true)
            }
        },
        getCurrentPosition: function(currentLocationAvailable, showLocationOnMap){
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    currentlocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    if(showLocationOnMap){
                        var centerMarker = new google.maps.Marker({
                            map: mapObj,
                            position: currentlocation,
                            title: 'You are here.',
                            icon: {fillColor: 'blue',path: google.maps.SymbolPath.CIRCLE,
                                scale: 4}

                        });
                    }

                    //mapObj.setCenter(currentlocation);
                    if(typeof currentLocationAvailable == 'function'){
                        currentLocationAvailable([position.coords.latitude, position.coords.longitude]);
                    }
                }, function() {
                    //no geolocation
                });
            }
        },
        createPartial: function(loc){
            var locArr, canvas=$("#map_canvas_one_marker");
            if(!loc){
                canvas.hide();
                return;
            }else if(angular.isString(loc)){
                try{
                    locArr= JSON.parse(loc);
                }catch(e){
                    canvas.hide();
                    return;
                }
            }else{
                locArr= loc;
            }
            canvas.show();
            var position= new google.maps.LatLng(locArr[0], locArr[1]);

            canvas.height($('.modal').width()/2.5);
            if(!localMap){
                var mapOptions = {
                    center: position,
                    zoom: 8,
                    mapTypeId: google.maps.MapTypeId.TERRAIN
                };
                localMap= new google.maps.Map(document.getElementById("map_canvas_one_marker"), mapOptions);
                localMarker= new google.maps.Marker({
                    position: position,
                    map: localMap
                });
            }else{
                localMap.setCenter(position);
                localMarker.setPosition(position);
            }
            google.maps.event.trigger(localMap, "resize");

        },
        clear: function(markers){
            while(markers.length){
                markers.pop().setMap();
            }
        },
        createMarkers: function(data){
            this.clear(currentMarkers);
            var markers=[], marker;

            angular.forEach(data, function(observation){
                var loc;
                if(angular.isString(observation.location)){
                    try{
                        loc= JSON.parse(observation.location);
                    }catch(e){}
                }else{
                    loc= observation.location;
                }
                if(angular.isArray(loc) && loc.length == 2){
                    marker= new google.maps.Marker({
                            position: new google.maps.LatLng(loc[0], loc[1]),
                            map: mapObj,
                            title: observation.issue_type,
                            observation: observation
                        });
                    google.maps.event.addListener(marker, 'click', function() {
                        onMarkerClickHandler(observation);
                    });
                    markers.push(marker);
                }
            });
            currentMarkers= markers;
        },
        getGPSLocFromAddress: function(address, callback){
            if(!geocoder){
                geocoder= new google.maps.Geocoder();
            }
            geocoder.geocode({ 'address':address},function(results, status){
                if (status == google.maps.GeocoderStatus.OK) {
                    callback(null, results[0].geometry.location.lat(), results[0].geometry.location.lng())
                } else {
                    callback("Geocode was not successful for the following reason: " + status);

                }
            });
        },


        /*
            Here I could have combined some code with the above main map creation and marker creation, using different variables.
            But the code is so different that I think too much readability would be lost in order for the benifit of reuse.
         */
        createStatic: function(){
            if(staticMap){
                google.maps.event.trigger(staticMap, "resize");
            }else{
                var mapOptions = {
                    center: new google.maps.LatLng(39.50, -98.35),
                    zoom: 3,
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                    disableDefaultUI: true,
                    disableDoubleClickZoom: true,
                    draggable: false,
                    zoomControl: false,
                    scrollwheel: false,
                    panControl: false
                };
                staticMap = new google.maps.Map(document.getElementById("map_canvas_static"), mapOptions);
            }
        },
        setStaticMarkers: function(data){
            this.clear(staticMarkers);
            var markers=[], marker;

            angular.forEach(data, function(observation){
                var loc;
                if(angular.isString(observation.location)){
                    try{
                        loc= JSON.parse(observation.location);
                    }catch(e){}
                }else{
                    loc= observation.location;
                }
                if(angular.isArray(loc) && loc.length == 2){
                    marker= new google.maps.Marker({
                        position: new google.maps.LatLng(loc[0], loc[1]),
                        map: staticMap
                    });
                    markers.push(marker);
                }
            });
            staticMarkers= markers;
        }



    }
}());