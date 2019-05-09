mapboxgl.accessToken = 'pk.eyJ1IjoiYnJvb2tlZnp5IiwiYSI6ImNqdWFtZHNmdTA0N3o0M21oZG9peDU2NXMifQ.fbFnwmA72jGPO8IHcfEeRA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-95.9345, 41.2565],
    zoom: 4,
    minZoom: 3,
    maxZoom: 100,
    });

    var hoveredStateId =  null;
    
    
    map.on('load', function () {
    map.addSource("states", {
    "type": "geojson",
    "data": "https://raw.githubusercontent.com/TianyuSu/Innovation-Immigration/master/Geojson/all_metrowithID.geojson"
    });

    // The feature-state dependent fill-opacity expression will render the hover effect
    // when a feature's hover state is set to true.
    map.addLayer({
    "id": "state-fills",
    "type": "fill",
    "source": "states",
    "layout": {},
    "paint": {
    "fill-color": 'white',
    "fill-opacity": ["case",
    ["boolean", ["feature-state", "hover"], false],
    0.2,
    0
    ]
    }
    });
     
     
    // When the user moves their mouse over the metro-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on("mousemove", "state-fills", function(e) {
    if (e.features.length > 0) {
    if (hoveredStateId) {
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
    }
    hoveredStateId = e.features[0].id;
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: true});
    }
    });
     
    // When the mouse leaves the metro-fill layer, update the feature state of the
    // previously hovered feature.
    map.on("mouseleave", "state-fills", function() {
    if (hoveredStateId) {
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
    }
    hoveredStateId =  null;
    });
    });