document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".start-button");
  const welcomeContainer = document.querySelector(".welcome-container");
  const assessmentForm = document.querySelector(".assessment-form");
  const cancelButton = document.querySelector(".cancel-button");
  const resultsSection = document.querySelector(".results-section");
  const riskForm = document.getElementById("risk-form");
  const riskLevelDisplay = document.getElementById("risk-level");
  const viewHeatmapBtn = document.getElementById("view-heatmap-btn");
  const heatmapView = document.querySelector(".heatmap-view");
  const backToResultsBtn = document.getElementById("back-to-results");
  
  // Track the current user input and borough for heatmap generation
  let currentUserInput = {};
  let currentBorough = "";
  let riskLevel = "";

  // Load the random forest model (this would be your trained model)
  let randomForestModel = null;
  
  // Mock function to load your model - replace with actual loading logic
  function loadRandomForestModel() {
    // In a real implementation, you would load your model from a file or API
    // For example: 
    // fetch('/models/random-forest-model.json')
    //   .then(response => response.json())
    //   .then(model => { randomForestModel = model; });
    
    // For now, we'll use a placeholder
    randomForestModel = {
      // This is a placeholder for your actual model
      // Your model structure will depend on how you've implemented your random forest
    };
    
    console.log("Random forest model loaded");
  }
  
  // Load the model when the page loads
  loadRandomForestModel();

  startButton.addEventListener("click", () => {
    welcomeContainer.style.display = "none";
    assessmentForm.style.display = "flex";
  });

  cancelButton.addEventListener("click", () => {
    assessmentForm.style.display = "none";
    welcomeContainer.style.display = "flex";
  });

  riskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    // Collect user input
    const age = document.getElementById("age").value;
    const sex = document.getElementById("sex").value;
    const race = document.getElementById("race").value;
    const location = document.getElementById("location").value;
    const time = document.getElementById("time").value;
    
    // Store the user input for later use with the heatmap
    currentUserInput = { age, sex, race, time };
    
    // Determine borough from location
    currentBorough = extractBorough(location);
    
    // Use your random forest model to predict risk
    // For now, we'll use a simplified version
    riskLevel = predictOverallRisk(currentUserInput, currentBorough);
    
    // Show result
    assessmentForm.style.display = "none";
    resultsSection.style.display = "block";
    
    // Display risk level and set appropriate class
    riskLevelDisplay.textContent = `Estimated Risk Level: ${riskLevel}`;
    riskLevelDisplay.className = "";
    riskLevelDisplay.classList.add(riskLevel.toLowerCase());
  
    // Scroll to results
    document.getElementById("results").scrollIntoView({ behavior: "smooth" });
  });

  // Extract borough from the location string
  function extractBorough(location) {
    const boroughs = ["Manhattan", "Brooklyn", "Bronx", "Queens", "Staten Island"];
    
    // Check if any borough name appears in the location string
    for (const borough of boroughs) {
      if (location.toLowerCase().includes(borough.toLowerCase())) {
        return borough;
      }
    }
    
    // Default to Manhattan if no borough is identified
    return "Manhattan";
  }

  
  
  // Predict overall risk level (Low, Medium, High) based on user input
  function predictOverallRisk(userInput, borough) {
    // This would be replaced with your actual random forest prediction
    // For now, we'll use a simplified placeholder
    
    const { age, sex, race, time } = userInput;
    
    // Simple risk logic
    let risk = 0.3; // Base risk
    
    // Time of day affects risk (higher at night)
    const hourNum = parseInt(time.split(':')[0]);
    if (hourNum >= 22 || hourNum <= 5) {
      risk += 0.4; 
    } else if (hourNum >= 18 || hourNum <= 9) {
      risk += 0.2;
    }
    
    // Borough affects risk
    if (borough === "Bronx") risk += 0.3;
    else if (borough === "Brooklyn") risk += 0.2;
    else if (borough === "Manhattan") risk += 0.1;
    
    // Demographic factors
    if (age === "18-24") risk += 0.1;
    if (sex === "male") risk += 0.05;
    
    // Determine risk level category
    if (risk > 0.7) return "High";
    if (risk > 0.4) return "Medium";
    return "Low";
  }

  // Heatmap view toggle
  viewHeatmapBtn.addEventListener("click", () => {
    heatmapView.style.display = "flex";
    
    // Get the selected borough boundary
    const boroughBoundary = getBoroughBoundary(currentBorough);
    
    // Generate heatmap data from the random forest model
    const heatmapData = generateHeatmapData(currentUserInput, randomForestModel, currentBorough);
    
    // Create the heatmap visualization
    // Replace 'heatmap-visualization' with the actual ID of your heatmap container
    const heatmapContainer = document.querySelector('.heatmap-visualization');
    heatmapContainer.innerHTML = '<div id="heatmap-container" style="width:100%; height:400px;"></div>';
    
    // Render the heatmap
    renderHeatmap(heatmapData, "heatmap-container", boroughBoundary);
  });

  backToResultsBtn.addEventListener("click", () => {
    heatmapView.style.display = "none";
  });

  // Get borough boundary coordinates
  function getBoroughBoundary(borough) {
    // Borough boundaries (simplified coordinates for NYC boroughs)
    const boroughBoundaries = {
      "Manhattan": [
        {lat: 40.700, lng: -74.020}, {lat: 40.710, lng: -73.990},
        {lat: 40.790, lng: -73.940}, {lat: 40.870, lng: -73.910},
        {lat: 40.880, lng: -73.930}, {lat: 40.850, lng: -74.010},
        {lat: 40.760, lng: -74.030}, {lat: 40.730, lng: -74.030},
        {lat: 40.700, lng: -74.020}
      ],
      "Brooklyn": [
        {lat: 40.570, lng: -74.040}, {lat: 40.580, lng: -73.830},
        {lat: 40.680, lng: -73.830}, {lat: 40.730, lng: -73.910},
        {lat: 40.700, lng: -74.020}, {lat: 40.650, lng: -74.030},
        {lat: 40.570, lng: -74.040}
      ],
      "Bronx": [
        {lat: 40.785, lng: -73.930}, {lat: 40.815, lng: -73.820},
        {lat: 40.890, lng: -73.780}, {lat: 40.915, lng: -73.880},
        {lat: 40.880, lng: -73.930}, {lat: 40.850, lng: -73.930},
        {lat: 40.785, lng: -73.930}
      ],
      "Queens": [
        {lat: 40.580, lng: -73.830}, {lat: 40.590, lng: -73.700},
        {lat: 40.800, lng: -73.740}, {lat: 40.790, lng: -73.910},
        {lat: 40.680, lng: -73.830}, {lat: 40.580, lng: -73.830}
      ],
      "Staten Island": [
        {lat: 40.500, lng: -74.250}, {lat: 40.510, lng: -74.050},
        {lat: 40.650, lng: -74.030}, {lat: 40.570, lng: -74.200},
        {lat: 40.500, lng: -74.250}
      ]
    };
    
    return boroughBoundaries[borough] || boroughBoundaries["Manhattan"];
  }
});

