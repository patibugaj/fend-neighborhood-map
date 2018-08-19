import React, { Component } from 'react';

import SideBar from './components/SideBar.js';
import * as locationsData from './locations.json';

class App extends Component {
  state = {
    locations: locationsData,    
    map: '',
    markers: [],
    infoWindowIsOpen: false,
    currentMarker: {},
    largeInfowindow: {}
  }

  componentDidMount() {
    window.initMap = this.initMap;
    loadJS('https://maps.googleapis.com/maps/api/js?libraries=geometry&key=AIzaSyB7x8v_6g7G9ZtgU0bvVY0cZ_pjcA2i81Q&callback=initMap');
  }

  initMap = () => {
    
    const { locations, markers } = this.state;
    
    let map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 37.333351, lng: -4.5765007},
      zoom: 13,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
    });

    
    const largeInfowindow = new window.google.maps.InfoWindow();

    this.setState({map, largeInfowindow})

    for (let i = 0; i < locations.length; i++) {
      
      let position = locations[i].location;
      let key = locations[i].key;
      let title = locations[i].title;
      let info = locations[i].info;
      let source = locations[i].source;
      let image = locations[i].url;
      
      let marker = new window.google.maps.Marker({
        position: position,
        key: key,
        title: title,
        info: info,
        source: source,
        image: image,
        animation: window.google.maps.Animation.DROP,
        id: key
      });
      
      markers.push(marker);
      
      marker.addListener('click', () => {
        this.populateInfoWindow(marker, largeInfowindow);
      });
      // Two event listeners - one for mouseover, one for mouseout,
      // to change opacity of the marker.
      marker.addListener('mouseover', function() {
        marker.setOptions({opacity: 0.5})
      });
      marker.addListener('mouseout', function() {
        marker.setOptions({opacity: 1})
      });

    }
    
    this.showListings();

  }

  // This function populates the infowindow when the marker is clicked. 
  populateInfoWindow = (marker, infowindow) => {
    const { map } = this.state;
    
    this.setState({
      infoWindowIsOpen: true,
      currentMarker: marker
    });

    if (infowindow.marker !== marker) {
      infowindow.marker = marker;
      let self = this
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null; 
        infowindow.marker.setOptions({opacity: 1}) 
        self.setState({
          infoWindowIsOpen: false,
          currentMarker: {}
        });    
      });        
      

      let streetViewService = new window.google.maps.StreetViewService();
      const radius = 50;
      
      let getStreetView = (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          let nearStreetViewLocation = data.location.latLng;
          let heading = window.google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent(`
            <div class="info-window">
              <div id="pano"></div>
              <div class="marker-title">
                <h3>${ marker.title }</h3>
                <p>${marker.info}</p>
                <p marker-source><a href="${marker.source}">Source</a></p>
              </div>
            </div>`);
            let panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
          let panorama = new window.google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else if (marker.image) {
          infowindow.setContent(`
          <div class="info-window">
            <div class="marker-image">
              <img src="${ marker.image }">
            </div>
            <div class="marker-title">
              <h3>${ marker.title }</h3>
              <p>${marker.info}</p>
              <p marker-source><a href="${marker.source}">Source</a></p>
            </div>
          </div>`);
        } else {
          infowindow.setContent(`
          <div class="info-window">
            <div>No Image Found</div>
            <div class="marker-title">
              <h3>${ marker.title }</h3>
              <p>${marker.info}</p>
              <p marker-source><a href="${marker.source}">Source</a></p>
            </div>
          </div>`);
        }
      }
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      
      infowindow.open(map, marker);
    }
  }
  
  showListings = () => {
    const { markers, map } = this.state;
    var bounds = new window.google.maps.LatLngBounds();
    
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }
  

  render() {
    return (
      <div className="App">
        <div className="top-nav">
          <h1>Andalucia Trip</h1>
        </div>
        <SideBar 
          locations={this.state.locations}
          markers={this.state.markers}
          populateInfoWindow = {this.populateInfoWindow}
          largeInfowindow={this.state.largeInfowindow}
        />
        <div id="map" role="application"></div>
      </div>
    );
  }
}
export default App;

function loadJS(src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');

  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);

  script.onerror = function () {
    document.write('Load error: Google Maps')
  };
}