// document.addEventListener("DOMContentLoaded", () => {
//   const startButton = document.querySelector(".start-button");
//   const welcomeContainer = document.querySelector(".welcome-container");
//   const assessmentForm = document.querySelector(".assessment-form");
//   const cancelButton = document.querySelector(".cancel-button");
//   const resultsSection = document.querySelector(".results-section");
//   const riskForm = document.getElementById("risk-form");
//   const riskLevelDisplay = document.getElementById("risk-level");
//   const viewHeatmapBtn = document.getElementById("view-heatmap-btn");
//   const heatmapView = document.querySelector(".heatmap-view");
//   const backToResultsBtn = document.getElementById("back-to-results");
  
//   // Track the current user input and borough for heatmap generation
//   let currentUserInput = {};
//   let currentBorough = "";
//   let riskLevel = "";

//   // Load the random forest model (this would be your trained model)
//   let randomForestModel = null;
  
//   // Mock function to load your model - replace with actual loading logic
//   function loadRandomForestModel() {
//     // In a real implementation, you would load your model from a file or API
//     // For example: 
//     // fetch('/models/random-forest-model.json')
//     //   .then(response => response.json())
//     //   .then(model => { randomForestModel = model; });
    
//     // For now, we'll use a placeholder
//     randomForestModel = {
//       // This is a placeholder for your actual model
//       // Your model structure will depend on how you've implemented your random forest
//     };
    
//     console.log("Random forest model loaded");
//   }
  
//   // Load the model when the page loads
//   loadRandomForestModel();

//   startButton.addEventListener("click", () => {
//     welcomeContainer.style.display = "none";
//     assessmentForm.style.display = "flex";
//   });

//   cancelButton.addEventListener("click", () => {
//     assessmentForm.style.display = "none";
//     welcomeContainer.style.display = "flex";
//   });

//   riskForm.addEventListener("submit", function (e) {
//     e.preventDefault();
    
//     // Collect user input
//     const age = document.getElementById("age").value;
//     const sex = document.getElementById("sex").value;
//     const race = document.getElementById("race").value;
//     const location = document.getElementById("location").value;
//     const time = document.getElementById("time").value;
    
//     // Store the user input for later use with the heatmap
//     currentUserInput = { age, sex, race, time };
    
//     // Determine borough from location
//     currentBorough = extractBorough(location);
    
//     // Use your random forest model to predict risk
//     // For now, we'll use a simplified version
//     riskLevel = predictOverallRisk(currentUserInput, currentBorough);
    
//     // Show result
//     assessmentForm.style.display = "none";
//     resultsSection.style.display = "block";
    
//     // Display risk level and set appropriate class
//     riskLevelDisplay.textContent = `Estimated Risk Level: ${riskLevel}`;
//     riskLevelDisplay.className = "";
//     riskLevelDisplay.classList.add(riskLevel.toLowerCase());
  
//     // Scroll to results
//     document.getElementById("results").scrollIntoView({ behavior: "smooth" });
//   });

//   // Extract borough from the location string
//   function extractBorough(location) {
//     const boroughs = ["Manhattan", "Brooklyn", "Bronx", "Queens", "Staten Island"];
    
//     // Check if any borough name appears in the location string
//     for (const borough of boroughs) {
//       if (location.toLowerCase().includes(borough.toLowerCase())) {
//         return borough;
//       }
//     }
    
//     // Default to Manhattan if no borough is identified
//     return "Manhattan";
//   }

  
  
//   // Predict overall risk level (Low, Medium, High) based on user input
//   function predictOverallRisk(userInput, borough) {
//     // This would be replaced with your actual random forest prediction
//     // For now, we'll use a simplified placeholder
    
//     const { age, sex, race, time } = userInput;
    
//     // Simple risk logic
//     let risk = 0.3; // Base risk
    
