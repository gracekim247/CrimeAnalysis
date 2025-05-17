let markers = [];

// form input handling
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.querySelector(".start-button");
    const welcomeContainer = document.querySelector(".welcome-container");
    const assessmentForm = document.querySelector(".assessment-form");
    const cancelButton = document.querySelector(".cancel-button");
    const resultsSection = document.querySelector(".results-section");
    const riskForm = document.getElementById("risk-form");
    const riskLevelDisplay = document.getElementById("risk-value");
    let map = null;
    let heatLayer = null;
    let userProfile = {};
    
    async function initMap(coordinates = [40.7128, -74.0060]) {
        return new Promise((resolve, reject) => {
            try {
                const mapContainer = document.getElementById('map');
                if (!mapContainer) throw new Error('Map container not found');

                if (map) {
                    map.remove();
                    map = null;
                }

                map = L.map('map', {
                    center: coordinates,
                    zoom: 15,
                    zoomControl: true,
                    scrollWheelZoom: true
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);

                L.marker(coordinates)
                    .bindPopup('Your Location')
                    .addTo(map);

                setTimeout(() => {
                    map.invalidateSize();
                    resolve(map);
                }, 250); 

            } catch (error) {
                console.error('Map initialization error:', error);
                reject(error);
            }
        });
    }

    async function getCoordinatesFromAddress(address) {
        console.log('calling geocode…')
        
        try {
            // if (!address.toLowerCase().includes('new york')) {
            if (!/,\s*(ny|new york)/i.test(address)){
                address += ', New York';
            }
            
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    displayName: data[0].display_name
                };
            }
            throw new Error('Location not found. Please try entering a more specific address.');
        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('Unable to find location. Please check the address and try again.');
        }
    }

    function showMapError(message) {
        const mapDiv = document.getElementById("map");
        if (mapDiv) {
            mapDiv.innerHTML = `<div style="padding: 20px; text-align: center; background: #f8d7da; color: #721c24; border-radius: 8px;">
                <h3>Map Error</h3>
                <p>${message}</p></div>`;
        }
    }

    function extractBorough(locationStr) {
        if (!locationStr) return "";

        const boroughKeys = [
            { key: "manhattan", name: "Manhattan" },
            { key: "brooklyn",  name: "Brooklyn" },
            { key: "queens",    name: "Queens" },
            { key: "bronx",     name: "Bronx" },
            { key: "staten island", name: "Staten Island" }
          ];
      
          for (const { key, name } of boroughKeys) {
            if (lower.includes(key)) {
              return name;
            }
          }
        return "";
    }

    function getMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then((res) => res.json())
                    .then((data) => {
                        const locationInput = document.getElementById("location");
                        if (data.address) {
                            const addr = data.address;
                            let formattedAddress = '';
                            if (addr.house_number) formattedAddress += addr.house_number + ' ';
                            if (addr.road) formattedAddress += addr.road + ', ';
                            if (addr.suburb) formattedAddress += addr.suburb + ', ';
                            if (addr.city || addr.town) formattedAddress += (addr.city || addr.town) + ', ';
                            if (addr.state) formattedAddress += addr.state;
                            locationInput.value = formattedAddress;
                        } else {
                            locationInput.value = `${lat}, ${lon}`;
                        }
                    })
                    .catch(error => {
                        console.error('Error getting address:', error);
                        document.getElementById("location").value = `${lat}, ${lon}`;
                    });
            },
            (error) => {
                alert("Unable to retrieve location.");
                console.error(error);
            });
        } else {
            alert("Geolocation not supported.");
        }
    }

    function useCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById("time").value = `${hours}:${minutes}`;
    }

    startButton?.addEventListener("click", () => {
        welcomeContainer.style.display = "none";
        assessmentForm.style.display = "flex";
    });

    cancelButton?.addEventListener("click", () => {
        assessmentForm.style.display = "none";
        welcomeContainer.style.display = "flex";
        riskForm.reset();                          
        riskLevelDisplay.textContent = "";         
        riskLevelDisplay.className = "";          
        resultsSection.style.display = "none";     
        document.getElementById("map").style.display = "none"; 
        if (map) { map.remove(); map = null; }
    });

    riskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const addr = riskForm.location.value;
        let coords;
        try {
            coords = await getCoordinatesFromAddress(addr);
        } catch (err) {
            return showMapError(err.message);
        }
        const mapContainer = document.getElementById("map");
        if (mapContainer) {
            mapContainer.style.display = "block";
            mapContainer.style.height = "400px";
            mapContainer.style.width = "100%";
        }

        setTimeout(async () => {
            try {
                if (!map) {
                    coords = await getCoordinatesFromAddress(addr);
                    console.log("🗺️ Geocoded to:", coords.displayName, coords.lat, coords.lon);

                    map = await initMap([coords.lat, coords.lon]);
                } else {
                    map.setView([coords.lat, coords.lon], 15);
                    map.invalidateSize();
                }
                
                const hour = riskForm.time.value.split(":")[0];
                
                let borough = "";
                const displayNameParts = coords.displayName.split(",");
                for (let i = 0; i < displayNameParts.length; i++) {
                    const part = displayNameParts[i].trim();
                    if (["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].includes(part)) {
                        borough = part;
                        break;
                    }
                }
                
                if (!borough) {
                    borough = extractBorough(coords.displayName);
                }
                
                userProfile = {
                    age: riskForm.age.value,
                    sex: riskForm.sex.value,
                    race: riskForm.race.value,
                    borough: borough,
                    hour: hour,
                    latitude: coords.lat,
                    longitude: coords.lon
                };
        
                console.log("User profile for prediction:", userProfile);
                
                try {
                    console.log("🛰️ About to POST to /api/predict with:", userProfile);
                    const resp = await fetch("/api/predict", {
                        method: "POST",
                        headers: {"Content-Type":"application/json"},
                        body: JSON.stringify(userProfile)
                    });
                    
                    if (!resp.ok) {
                        throw new Error(`Server responded with status: ${resp.status}`);
                    }
                    
                    const data = await resp.json();
                    console.log("Received prediction response:", data);
                    
                    const risk = data.risk || "Unknown";
        
                    const rv = document.getElementById("risk-value");
                    rv.textContent = risk;               
                    rv.classList.remove("low","medium","high");
                    rv.classList.add(risk.toLowerCase());  
                    riskLevelDisplay.textContent = `Estimated Risk: ${risk}`;
                    resultsSection.style.display = "block";
                    document.querySelector(".assessment-form").style.display = "none";
                    document.getElementById("results").style.display = "block";
                } catch (err) {
                    console.error("Prediction error:", err);
                    riskLevelDisplay.textContent = "Error";
                    resultsSection.style.display = "block";
                }
            } catch (err) {
                console.error("Map initialization error:", err);
                showMapError(err.message);
            }
        }, 250);
    });


