document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-button');
    const welcomeContainer = document.querySelector('.welcome-container');
    const assessmentForm = document.querySelector('.assessment-form');
    const cancelButton = document.querySelector('.cancel-button');
    const resultsSection = document.querySelector('.results-section');
    const riskForm = document.getElementById('risk-form');
    const riskLevelDisplay = document.getElementById('risk-level');

    startButton.addEventListener('click', () => {
        welcomeContainer.style.display = 'none';
        assessmentForm.style.display = 'flex';
    });

    cancelButton.addEventListener('click', () => {
        assessmentForm.style.display = 'none';
        welcomeContainer.style.display = 'flex';
    });

    riskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const age = document.getElementById('age').value;
        const sex = document.getElementById('sex').value;
        const ethnicity = document.getElementById('ethnicity').value;
        const borough = document.getElementById('borough').value;
        const time = document.getElementById('timeOfDay').value;

        // Placeholder risk logic — replace with backend or model call
        let risk = 'Low';
        if (borough === 'bronx' || time === 'night') risk = 'High';
        else if (borough === 'brooklyn') risk = 'Medium';

        // Show result
        assessmentForm.style.display = 'none';
        resultsSection.style.display = 'block';
        riskLevelDisplay.textContent = `Estimated Risk Level: ${risk}`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-button');
    const welcomeContainer = document.querySelector('.welcome-container');
    const assessmentForm = document.querySelector('.assessment-form');
    const cancelButton = document.querySelector('.cancel-button');
    const resultsSection = document.querySelector('.results-section');
    const riskForm = document.getElementById('risk-form');
    const riskLevelDisplay = document.getElementById('risk-level');
    const viewHeatmapBtn = document.getElementById('view-heatmap-btn');
    const heatmapView = document.querySelector('.heatmap-view');
    const backToResultsBtn = document.getElementById('back-to-results');

    startButton.addEventListener('click', () => {
        welcomeContainer.style.display = 'none';
        assessmentForm.style.display = 'flex';
    });

    cancelButton.addEventListener('click', () => {
        assessmentForm.style.display = 'none';
        welcomeContainer.style.display = 'flex';
    });

    riskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const age = document.getElementById('age').value;
        const sex = document.getElementById('sex').value;
        const race = document.getElementById('race').value;
        const borough = document.getElementById('borough').value;
        const time = document.getElementById('timeOfDay').value;

        // Placeholder risk logic — replace with backend or model call later
        let risk = 'Low';
        if (borough === 'bronx' || time === 'night') risk = 'High';
        else if (borough === 'brooklyn') risk = 'Medium';

        // Show result
        assessmentForm.style.display = 'none';
        resultsSection.style.display = 'block';
        
        // Set risk level text and class for color
        riskLevelDisplay.textContent = `Estimated Risk Level: ${risk}`;
        riskLevelDisplay.className = ''; // Clear existing classes
        riskLevelDisplay.id = 'risk-level'; // Ensure ID is maintained
        riskLevelDisplay.classList.add(risk.toLowerCase()); // Add class based on risk level
        
        // Select appropriate heatmap based on borough and risk
        updateHeatmapImage(borough, risk);
    });
    
    // Heatmap view toggle
    viewHeatmapBtn.addEventListener('click', () => {
        heatmapView.style.display = 'flex';
    });
    
    backToResultsBtn.addEventListener('click', () => {
        heatmapView.style.display = 'none';
    });
    
    // Function to update heatmap image based on selected borough and risk level
    function updateHeatmapImage(borough, risk) {
        const heatmapImage = document.getElementById('heatmap-image');
        
        // In a real implementation, you would use different heatmap images for different boroughs
        // For now, we'll just use the placeholder and add some logic to simulate different maps
        let heatmapSrc = 'heatmap-placeholder.png';
        
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
  const query = document.getElementById('location').value;
  if (query.length < 3) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('suggestions');
      list.innerHTML = '';
      data.slice(0, 5).forEach(place => {
        const item = document.createElement('li');
        item.textContent = place.display_name;
        item.classList.add('suggestion-item');
        item.addEventListener('click', () => {
          document.getElementById('location').value = place.display_name;
          list.innerHTML = '';
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
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(data => {
            document.getElementById('location').value = data.display_name || `${lat}, ${lon}`;
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
  document.getElementById('time').value = formatted;
}