//     // Time of day affects risk (higher at night)
//     const hourNum = parseInt(time.split(':')[0]);
//     if (hourNum >= 22 || hourNum <= 5) {
//       risk += 0.4; 
//     } else if (hourNum >= 18 || hourNum <= 9) {
//       risk += 0.2;
//     }
    
//     // Borough affects risk
//     if (borough === "Bronx") risk += 0.3;
//     else if (borough === "Brooklyn") risk += 0.2;
//     else if (borough === "Manhattan") risk += 0.1;
    
//     // Demographic factors
//     if (age === "18-24") risk += 0.1;
//     if (sex === "male") risk += 0.05;
    
//     // Determine risk level category
//     if (risk > 0.7) return "High";
//     if (risk > 0.4) return "Medium";
//     return "Low";
//   }

//   // Heatmap view toggle
//   viewHeatmapBtn.addEventListener("click", () => {
//     heatmapView.style.display = "flex";
    
//     // Get the selected borough boundary
//     const boroughBoundary = getBoroughBoundary(currentBorough);
    
//     // Generate heatmap data from the random forest model
//     const heatmapData = generateHeatmapData(currentUserInput, randomForestModel, currentBorough);
    
//     // Create the heatmap visualization
//     // Replace 'heatmap-visualization' with the actual ID of your heatmap container
//     const heatmapContainer = document.querySelector('.heatmap-visualization');
//     heatmapContainer.innerHTML = '<div id="heatmap-container" style="width:100%; height:400px;"></div>';
    
//     // Render the heatmap
//     renderHeatmap(heatmapData, "heatmap-container", boroughBoundary);
//   });

//   backToResultsBtn.addEventListener("click", () => {
//     heatmapView.style.display = "none";
//   });

//   // Get borough boundary coordinates
//   function getBoroughBoundary(borough) {
//     // Borough boundaries (simplified coordinates for NYC boroughs)
//     const boroughBoundaries = {
//       "Manhattan": [
//         {lat: 40.700, lng: -74.020}, {lat: 40.710, lng: -73.990},
//         {lat: 40.790, lng: -73.940}, {lat: 40.870, lng: -73.910},
//         {lat: 40.880, lng: -73.930}, {lat: 40.850, lng: -74.010},
//         {lat: 40.760, lng: -74.030}, {lat: 40.730, lng: -74.030},
//         {lat: 40.700, lng: -74.020}
//       ],
//       "Brooklyn": [
//         {lat: 40.570, lng: -74.040}, {lat: 40.580, lng: -73.830},
//         {lat: 40.680, lng: -73.830}, {lat: 40.730, lng: -73.910},
//         {lat: 40.700, lng: -74.020}, {lat: 40.650, lng: -74.030},
//         {lat: 40.570, lng: -74.040}
//       ],
//       "Bronx": [
//         {lat: 40.785, lng: -73.930}, {lat: 40.815, lng: -73.820},
//         {lat: 40.890, lng: -73.780}, {lat: 40.915, lng: -73.880},
//         {lat: 40.880, lng: -73.930}, {lat: 40.850, lng: -73.930},
//         {lat: 40.785, lng: -73.930}
//       ],
//       "Queens": [
//         {lat: 40.580, lng: -73.830}, {lat: 40.590, lng: -73.700},
//         {lat: 40.800, lng: -73.740}, {lat: 40.790, lng: -73.910},
//         {lat: 40.680, lng: -73.830}, {lat: 40.580, lng: -73.830}
//       ],
//       "Staten Island": [
//         {lat: 40.500, lng: -74.250}, {lat: 40.510, lng: -74.050},
//         {lat: 40.650, lng: -74.030}, {lat: 40.570, lng: -74.200},
//         {lat: 40.500, lng: -74.250}
//       ]
//     };
    
//     return boroughBoundaries[borough] || boroughBoundaries["Manhattan"];
//   }
// });

// let timeout;

// function debouncedSearch() {
//   clearTimeout(timeout);
//   timeout = setTimeout(searchLocation, 300);
// }

