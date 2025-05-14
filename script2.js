// // Global variables
// let map = null;
// let heatmapLayer = null;
// let markers = [];
// let userProfile = {};

// // Initialize the map
// async function initMap(coordinates = [40.7128, -74.0060]) {
//     return new Promise((resolve, reject) => {
//         try {
//             // Wait for the map container to be visible
//             const mapContainer = document.getElementById('map');
//             if (!mapContainer) {
//                 throw new Error('Map container not found');
//             }

//             // Clear existing map instance if it exists
//             if (map) {
//                 map.remove();
//                 map = null;
//             }

//             // Create new map instance
//             map = L.map('map', {
//                 center: coordinates,
//                 zoom: 13,
//                 zoomControl: true,
//                 scrollWheelZoom: true
//             });

//             // Add the tile layer
//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                 attribution: '© OpenStreetMap contributors',
//                 maxZoom: 19
//             }).addTo(map);

//             // Add a marker for the user's location
//             L.marker(coordinates)
//                 .bindPopup('Your Location')
//                 .addTo(map);

//             // Force a map refresh
//             setTimeout(() => {
//                 map.invalidateSize();
//                 resolve(map);
//             }, 100);

//         } catch (error) {
//             console.error('Map initialization error:', error);
//             reject(error);
//         }
//     });
// }

// // Function to get coordinates from address
// async function getCoordinatesFromAddress(address) {
//     try {
//         // Add "New York" to the search if it's not already included
//         if (!address.toLowerCase().includes('new york')) {
//             address += ', New York';
//         }
        
//         const encodedAddress = encodeURIComponent(address);
//         const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
//         const data = await response.json();
        
//         if (data && data.length > 0) {
//             return {
//                 lat: parseFloat(data[0].lat),
//                 lon: parseFloat(data[0].lon),
//                 displayName: data[0].display_name
//             };
//         }
//         throw new Error('Location not found. Please try entering a more specific address.');
//     } catch (error) {
//         console.error('Geocoding error:', error);
//         throw new Error('Unable to find location. Please check the address and try again.');
//     }
// }

// // Show error message in map container
// function showMapError(message = 'An error occurred while initializing the map. Please refresh the page and try again.') {
//     const mapDiv = document.getElementById("map");
//     if (mapDiv) {
//         mapDiv.innerHTML = `
//             <div style="padding: 20px; text-align: center; background: #f8d7da; color: #721c24; border-radius: 8px;">
//                 <h3>Map Error</h3>
//                 <p>${message}</p>
//             </div>
//         `;
//     }
// }

// // Update the view heatmap button click handler
// function setupHeatmapButton() {
//     const viewHeatmapBtn = document.getElementById("view-heatmap-btn");
//     const heatmapView = document.querySelector(".heatmap-view");
//     const backToResultsBtn = document.getElementById("back-to-results");

//     if (viewHeatmapBtn) {
//         viewHeatmapBtn.addEventListener("click", async () => {
//             try {
//                 // Show heatmap view first
//                 heatmapView.style.display = "flex";
                
//                 // Show loading state
//                 const mapDiv = document.getElementById("map");
//                 mapDiv.innerHTML = `
//                     <div style="padding: 20px; text-align: center;">
//                         <p>Loading map...</p>
//                     </div>
//                 `;

//                 // Get user's location
//                 const locationInput = document.getElementById("location");
//                 if (!locationInput || !locationInput.value.trim()) {
//                     throw new Error('Please enter a location');
//                 }

//                 try {
//                     // Get coordinates
//                     const coordinates = await getCoordinatesFromAddress(locationInput.value);
//                     if (!coordinates) {
//                         throw new Error('Could not find the specified location');
//                     }

//                     // Initialize map
//                     await initMap([coordinates.lat, coordinates.lon]);

//                     // Generate and display crime data
//                     const crimeData = generateSampleCrimeData([coordinates.lat, coordinates.lon]);
//                     updateHeatmap(crimeData);

//                 } catch (error) {
//                     showMapError(error.message);
//                 }

//             } catch (error) {
//                 console.error('Error setting up heatmap:', error);
//                 showMapError(error.message);
//             }
//         });
//     }

//     if (backToResultsBtn) {
//         backToResultsBtn.addEventListener("click", () => {
//             heatmapView.style.display = "none";
//         });
//     }
// }