// heatmap handling
    document.getElementById("view-heatmap-btn").addEventListener("click", async () => {
        if (!userProfile || !userProfile.latitude) {
            return alert("Please run Analyze Risk first to set your location.");
        }

        document.getElementById("results").style.display = "none";
        document.querySelector(".assessment-form").style.display = "none";

        const heatmapView = document.querySelector(".heatmap-view");
        heatmapView.style.display = "flex";

        const heatmapContainer = document.querySelector(".heatmap-container");
        heatmapContainer.style.display = "block";
        

        const mapDiv = document.getElementById("map");
        mapDiv.innerHTML = "";
        mapDiv.style.display = "block";           
        mapDiv.style.height  = "400px";             
        mapDiv.style.width   = "100%";              

        try {
            if (map) {
                map.remove();
                map = null;
            }
            map = await initMap([userProfile.latitude, userProfile.longitude]);
            
            console.log("Requesting heatmap data for:", userProfile);
            const resp = await fetch("/api/heatmap-data", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(userProfile)
            });
            
            if (!resp.ok) {
                throw new Error(`Server responded with status: ${resp.status}`);
            }
            
            const data = await resp.json();
            console.log("Received heatmap data:", data);
            
            const points = Array.isArray(data) ? data : (data.points || []);
            
            if (!Array.isArray(points)) {
                throw new Error("Expected array of points but received: " + typeof points);
            }
            
            const heatArray = points.map(p => [
                p.lat || p.latitude || userProfile.latitude, 
                p.lng || p.longitude || userProfile.longitude, 
                p.weight || 0.5
            ]);

            if (heatArray.length === 0) {
                console.warn("No heatmap data available, adding default points");
                const lat = userProfile.latitude;
                const lng = userProfile.longitude;
                heatArray.push([lat + 0.002, lng + 0.002, 0.7]);
                heatArray.push([lat - 0.002, lng - 0.002, 0.5]);
                heatArray.push([lat + 0.002, lng - 0.002, 0.3]);
                heatArray.push([lat - 0.002, lng + 0.002, 0.6]);
            }
            
            if (typeof L.heatLayer === 'function') {
                if (heatLayer) {
                    map.removeLayer(heatLayer);
                }
                
                heatLayer = L.heatLayer(heatArray, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 15,
                    gradient: {0.4: "#00ac46", 0.6: "#fd8c00", 0.8: "#dc0000"}
                }).addTo(map);
                
                console.log("Heatmap successfully added");
            } else {
                throw new Error("Leaflet.heat plugin is not loaded");
            }
            
        } catch (err) {
            console.error("Heatmap error:", err);
            showMapError("Error loading heatmap: " + err.message);
        }
    });


    document.getElementById("get-location-btn")?.addEventListener("click", getMyLocation);
    document.getElementById("use-current-time-btn")?.addEventListener("click", useCurrentTime);
    
    document.getElementById("back-to-results")?.addEventListener("click", () => {
        document.querySelector(".heatmap-view").style.display = "none";
        document.getElementById("results").style.display = "block";
    });
});
