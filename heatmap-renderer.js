// heatmap-renderer.js
// This file handles rendering the heatmap visualization using D3.js

/**
 * Renders a heatmap from prediction data using D3.js
 * @param {Array} heatmapData - Array of {lat, lng, risk} points
 * @param {String} containerId - ID of the container element for the heatmap
 * @param {Object} borough - The borough boundary coordinates
 */
function renderHeatmap(heatmapData, containerId, boroughBoundary) {
    // Clear any existing content
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Set up dimensions
    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(`#${containerId}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create color scale for risk levels
    const colorScale = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolate("#00ac46", "#dc0000")); // Green to Red
    
    // Find bounds of the borough
    const lats = boroughBoundary.map(p => p.lat);
    const lngs = boroughBoundary.map(p => p.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Create projections for the geographic coordinates
    const projection = d3.geoMercator()
      .scale(Math.min(width, height) * 100) // Adjust scale as needed
      .center([(minLng + maxLng) / 2, (minLat + maxLat) / 2])
      .translate([width / 2, height / 2]);
    
    // Draw borough boundary
    const pathGenerator = d3.geoPath().projection(projection);
    
    // Convert borough boundary to GeoJSON format
    const boroughGeoJSON = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [boroughBoundary.map(p => [p.lng, p.lat])]
      }
    };
    
    // Draw borough outline
    svg.append("path")
      .datum(boroughGeoJSON)
      .attr("d", pathGenerator)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);
    
    // Determine the size of each heatmap point based on map size
    const pointRadius = Math.min(width, height) / 60;
    
    // Create a defs section for the gradient
    const defs = svg.append("defs");
    
    // Add a clip path to keep elements within borough boundary
    defs.append("clipPath")
      .attr("id", "borough-clip")
      .append("path")
      .datum(boroughGeoJSON)
      .attr("d", pathGenerator);
    
    // Create a group for the heatmap points with clipping applied
    const heatmapGroup = svg.append("g")
      .attr("clip-path", "url(#borough-clip)");
    
    // Create Gaussian blur filter for smoother heatmap
    defs.append("filter")
      .attr("id", "blur")
      .append("feGaussianBlur")
      .attr("stdDeviation", pointRadius / 2);
    
    // Add heatmap points with lower opacity for blending
    heatmapData.forEach(point => {
      const [x, y] = projection([point.lng, point.lat]);
      
      heatmapGroup.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", pointRadius)
        .attr("fill", colorScale(point.risk))
        .attr("opacity", 0.7)
        .attr("filter", "url(#blur)");
    });
    
    // Add legend
    const legendWidth = width * 0.6;
    const legendHeight = 15;
    const legendX = (width - legendWidth) / 2;
    const legendY = height - 30;
    
    // Create gradient for legend
    const legendGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    // Add color stops
    legendGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#00ac46");
      
    legendGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#fd8c00");
      
    legendGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#dc0000");
    
    // Draw legend rectangle
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");
    
    // Add legend labels
    svg.append("text")
      .attr("x", legendX)
      .attr("y", legendY - 5)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text("Low Risk");
      
    svg.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY - 5)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .text("High Risk");
  }