let timeout;

function debouncedSearch() {
  clearTimeout(timeout);
  timeout = setTimeout(searchLocation, 300);
}

function searchLocation() {
  const query = document.getElementById("location").value;
  if (query.length < 3) return;

  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`
  )
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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Reverse geocoding using Nominatim
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        )
          .then((res) => res.json())
          .then((data) => {
            document.getElementById("location").value =
              data.display_name || `${lat}, ${lon}`;
          });
      },
      (error) => {
        alert("Unable to retrieve location.");
        console.error(error);
      }
    );
  } else {
    alert("Geolocation not supported.");
  }
}

function useCurrentTime() {
  const now = new Date();
  const formatted = now.toTimeString().slice(0, 5); // HH:MM
  document.getElementById("time").value = formatted;
}

 const form = document.getElementById("risk-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Stop normal form submission

        // Gather input data
        const formData = {
            age: form.age.value,
            sex: form.sex.value,
            race: form.race.value,
            location: form.location.value,
            time: form.time.value,
        };

        try {
            const response = await fetch('/processRisk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            // Handle the response
            console.log("Received risk result:", result);
            document.getElementById("results").style.display = "block";
            document.getElementById("risk-level").textContent = result.riskLevel;

        } catch (error) {
            console.error("Error submitting form:", error);
        }
    });