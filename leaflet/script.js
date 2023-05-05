(function(){
    'use strict';
    var map = L.map('map').setView([38.546980, -121.762500], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var marker = L.marker([38.5417102, -121.7495156]).addTo(map);
    marker.bindPopup("<b>Hi! This is where I live</b>").openPopup();

    var marker = L.marker([38.5435521, -121.7402825]).addTo(map);
    marker.bindPopup("<b>Hi! This is where I study</b>").openPopup();

    var marker = L.marker([38.5299995, -121.7605040]).addTo(map);
    marker.bindPopup("<b>Hi! This is my fav place to relax</b>").openPopup();
    // add your script here
    
}());