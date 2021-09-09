var map, infoWindow, service, details;
const rad = 200

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 11.15,
            lng: 43.46
        },
        zoom: 18
    });
    infoWindow = new google.maps.InfoWindow;
    map.setOptions({ styles: styles["hide"] })

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(pos);

            var userMarker = new google.maps.Marker({
                map: map,
                position: pos
            });

            google.maps.event.addListener(userMarker, 'click', function() {
                infoWindow.setContent('Your location');
                infoWindow.open(map, this);
            });

            var requestAirport = {
                location: pos,
                radius: rad,
                type: ['airport']
            };
            var requestMuseum = {
                location: pos,
                radius: rad,
                type: ['museum']
            };
            var requestChurch = {
                location: pos,
                radius: rad,
                type: ['church']
            };
            var requestStadium = {
                location: pos,
                radius: rad,
                type: ['stadium']
            };
            var requestTrainStation = {
                location: pos,
                radius: '8000',
                type: ['train_station']
            };
            var requestUniversity = {
                location: pos,
                radius: rad,
                type: ['university']
            };
            var requestZoo = {
                location: pos,
                radius: rad,
                type: ['zoo']
            };
            var requestLibrary = {
                location: pos,
                radius: rad,
                type: ['library']
            };
            var requestAquarium = {
                location: pos,
                radius: rad,
                type: ['aquarium']
            };
            var requestArtGallery = {
                location: pos,
                radius: rad,
                type: ['art_gallery']
            };
            var requestPark = {
                location: pos,
                radius: rad,
                type: ['park']
            };

            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(requestAirport, callback_nearby);
            service.nearbySearch(requestMuseum, callback_nearby);
            service.nearbySearch(requestChurch, callback_nearby);
            service.nearbySearch(requestStadium, callback_nearby);
            service.nearbySearch(requestTrainStation, callback_nearby);
            service.nearbySearch(requestUniversity, callback_nearby);
            service.nearbySearch(requestZoo, callback_nearby);
            service.nearbySearch(requestLibrary, callback_nearby);
            service.nearbySearch(requestAquarium, callback_nearby);
            service.nearbySearch(requestArtGallery, callback_nearby);
            service.nearbySearch(requestPark, callback_nearby);


        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function callback_nearby(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var icon = {
        url: "https://maps.google.com/mapfiles/kml/paddle/blu-blank.png",
        scaledSize: new google.maps.Size(40, 40),
    };

    var marker = new google.maps.Marker({
        map: map,
        icon: icon,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        sessionStorage.setItem("placeId", place.place_id);
        window.location.href = 'http://localhost:63342/audio2.js/Audios.html?_ijt=eoo2ribgn1buuv3fvt2lfu03vu&_ij_reload=RELOAD_ON_SAVE';
        getInfo().then(success, failure);

        function success() {
            console.log('Informazioni ottenute')
        }

        function failure() {
            console.log('Informazioni non ottenute')
        }
    });
}

const styles = {
    default: [],
    hide: [
        {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
        },
        {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
        },
    ],
};

async function getInfo() {
    place_id = sessionStorage.getItem("placeId");
    console.log(place_id)
    var req = {
        placeId: place_id,
    };
    service = new google.maps.places.PlacesService(map);
    service.getDetails(req, callbackInfo);
}


function callbackInfo(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        const logElem = document.querySelector("#info");
        logElem.innerHTML = JSON.stringify(place);
    }
}