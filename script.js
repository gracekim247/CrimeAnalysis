document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".start-button");
  const welcomeContainer = document.querySelector(".welcome-container");
  const assessmentForm = document.querySelector(".assessment-form");
  const cancelButton = document.querySelector(".cancel-button");
  const resultsSection = document.querySelector(".results-section");
  const riskForm = document.getElementById("risk-form");
  const riskLevelDisplay = document.getElementById("risk-level");

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
    
    const age = document.getElementById("age").value;
    const sex = document.getElementById("sex").value;
    const race = document.getElementById("race").value;
    const location = document.getElementById("location").value;
    const time = document.getElementById("time").value;
    
    // Prepare the data to be sent via POST
    const formData = new FormData();
    formData.append("age", age);
    formData.append("sex", sex);
    formData.append("race", race);
    formData.append("location", location);
    formData.append("time", time);
  
    // Send the data using the form submission
    fetch("/submitRisk", {
      method: "POST",
      body: formData
    })
    .then(response => response.text())  // Assuming the backend sends text response
    .then(responseText => {
      // Process the response from the server
      console.log(responseText);
      riskLevelDisplay.textContent = responseText;  // Display the response in a div
      resultsSection.style.display = "block";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  });
  
});


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
    const age = document.getElementById("age").value;
    const sex = document.getElementById("sex").value;
    const race = document.getElementById("race").value;
    const location = document.getElementById("location").value;
    const time = document.getElementById("time").value;
  
    // Placeholder logic — replace with real risk model
    let risk = "Low";
    if (location.toLowerCase().includes("bronx") || time >= "22:00" || time <= "05:00") {
      risk = "High";
    } else if (location.toLowerCase().includes("brooklyn")) {
      risk = "Medium";
    }
  
    // Show result
    assessmentForm.style.display = "none";
    resultsSection.style.display = "block";
    riskLevelDisplay.textContent = `Estimated Risk Level: ${risk}`;
  
    // Scroll to results
    document.getElementById("results").scrollIntoView({ behavior: "smooth" });
  });
  

  // Heatmap view toggle
  viewHeatmapBtn.addEventListener("click", () => {
    heatmapView.style.display = "flex";
  });

  backToResultsBtn.addEventListener("click", () => {
    heatmapView.style.display = "none";
  });

  // Function to update heatmap image based on selected borough and risk level
  function updateHeatmapImage(borough, risk) {
    const heatmapImage = document.getElementById("heatmap-image");

    // In a real implementation, you would use different heatmap images for different boroughs
    // For now, we'll just use the placeholder and add some logic to simulate different maps
    let heatmapSrc = "heatmap-placeholder.png";

    // When you have actual heatmaps, use code like this:
    // heatmapSrc = `heatmaps/${borough}-${risk.toLowerCase()}.png`;

    heatmapImage.src = heatmapSrc;
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