// // Generate sample crime data
// function generateSampleCrimeData(center) {
//     const data = [];
//     for (let i = 0; i < 50; i++) {
//         data.push({
//             latitude: center[0] + (Math.random() - 0.5) * 0.02,
//             longitude: center[1] + (Math.random() - 0.5) * 0.02,
//             type: "Sample Crime",
//             description: "Sample crime incident",
//             victim_age: userProfile.age || "25-44",
//             victim_sex: userProfile.sex || "male",
//             victim_race: userProfile.race || "white"
//         });
//     }
//     return data;
// }

// // Update heatmap with crime data
// function updateHeatmap(crimeData) {
//     if (!map) return;

//     // Clear existing markers and heatmap
//     markers.forEach(marker => marker.remove());
//     markers = [];
//     if (heatmapLayer) {
//         heatmapLayer.remove();
//     }

//     // Separate crimes by risk level
//     const highRiskCrimes = [];
//     const mediumRiskCrimes = [];
//     const lowRiskCrimes = [];

//     crimeData.forEach(crime => {
//         const weight = calculateWeight(crime, userProfile);
//         if (weight >= 2.5) {
//             highRiskCrimes.push(crime);
//         } else if (weight >= 1.5) {
//             mediumRiskCrimes.push(crime);
//         } else {
//             lowRiskCrimes.push(crime);
//         }
//     });
    
//     // Create heatmap layer with all points (base layer)
//     const heatmapData = crimeData.map(crime => {
//         const weight = calculateWeight(crime, userProfile);
//         return [crime.latitude, crime.longitude, weight];
//     });

//     heatmapLayer = L.heatLayer(heatmapData, {
//         radius: 25,
//         blur: 15,
//         maxZoom: 10,
//         gradient: {
//             0.4: '#00ac46',
//             0.6: '#fd8c00',
//             0.8: '#dc0000'
//         }
//     }).addTo(map);

//     // Add circles for different risk levels
//     function addRiskCircle(crime, weight) {
//         const riskLevel = getRiskLevel(weight);
//         const color = getRiskColor(weight);
//         const radius = weight >= 2.5 ? 40 : // High risk
//                       weight >= 1.5 ? 30 : // Medium risk
//                       20; // Low risk

//         const circle = L.circle([crime.latitude, crime.longitude], {
//             radius: radius,
//             fillColor: color,
//             color: color,
//             weight: 2,
//             opacity: 0.8,
//             fillOpacity: 0.35
//         }).addTo(map);

//         const marker = L.circleMarker([crime.latitude, crime.longitude], {
//             radius: 6,
//             fillColor: color,
//             color: '#fff',
//             weight: 1,
//             opacity: 1,
//             fillOpacity: 0.8
//     })
//         .bindPopup(`
//             <div style="text-align: center;">
//                 <strong style="color: ${color}">${riskLevel} Risk Area</strong><br>
//                 <span style="font-size: 0.9em;">Crime Type: ${crime.type}</span><br>
//                 <span style="font-size: 0.9em;">${crime.description || ''}</span>
//             </div>
//         `, {
//             className: `${riskLevel.toLowerCase()}-risk-popup`
//         });

//         markers.push(circle);
//         markers.push(marker);
//         marker.addTo(map);
//     }

//     // Add circles for each risk level
//     crimeData.forEach(crime => {
//         const weight = calculateWeight(crime, userProfile);
//         addRiskCircle(crime, weight);
//     });

//     // Fit map bounds to show all markers
//     if (markers.length > 0) {
//         const group = new L.featureGroup(markers);
//         map.fitBounds(group.getBounds().pad(0.1));
//     }
// }

// // Add these styles to handle the popups
// const style = document.createElement('style');
// style.textContent = `
//     .high-risk-popup .leaflet-popup-content-wrapper {
//         background: rgba(220, 0, 0, 0.1);
//         border-left: 4px solid #dc0000;
//     }
//     .medium-risk-popup .leaflet-popup-content-wrapper {
//         background: rgba(253, 140, 0, 0.1);
//         border-left: 4px solid #fd8c00;
//     }
//     .low-risk-popup .leaflet-popup-content-wrapper {
//         background: rgba(0, 172, 70, 0.1);
//         border-left: 4px solid #00ac46;
//     }
// `;
// document.head.appendChild(style);

// // Update the legend in your HTML to include circle sizes
// // Add this to your heatmap-legend div in index.html:
// const legendHtml = `
//     <div class="legend-item">
//         <div class="legend-circle high"></div>
//         <span>High Risk</span>
//     </div>
//     <div class="legend-item">
//         <div class="legend-circle medium"></div>
//         <span>Medium Risk</span>
//     </div>
//     <div class="legend-item">
//         <div class="legend-circle low"></div>
//         <span>Low Risk</span>
//     </div>
// `;

