// POI type mapping from numbers to labels
const poiTypeLabels = {
    1: 'culture',
    2: 'nature',
    3: 'activity',
    4: 'food & drinks'
};

// POI SVG icon file paths
const poiIconPaths = {
    culture: 'css/kapr_type1.svg',
    nature: 'css/kapr_type2.svg',
    activity: 'css/kapr_type3.svg',
    'food & drinks': 'css/kapr_type4.svg',
    default: '' // No icon will be shown if no path
};

// --- GLOBAL VARIABLES FOR FILTERING ---
let mapInstance;          // Stores the leaflet map object
let poiLayer;             // Stores the L.geoJSON layer for POIs
let poiGeojsonData;       // Caches the fetched POI GeoJSON
let allCuisines = new Set(); // Stores all unique cuisine types
let currentPOIType = 'all';  // Current state of the main filter
let currentCuisine = 'all';  // Current state of the cuisine sub-filter
// ------------------------------------------

// Function to create SVG icon from a file path
function createSVGIcon(filePath) {
    const iconSize = 30; 
    if (!filePath) {
        return ''; 
    }
    return `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
        <image href="${filePath}" x="0" y="0" width="${iconSize}" height="${iconSize}" />
    </svg>`;
}

// Function to get POI icon based on type
function getPOIIcon(typeNumber) {
    const typeLabel = poiTypeLabels[typeNumber] || 'default';
    const filePath = poiIconPaths[typeLabel] || poiIconPaths.default;
    const iconSvg = createSVGIcon(filePath); 
    
    return L.divIcon({
        className: 'custom-marker',
        html: iconSvg,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

// === MARATHON DATA ===
const marathonData = {
    almaty: {
        name: 'almaty marathon',
        continent: 'asia',
        status: 'coming-soon'
    },
    auckland: {
        name: 'barfoot & thompson auckland marathon',
        center: [39.9042, 116.4074],
        zoom: 11,
        continent: 'australia-oceania',
        routeFile: 'data/oceania/auckland-route.geojson',
        poisFile: 'data/oceania/auckland-pois.geojson'
    },
    berlin: {
        name: 'bmw berlin-marathon',
        center: [52.5200, 13.4050],
        zoom: 11,
        continent: 'europe',
        routeFile: 'data/europe/berlin-route.geojson',
        poisFile: 'data/europe/berlin-pois.geojson'
    },
    boston: {
        name: 'boston marathon',
        center: [42.3601, -71.0589],
        zoom: 11,
        continent: 'north-america',
        routeFile: 'data/north-america/boston-route.geojson',
        poisFile: 'data/north-america/boston-pois.geojson'
    },
    brasilia: {
        name: 'maratona monumental de brasília',
        continent: 'australia-oceania',
        status: 'coming-soon'
    },
    brisbane: {
        name: 'brisbane marathon',
        center: [52.5200, 13.4050],
        zoom: 11,
        continent: 'australia-oceania',
        routeFile: 'data/oceania/brisbane-route.geojson',
        poisFile: 'data/oceania/brisbane-pois.geojson'
    },
    'buenos-aires': {
        name: 'buenos aires international marathon',
        center: [52.5200, 13.4050],
        zoom: 12,
        continent: 'south-america',
        routeFile: 'data/south-america/buenos-aires-route.geojson',
        poisFile: 'data/south-america/buenos-aires-pois.geojson'
    },
    'cape-town': {
        name: 'cape town marathon',
        continent: 'africa',
        status: 'coming-soon'
    },
    caracas: {
        name: 'maratón caf caracas',
        center: [52.5200, 13.4050],
        zoom: 11,
        continent: 'south-america',
        routeFile: 'data/south-america/caracas-route.geojson',
        poisFile: 'data/south-america/caracas-pois.geojson'
    },
    chicago: {
        name: 'bank of america chicago marathon',
        center: [41.8781, -87.6298],
        zoom: 11,
        continent: 'north-america',
        routeFile: 'data/north-america/chicago-route.geojson',
        poisFile: 'data/north-america/chicago-pois.geojson'
    },
    london: {
        name: 'tcs london marathon',
        center: [51.5074, -0.1278],
        zoom: 11,
        continent: 'europe',
        routeFile: 'data/europe/london-route.geojson',
        poisFile: 'data/europe/london-pois.geojson'
    },
    lagos: {
        name: 'access bank lagos city marathon',
        center: [51.5074, -0.1278],
        zoom: 11,
        continent: 'africa',
        routeFile: 'data/africa/lagos-route.geojson',
        poisFile: 'data/africa/lagos-pois.geojson'
    },
    nagano: {
        name: 'the nagano marathon',
        center: [39.9042, 116.4074],
        zoom: 11,
        continent: 'asia',
        routeFile: 'data/asia/nagano-route.geojson',
        poisFile: 'data/asia/nagano-pois.geojson'
    },
    nyc: {
        name: 'tcs new york city marathon (nyrr)',
        center: [40.7128, -74.0060],
        zoom: 11,
        continent: 'north-america',
        routeFile: 'data/north-america/nyc-route.geojson',
        poisFile: 'data/north-america/nyc-pois.geojson'
    },
    pietermaritzburg: {
        name: 'capital city42',
        continent: 'africa',
        status: 'coming-soon'
    },
    stockholm: {
        name: 'adidas stockholm marathon',
        center: [39.9042, 116.4074],
        zoom: 11,
        continent: 'europe',
        routeFile: 'data/europe/stockholm-route.geojson',
        poisFile: 'data/europe/stockholm-pois.geojson'
    },
    sydney: {
        name: 'tcs sydney marathon presented by asics',
        center: [39.9042, 116.4074],
        zoom: 11,
        continent: 'australia-oceania',
        routeFile: 'data/oceania/sydney-route.geojson',
        poisFile: 'data/oceania/sydney-pois.geojson'
    },
    tokyo: {
        name: 'tokyo marathon',
        center: [35.6762, 139.6503],
        zoom: 11,
        continent: 'asia',
        routeFile: 'data/asia/tokyo-route.geojson',
        poisFile: 'data/asia/tokyo-pois.geojson'
    },
    toronto: {
        name: 'tcs toronto waterfront marathon',
        continent: 'north-america',
        status: 'coming-soon'
    }
};

// Initialize map on marathon detail page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const marathonId = urlParams.get('id');
    
    if (!marathonId || !marathonData[marathonId]) {
        document.getElementById('marathon-title').textContent = 'marathon not found';
        document.getElementById('marathon-description').textContent = 'please return to the marathons page and select a valid marathon';
        return;
    }
    
    const marathon = marathonData[marathonId];
    
    // Update page title
    document.getElementById('marathon-title').textContent = marathon.name;
    document.title = `${marathon.name}`;

    // === "COMING SOON" CHECK ===
    if (marathon.status === 'coming-soon') {
        document.getElementById('marathon-description').textContent = 'this event is coming soon :)';
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.display = 'none';
        }
        const controlsWrapper = document.querySelector('.controls-wrapper');
        if (controlsWrapper) {
            controlsWrapper.style.display = 'none';
        }
        return;
    }

    // If the status is not "coming soon", set the real description
    document.getElementById('marathon-description').textContent = marathon.description;
    
    // Wait for map container to be ready
    setTimeout(async () => {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('map element not found');
            return;
        }
        
        // Initialize map
        const map = L.map('map').setView(marathon.center, marathon.zoom);
        mapInstance = map; // Store map in global variable

        // === NEW: ADD ZOOM EVENT LISTENER ===
        mapInstance.on('zoomend', checkZoomAndTogglePOIs);
        
        // 1. Define your tile layers
        const tiles1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16
        });

        const tiles2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 16
        });
        
        // 2. Add the DEFAULT layer to the map
        tiles1.addTo(map);

        // 3. Create an object to hold your base layers
        const baseLayers = {
            "default": tiles1,
            "satellite": tiles2,
        };

        // 4. Add the layer control to the map
        L.control.layers(baseLayers, null, {collapsed: true}).addTo(map);
        
        
        // Force map to resize properly
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        // Load and display route
        const routeLoaded = await loadGeoJSON(marathon.routeFile, map, 'route');
        
        // Load and display POIs
        const poiLoaded = await loadGeoJSON(marathon.poisFile, map, 'poi');

        // Only initialize filters if POIs were successfully loaded
        if (poiLoaded) {
            initializeFilters();
        } else {
            // If POIs failed (but route might have loaded), hide the filter box
            const filterBox = document.querySelector('.filter-container');
            if (filterBox) filterBox.style.display = 'none';
        }
        
    }, 100);
});