// function searchLocation() {
//   const query = document.getElementById("location").value;
//   if (query.length < 3) return;

//   fetch(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//       query
//     )}`
//   )
//     .then((res) => res.json())
//     .then((data) => {
//       const list = document.getElementById("suggestions");
//       list.innerHTML = "";
//       data.slice(0, 5).forEach((place) => {
//         const item = document.createElement("li");
//         item.textContent = place.display_name;
//         item.classList.add("suggestion-item");
//         item.addEventListener("click", () => {
//           document.getElementById("location").value = place.display_name;
//           list.innerHTML = "";
//         });
//         list.appendChild(item);
//       });
//     });
// }

// function getMyLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const lat = position.coords.latitude;
//         const lon = position.coords.longitude;
//         // Reverse geocoding using Nominatim
//         fetch(
//           `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
//         )
//           .then((res) => res.json())
//           .then((data) => {
//             document.getElementById("location").value =
//               data.display_name || `${lat}, ${lon}`;
//           });
//       },
//       (error) => {
//         alert("Unable to retrieve location.");
//         console.error(error);
//       }
//     );
//   } else {
//     alert("Geolocation not supported.");
//   }
// }

// function useCurrentTime() {
//   const now = new Date();
//   const formatted = now.toTimeString().slice(0, 5); // HH:MM
//   document.getElementById("time").value = formatted;
// }

//  const form = document.getElementById("risk-form");

//     form.addEventListener("submit", async (e) => {
//         e.preventDefault(); // Stop normal form submission

//         // Gather input data
//         const formData = {
//             age: form.age.value,
//             sex: form.sex.value,
//             race: form.race.value,
//             location: form.location.value,
//             time: form.time.value,
//         };

//         try {
//             const response = await fetch('/processRisk', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData),
//             });

//             const result = await response.json();

//             // Handle the response
//             console.log("Received risk result:", result);
//             document.getElementById("results").style.display = "block";
//             document.getElementById("risk-level").textContent = result.riskLevel;

//         } catch (error) {
//             console.error("Error submitting form:", error);
//         }
//     });

// Global variables
let map = null;
let heatmapLayer = null;
let markers = [];
let userProfile = {};

// Initialize the map
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
                zoom: 13,
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
            }, 100);

        } catch (error) {
            console.error('Map initialization error:', error);
            reject(error);
        }
    });
}

