// load getMyLocation on window load
window.onload = getMyLocation;

// global variables
var latitude;
var longitude;

// display location
function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(displayLocation);
  } else {
    alert('Geolocation is not supported by your browser');
  }
}

// display user's nearest UK postcode and Parliamentary_constituency name
function displayData() {
  axios.get(`https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`)
  .then(function(response) {
    var nearest_postcode = response.data.result[1].postcode;
    var constituency_name = response.data.result[1].parliamentary_constituency;

    var dataOutput = `
      <ul class="list-group">
        <li class = "list-group-item"><strong>Nearest Postcode</strong>: ${nearest_postcode}</li>
        <li class = "list-group-item"><strong>Parliamentary_constituency</strong>: ${constituency_name}</li>
      </ul>
    `;

    // output to homepage
    document.getElementById('info').innerHTML = dataOutput
  })
  .catch(function(error){
    console.log(error)
  });
};

// display's user's location with latLng coordinates
function displayLocation(position) {
  latitude = position.coords.latitude
  longitude = position.coords.longitude

  // display data based on user's location
  displayData()

  var latLng = new google.maps.LatLng(latitude, longitude);
  initMap(latLng);
}

//set map and marker
function initMap(latLng) {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: latLng,
    zoom: 8
  });
  var input = document.getElementById('pac-input');
  var options = {
    componentRestrictions: {country: 'uk'}
  };

  var marker = new google.maps.Marker({position: latLng,  map: map});

  var autocomplete = new google.maps.places.Autocomplete(input, options);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("Sorry, No details available for: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    longitude = place.geometry.location.lng()
    latitude = place.geometry.location.lat()

    // display data on autocomplete search location
    displayData()

  });
};