// --- NEW FUNCTION to show/hide POIs based on zoom ---
function checkZoomAndTogglePOIs() {
    // If map or layer doesn't exist yet, do nothing
    if (!mapInstance || !poiLayer) return;

    const currentZoom = mapInstance.getZoom();

    if (currentZoom >= 13) {
        // If zoom is 8 or more, add layer (if it's not already there)
        if (!mapInstance.hasLayer(poiLayer)) {
            mapInstance.addLayer(poiLayer);
        }
    } else {
        // If zoom is less than 8, remove layer (if it's on the map)
        if (mapInstance.hasLayer(poiLayer)) {
            mapInstance.removeLayer(poiLayer);
        }
    }
}

// --- Function to set up filter controls ---
function initializeFilters() {
    const poiFilter = document.getElementById('poi-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const cuisineGroup = document.getElementById('cuisine-filter-group');
    poiFilter.addEventListener('change', (e) => {
        currentPOIType = e.target.value;
        if (currentPOIType === '4') {
            cuisineGroup.style.display = 'block';
        } else {
            cuisineGroup.style.display = 'none';
            currentCuisine = 'all';
            cuisineFilter.value = 'all';
        }
        loadPOILayer();
    });
    cuisineFilter.addEventListener('change', (e) => {
        currentCuisine = e.target.value;
        loadPOILayer();
    });
}

// --- Function to populate the cuisine filter dropdown ---
function populateCuisineFilter() {
    const cuisineSelect = document.getElementById('cuisine-filter');
    cuisineSelect.innerHTML = '<option value="all">all cuisines</option>'; 
    const sortedCuisines = [...allCuisines].sort();
    sortedCuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.value = cuisine.toLowerCase();
        option.textContent = cuisine;
        cuisineSelect.appendChild(option);
    });
}