// // Add these styles to your styles.css
// const cssStyles = `
// .legend-circle {
//     width: 20px;
//     height: 20px;
//     border-radius: 50%;
//     display: inline-block;
//     margin-right: 8px;
// }

// .legend-circle.high {
//     background-color: rgba(220, 0, 0, 0.35);
//     border: 2px solid #dc0000;
// }

// .legend-circle.medium {
//     background-color: rgba(253, 140, 0, 0.35);
//     border: 2px solid #fd8c00;
// }

// .legend-circle.low {
//     background-color: rgba(0, 172, 70, 0.35);
//     border: 2px solid #00ac46;
// }

// .legend-item {
//     display: flex;
//     align-items: center;
//     margin: 5px 0;
// }
// `;

// // Update your HTML to replace the existing legend with this new version:

// // Initialize everything when the DOM is loaded
// document.addEventListener("DOMContentLoaded", () => {
//   const startButton = document.querySelector(".start-button");
//   const welcomeContainer = document.querySelector(".welcome-container");
//   const assessmentForm = document.querySelector(".assessment-form");
//   const cancelButton = document.querySelector(".cancel-button");
//   const resultsSection = document.querySelector(".results-section");
//   const riskForm = document.getElementById("risk-form");
//   const riskLevelDisplay = document.getElementById("risk-level");

//     // Fix for start button
//     startButton?.addEventListener("click", () => {
//     welcomeContainer.style.display = "none";
//     assessmentForm.style.display = "flex";
//   });

//     // Keep the cancel button functionality
//     cancelButton?.addEventListener("click", () => {
//     assessmentForm.style.display = "none";
//     welcomeContainer.style.display = "flex";
//   });

//     // Form submission handler
//     if (riskForm) {
//   riskForm.addEventListener("submit", function (e) {
//     e.preventDefault();
            
//             // Store user profile data
//             userProfile = {
//                 age: document.getElementById("age").value,
//                 sex: document.getElementById("sex").value,
//                 race: document.getElementById("race").value,
//                 location: document.getElementById("location").value,
//                 time: document.getElementById("time").value
//             };
  
//             // Show results
//             if (assessmentForm && resultsSection && riskLevelDisplay) {
//     assessmentForm.style.display = "none";
//     resultsSection.style.display = "block";
                
//                 // Calculate risk level
//                 let risk = calculateRiskLevel(userProfile);
//     riskLevelDisplay.textContent = `Estimated Risk Level: ${risk}`;
//             }
//         });
//     }

//     // Initialize heatmap button handlers
//     setupHeatmapButton();
//   });

// // Helper functions (keep your existing helper functions)
// function calculateWeight(crime, profile) {
//     let weight = 1;
//     if (crime.victim_age === profile.age) weight += 0.5;
//     if (crime.victim_sex === profile.sex) weight += 0.5;
//     if (crime.victim_race === profile.race) weight += 0.5;
//     return weight;
// }

// function getRiskColor(weight) {
//     if (weight >= 2.5) return "#dc0000";
//     if (weight >= 1.5) return "#fd8c00";
//     return "#00ac46";
// }

// function getRiskLevel(weight) {
//     if (weight >= 2.5) return "High";
//     if (weight >= 1.5) return "Medium";
//     return "Low";
//   }

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
//                         const locationInput = document.getElementById("location");
//                         if (data.address) {
//                             // Format the address in a more readable way
//                             const addr = data.address;
//                             let formattedAddress = '';
//                             if (addr.house_number) formattedAddress += addr.house_number + ' ';
//                             if (addr.road) formattedAddress += addr.road + ', ';
//                             if (addr.suburb) formattedAddress += addr.suburb + ', ';
//                             if (addr.city || addr.town) formattedAddress += (addr.city || addr.town) + ', ';
//                             if (addr.state) formattedAddress += addr.state;
                            
//                             locationInput.value = formattedAddress;
//                         } else {
//                             locationInput.value = `${lat}, ${lon}`;
//                         }
//                     })
//                     .catch(error => {
//                         console.error('Error getting address:', error);
//                         document.getElementById("location").value = `${lat}, ${lon}`;
//           });
//       },
//       (error) => {
//                 console.error('Geolocation error:', error);
//                 alert("Unable to retrieve your location. Please enter it manually.");
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 5000,
//                 maximumAge: 0
//       }
//     );
//   } else {
//         alert("Geolocation is not supported by your browser. Please enter your location manually.");
//   }
// }

// function useCurrentTime() {
//   const now = new Date();
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     document.getElementById("time").value = `${hours}:${minutes}`;
// }
