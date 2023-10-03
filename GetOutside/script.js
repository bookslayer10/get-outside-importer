// Write your JS in here

let myLat = 48.4284;
let myLong = -123.3656;
let myLocation = new google.maps.LatLng(myLat, myLong);
let searchRadius = 500;

let map;
let service;
let infoWindowPark; // park info
let infoWindowCurrentLocation; // for your current location

let markers = []; // list of all markers on the map

// when the window loads, initalize the map
window.onload = initializeMap;

function initializeMap(){

    // center map on victoria by default
    map = new google.maps.Map(document.getElementById("map"), {
    center: myLocation,
    zoom:13
    });
    searchForParks(myLocation, searchRadius);


    infoWindowCurrentLocation = new google.maps.InfoWindow();
    infoWindowPark = new google.maps.InfoWindow();

    // create pan to current location button
    const locationButton = document.createElement("button");
    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    myLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindowCurrentLocation.setPosition(myLocation);
                    infoWindowCurrentLocation.setContent("Location found.");
                    infoWindowCurrentLocation.open(map);
                    map.setCenter(myLocation);

                    searchForParks(myLocation, searchRadius);
                },
                () => {
                    handleLocationError(true, infoWindowCurrentLocation, map.getCenter());
                },
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindowCurrentLocation, map.getCenter());
        }
    });
}
  
// error message on geolocation fail
function handleLocationError(browserHasGeolocation, infoWindowCurrentLocation, pos) {
    infoWindowCurrentLocation.setPosition(pos);
    infoWindowCurrentLocation.setContent(
        browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.",
    );
    infoWindowCurrentLocation.open(map);
}
  

// Search for parks within a set distance, default 5km
// from  https://developers.google.com/maps/documentation/javascript/examples/place-search
function searchForParks(location, distance){
    // use the places API to search for all parks within a set distance
    let request = {
        location: location,
        radius: distance,
        query: "park"
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, processParks);

} // searchForParks

function processParks(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK){

        deleteMarkers();
        for(let i = 0; i < results.length; i++){
            let place = results[i];
            createMarker(place);
        }
    }
} // processParks


// create a marker at a place
// from  https://developers.google.com/maps/documentation/javascript/examples/place-search
function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const scaledIcon = {
        url: place.icon,
        scaledSize: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0), // origin
    }

    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        icon: scaledIcon,
        title: place.name
    });
  
    google.maps.event.addListener(marker, "click", () => {
        let contentString;

        if (place.rating == "0"){
            contentString = "<h3>" + place.name + "</h3>" + "<b>Not Rated</b>+<p>" 
            + place.formatted_address + "</p>";
        } else {
            contentString = "<h3>" + place.name + "</h3>" + "Rating: <b>"
            + place.rating + "</b> / 5 <p>" + place.formatted_address + "</p>";
        }

        infoWindowPark.setContent(contentString || "");
        infoWindowPark.open(map, marker);
    });

    markers.push(marker);
} // createMarker

// https://developers.google.com/maps/documentation/javascript/examples/marker-remove
// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    hideMarkers();
    markers = [];
}