// --- MODIFIED Function to load or reload the POI layer based on filters ---
function loadPOILayer() {
    // If a POI layer already exists, remove it from the map
    if (poiLayer) {
        mapInstance.removeLayer(poiLayer);
    }
    
    // If there is no POI data, do nothing
    if (!poiGeojsonData) return;

    // Create the new L.geoJSON layer (without adding it to the map)
    poiLayer = L.geoJSON(poiGeojsonData, {
        
        filter: (feature) => {
            const props = feature.properties;
            if (!props) return false; 
            const poiType = String(props.type || 'default');
            const cuisine = props.cuisine ? props.cuisine.toLowerCase() : 'none';
            if (currentPOIType !== 'all' && currentPOIType !== poiType) {
                return false; 
            }
            if (currentPOIType === '4') {
                if (currentCuisine !== 'all' && currentCuisine !== cuisine) {
                    return false; 
                }
            }
            return true; 
        },
        pointToLayer: (feature, latlng) => {
            const poiType = feature.properties?.type || 'default';
            return L.marker(latlng, {
                icon: getPOIIcon(poiType)
            });
        },
        onEachFeature: (feature, layer) => {
            if (feature.properties) {
                const props = feature.properties;
                let popupContent = '<div class="popup-content">';
                if (props.name) {
                    popupContent += `<h4>${props.name}</h4>`;
                }
                if (props.photo || props.image) {
                    const imgSrc = props.photo || props.image;
                    popupContent += `<img src="${imgSrc}" alt="${props.name || 'POI'}" onerror="this.style.display='none'">`;
                }
                if (props.description) {
                    popupContent += `<p>${props.description}</p>`;
                }
                if (props.cuisine) {
                    popupContent += `<p><strong>cuisine:</strong> ${props.cuisine}</p>`;
                }
                if (props.location || props.address) {
                    popupContent += `<p>📍${props.location || props.address}</p>`;
                }
                popupContent += '</div>';
                layer.bindPopup(popupContent);
            }
        }
    });
    
    // --- NEW ---
    // Instead of adding to map, call the zoom check function
    // This will decide if it should be added or not
    checkZoomAndTogglePOIs();
}

