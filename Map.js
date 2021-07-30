var map, infoWindow, service;

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
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(pos);
            //Put marker of the Geolocated user location
            var userMarker = new google.maps.Marker({
                map: map,
                position: pos
            });

            google.maps.event.addListener(userMarker, 'click', function() {
                infoWindow.setContent('Your location');
                infoWindow.open(map, this);
            });

            //Put request in here there are 3 requests since nearbysearch only has one type to be specified
            var requestAirport = {
                location: pos,
                radius: '8000',
                type: ['airport']
            };
            var requestMuseum = {
                location: pos,
                radius: '8000',
                type: ['museum']
            };
            var requestChurch = {
                location: pos,
                radius: '8000',
                type: ['church']
            };
            var requestStadium = {
                location: pos,
                radius: '8000',
                type: ['stadium']
            };
            var requestTrainStation = {
                location: pos,
                radius: '8000',
                type: ['train_station']
            };
            var requestUniversity = {
                location: pos,
                radius: '8000',
                type: ['university']
            };
            var requestZoo = {
                location: pos,
                radius: '8000',
                type: ['zoo']
            };
            var requestLibrary = {
                location: pos,
                radius: '8000',
                type: ['library']
            };
            var requestAquarium = {
                location: pos,
                radius: '8000',
                type: ['aquarium']
            };
            var requestArtGallery = {
                location: pos,
                radius: '8000',
                type: ['art_gallery']
            };

            //Make Places Service requests here
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

//put marker of the places in the map
    var marker = new google.maps.Marker({
        map: map,
        icon: icon,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
        window.location.href = 'https://angiologiandonati.altervista.org/Audios.html'
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


function getInfo(place_id) {
    var service = new google.maps.places.PlacesService(map);

    service.getDetails({
        placeId: place_id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            if(place) {
                console.log("place", place);
            }
        }
    });
}