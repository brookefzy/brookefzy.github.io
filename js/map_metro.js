mapboxgl.accessToken = 'pk.eyJ1IjoiYnJvb2tlZnp5IiwiYSI6ImNqdWFtZHNmdTA0N3o0M21oZG9peDU2NXMifQ.fbFnwmA72jGPO8IHcfEeRA';
var margin = { top: 100, right: 120, bottom: 100, left: 120 },
					width = 400
					height = 400
var radarChart = {
                    w: width,
                    h: height,
                    margin: margin,
                    maxValue: 40,
                    levels: 2,
                    roundStrokes: false,
                    color: d3.scaleOrdinal().range([ "#fff","#00A0B0" ,"#EDC951"]),
                    format: '.0f',
                    legend: { translateX: 140, translateY: 40 },
                    unit: '%'
                };
            
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-95.9345, 41.2565],
    zoom: 4,
    minZoom: 3,
    maxZoom: 100,
    });

    var overlay = document.getElementById("statename")
    var hoveredStateId =  null;

    
    map.on('load', function () {
    map.addSource("states", {
    "type": "geojson",
    "data": "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson"
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
    
    var feature = e.features[0];
    overlay.innerHTML = '';
    var title = document.createElement('strong');
    title.textContent = "Major Startup Industries in " + feature.properties.STATE_NAME +":";
    overlay.appendChild(title);
    overlay.style.display = 'block';

    // initialChart("Maine");
    var selectedState = feature.properties.STATE_NAME;

// Run update function with the selected fruit
    var mydata = d3.csv("https://raw.githubusercontent.com/TianyuSu/Innovation-Immigration/master/Data_Radar/2017_radar.csv")
    .then(function(mydata){(mydata)
     
         nest = d3.nest()
             .key(function(d){
                 return d.State;
             })
             .entries(mydata)

     var updateChart = function(state){
                var selectState = nest.filter(function(d){
                    return d.key == state;
                })

            var dataSelected = selectState[0].values
            var statedata = formatdata(dataSelected);
            
            var svg_radar = RadarChart(".radarChart", statedata, radarChart); 
console.log(svg_radar)
            }

             updateChart(selectedState);
      });


}
    });
     
    // When the mouse leaves the metro-fill layer, update the feature state of the
    // previously hovered feature.
    map.on("mouseleave", "state-fills", function() {
    if (hoveredStateId) {
    map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
    }
    hoveredStateId =  null;
    overlay.style.display = 'none';
    });
    });