async function getCoordinatesFromAddress(address) {
    try {
        if (!address.toLowerCase().includes('new york')) {
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

function setupHeatmapButton() {
    const viewHeatmapBtn = document.getElementById("view-heatmap-btn");
    const heatmapView = document.querySelector(".heatmap-view");
    const backToResultsBtn = document.getElementById("back-to-results");

    if (viewHeatmapBtn) {
        viewHeatmapBtn.addEventListener("click", async () => {
            try {
                heatmapView.style.display = "flex";
                const mapDiv = document.getElementById("map");
                mapDiv.innerHTML = `<div style="padding: 20px; text-align: center;"><p>Loading map...</p></div>`;

                const locationInput = document.getElementById("location");
                if (!locationInput || !locationInput.value.trim()) throw new Error('Please enter a location');

                const coordinates = await getCoordinatesFromAddress(locationInput.value);
                await initMap([coordinates.lat, coordinates.lon]);

                const crimeData = generateSampleCrimeData([coordinates.lat, coordinates.lon]);
                updateHeatmap(crimeData);
            } catch (error) {
                console.error('Heatmap setup error:', error);
                showMapError(error.message);
            }
        });
    }

    if (backToResultsBtn) {
        backToResultsBtn.addEventListener("click", () => {
            heatmapView.style.display = "none";
        });
    }
}

function generateSampleCrimeData(center) {
    const data = [];
    for (let i = 0; i < 50; i++) {
        data.push({
            latitude: center[0] + (Math.random() - 0.5) * 0.02,
            longitude: center[1] + (Math.random() - 0.5) * 0.02,
            type: "Sample Crime",
            description: "Sample crime incident",
            victim_age: userProfile.age || "25-44",
            victim_sex: userProfile.sex || "male",
            victim_race: userProfile.race || "white"
        });
    }
    return data;
}

function updateHeatmap(crimeData) {
    if (!map) return;

    markers.forEach(marker => marker.remove());
    markers = [];
    if (heatmapLayer) heatmapLayer.remove();

    const heatmapData = crimeData.map(crime => {
        const weight = calculateWeight(crime, userProfile);
        return [crime.latitude, crime.longitude, weight];
    });

    heatmapLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
            0.4: '#00ac46',
            0.6: '#fd8c00',
            0.8: '#dc0000'
        }
    }).addTo(map);

    crimeData.forEach(crime => {
        const weight = calculateWeight(crime, userProfile);
        const riskLevel = getRiskLevel(weight);
        const color = getRiskColor(weight);

        const circle = L.circle([crime.latitude, crime.longitude], {
            radius: weight >= 2.5 ? 40 : weight >= 1.5 ? 30 : 20,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.35
        }).addTo(map);

        const marker = L.circleMarker([crime.latitude, crime.longitude], {
            radius: 6,
            fillColor: color,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<div style="text-align: center;"><strong style="color: ${color}">${riskLevel} Risk Area</strong><br><span style="font-size: 0.9em;">Crime Type: ${crime.type}</span><br><span style="font-size: 0.9em;">${crime.description || ''}</span></div>`);

        markers.push(circle, marker);
        marker.addTo(map);
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function calculateWeight(crime, profile) {
    let weight = 1;
    if (crime.victim_age === profile.age) weight += 0.5;
    if (crime.victim_sex === profile.sex) weight += 0.5;
    if (crime.victim_race === profile.race) weight += 0.5;
    return weight;
}

function getRiskColor(weight) {
    if (weight >= 2.5) return "#dc0000";
    if (weight >= 1.5) return "#fd8c00";
    return "#00ac46";
}

function getRiskLevel(weight) {
    if (weight >= 2.5) return "High";
    if (weight >= 1.5) return "Medium";
    return "Low";
}

function debouncedSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(searchLocation, 300);
}

function searchLocation() {
    const query = document.getElementById("location").value;
    if (query.length < 3) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
            const list = document.getElementById("suggestions");
            list.innerHTML = "";
            data.slice(0, 5).forEach((place) => {
                const item = document.createElement("li");
                item.textContent = place.display_name;
                item.classList.add("suggestion-item");
                item.addEventListener("click", () => {
                    document.getElementById("location").value = place.display_name;
                    list.innerHTML = "";
                });
                list.appendChild(item);
            });
        });
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

document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.querySelector(".start-button");
    const welcomeContainer = document.querySelector(".welcome-container");
    const assessmentForm = document.querySelector(".assessment-form");
    const cancelButton = document.querySelector(".cancel-button");
    const resultsSection = document.querySelector(".results-section");
    const riskForm = document.getElementById("risk-form");
    const riskLevelDisplay = document.getElementById("risk-level");

    startButton?.addEventListener("click", () => {
        welcomeContainer.style.display = "none";
        assessmentForm.style.display = "flex";
    });

    cancelButton?.addEventListener("click", () => {
        assessmentForm.style.display = "none";
        welcomeContainer.style.display = "flex";
    });

    riskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
            age: riskForm.age.value,
            sex: riskForm.sex.value,
            race: riskForm.race.value,
            location: riskForm.location.value,
            time: riskForm.time.value,
        };
        userProfile = formData;

        try {
            const response = await fetch('/processRisk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            resultsSection.style.display = "block";
            riskLevelDisplay.textContent = `Estimated Risk Level: ${result.riskLevel}`;

            assessmentForm.style.display = "none";
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    });

    setupHeatmapButton();
});