// Function to load and display GeoJSON data
async function loadGeoJSON(filepath, map, type) {
    if (!filepath) {
        console.warn(`No filepath provided for type: ${type}`);
        return false;
    }
    
    try {
        const response = await fetch(filepath);
        
        if (!response.ok) {
            console.warn(`GeoJSON file not found: ${filepath}.`);
            return false;
        }
        
        const geojsonData = await response.json();
        
        if (type === 'route') {
            const routeLayer = L.geoJSON(geojsonData, {
                style: {
                    color: '#1a0089',
                    weight: 4,
                    opacity: 0.8
                }
            }).addTo(map);
            
            map.fitBounds(routeLayer.getBounds());
            addKilometerMarkers(routeLayer, map);
            
        } else if (type === 'poi') {
            poiGeojsonData = geojsonData; 

            allCuisines.clear(); 
            poiGeojsonData.features.forEach(feature => {
                const props = feature.properties;
                if (props && props.type == 4 && props.cuisine) {
                    allCuisines.add(props.cuisine);
                }
            });

            populateCuisineFilter();
            // This will create the layer and check the zoom
            loadPOILayer();
        }
        return true;

    } catch (error) {
        console.error(`Error loading GeoJSON from ${filepath}:`, error);
        return false;
    }
}

// Add kilometer markers along the route every 5km
function addKilometerMarkers(geoJsonLayer, map) {
    geoJsonLayer.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            addKilometerMarkersToPolyline(layer, map);
        }
    });
}

// Calculate distance along a polyline and add markers every 5km
function addKilometerMarkersToPolyline(polyline, map) {
    const latlngs = polyline.getLatLngs();
    let totalDistance = 0;
    let nextMarkerDistance = 5000; 
    
    const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs.flat() : latlngs;
    
    for (let i = 1; i < flatLatLngs.length; i++) {
        const point1 = flatLatLngs[i - 1];
        const point2 = flatLatLngs[i];
        const segmentDistance = point1.distanceTo(point2);
        
        while (totalDistance + segmentDistance >= nextMarkerDistance) {
            const remainingDistance = nextMarkerDistance - totalDistance;
            const ratio = remainingDistance / segmentDistance;
            
            const markerLat = point1.lat + (point2.lat - point1.lat) * ratio;
            const markerLng = point1.lng + (point2.lng - point1.lng) * ratio;
            
            const km = nextMarkerDistance / 1000;
            L.marker([markerLat, markerLng], {
                icon: L.divIcon({
                    className: 'km-marker',
                    html: `<div style="background: #b7cf4f; color: #1a0089; font-weight: bold; font-size: 12px; border: 2px solid #1a0089; 
                                    width: 24px; height: 24px; border-radius: 6px; 
                                    display: flex; align-items: center; justify-content: center;
                                    padding: 0; box-sizing: border-box;">${km}</div>`,
                    iconSize: [24, 24], 
                    iconAnchor: [12, 12] 
                })
            }).addTo(map).bindPopup(`kilometer ${km}`);
            
            nextMarkerDistance += 5000; 
        }
        
        totalDistance += segmentDistance;
    }
}