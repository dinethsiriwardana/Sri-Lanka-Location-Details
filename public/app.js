// Use relative URL for API calls
const BASE_URL = "/api";
const filterType = document.getElementById("filterType");
const filterInputContainer = document.getElementById("filterInputContainer");
const filterInput = document.getElementById("filterInput");
const nearbyContainer = document.getElementById("nearbyContainer");
const latitudeInput = document.getElementById("latitudeInput");
const longitudeInput = document.getElementById("longitudeInput");
const dataBody = document.getElementById("dataBody");
const districtDropdownContainer = document.getElementById(
  "districtDropdownContainer"
);
const provinceDropdownContainer = document.getElementById(
  "provinceDropdownContainer"
);
const districtDropdown = document.getElementById("districtDropdown");
const provinceDropdown = document.getElementById("provinceDropdown");
const nearbySearchBtn = document.getElementById("nearbySearchBtn");

// Load districts and provinces when page loads
document.addEventListener("DOMContentLoaded", async () => {
  await loadDistricts();
  await loadProvinces();

  // Load all cities by default
  fetchData("/cities");
});

// Function to load districts
async function loadDistricts() {
  try {
    const response = await fetch(`${BASE_URL}/districts`);
    const districts = await response.json();

    districtDropdown.innerHTML = '<option value="">Select District</option>';
    districts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district.district_name_en;
      option.textContent = district.district_name_en;
      districtDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching districts:", error);
  }
}

// Function to load provinces
async function loadProvinces() {
  try {
    const response = await fetch(`${BASE_URL}/provinces`);
    const provinces = await response.json();

    provinceDropdown.innerHTML = '<option value="">Select Province</option>';
    provinces.forEach((province) => {
      const option = document.createElement("option");
      option.value = province.province_name_en;
      option.textContent = province.province_name_en;
      provinceDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching provinces:", error);
  }
}

// Main function to fetch data
async function fetchData(endpoint) {
  try {
    // Show loading spinner
    const loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.style.display = "flex";

    const response = await fetch(BASE_URL + endpoint);
    const data = await response.json();
    console.log("Data fetched:", data);
    renderTable(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    // Only show alert for specific errors, not for empty searches
    if (!error.message.includes("404")) {
      alert("Failed to fetch data. Check console for details.");
    }
    // Clear the table if there's an error
    dataBody.innerHTML =
      "<tr><td colspan='4' class='text-center'>No data found</td></tr>";
  } finally {
    // Hide loading spinner
    const loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.style.display = "none";
  }
}

// Get the endpoint based on current filter selection
function getEndpoint() {
  let endpoint = "";

  switch (filterType.value) {
    case "district":
      if (districtDropdown.value) {
        endpoint = `/cities/district/${districtDropdown.value}`;
      }
      break;
    case "province":
      if (provinceDropdown.value) {
        endpoint = `/cities/province/${provinceDropdown.value}`;
      }
      break;
    case "postcode":
      if (filterInput.value) {
        endpoint = `/cities/postcode/${filterInput.value}`;
      }
      break;
    case "search":
      if (filterInput.value) {
        endpoint = `/cities/search?q=${filterInput.value}&lang=en`;
      }
      break;
    case "nearby":
      // Nearby search requires a button click due to multiple inputs
      break;
    default:
      endpoint = "/cities";
  }

  return endpoint;
}

// Dynamic filter input visibility and reset data when filter type changes
filterType.addEventListener("change", function () {
  // Hide all input containers first
  filterInputContainer.style.display = "none";
  districtDropdownContainer.style.display = "none";
  provinceDropdownContainer.style.display = "none";
  nearbyContainer.style.display = "none";

  // Show appropriate container based on selection
  switch (this.value) {
    case "district":
      districtDropdownContainer.style.display = "block";
      break;
    case "province":
      provinceDropdownContainer.style.display = "block";
      break;
    case "postcode":
    case "search":
      filterInputContainer.style.display = "block";
      break;
    case "nearby":
      nearbyContainer.style.display = "block";
      break;
    default:
      // If no specific filter is selected, show all cities
      fetchData("/cities");
      break;
  }
});

// Event listeners for automatic data fetching
districtDropdown.addEventListener("change", function () {
  if (this.value) {
    fetchData(`/cities/district/${this.value}`);
  }
});

provinceDropdown.addEventListener("change", function () {
  if (this.value) {
    fetchData(`/cities/province/${this.value}`);
  }
});

// Use debounce function for text inputs to avoid too many API calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Add debounced input event for search and postcode
const debouncedSearch = debounce(function () {
  if (filterInput.value.length >= 2) {
    const endpoint = getEndpoint();
    if (endpoint) {
      fetchData(endpoint);
    }
  }
}, 500);

filterInput.addEventListener("input", debouncedSearch);

// Nearby search button event
nearbySearchBtn.addEventListener("click", function () {
  const lat = latitudeInput.value;
  const lon = longitudeInput.value;
  const radius = radiusInput.value || 10;

  if (lat && lon) {
    fetchData(`/cities/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
  } else {
    alert("Please enter both latitude and longitude values");
  }
});

// Render data to table
function renderTable(data) {
  dataBody.innerHTML = "";

  // Ensure data is an array
  const dataArray = Array.isArray(data) ? data : [data];

  if (dataArray.length === 0) {
    dataBody.innerHTML =
      "<tr><td colspan='4' class='text-center'>No cities found matching your criteria</td></tr>";
    return;
  }

  dataArray.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><i class="fas fa-map-marker-alt location-icon"></i>${item.city_name_en || "N/A"}</td>
            <td><span class="badge badge-district">${item.district_name_en || "N/A"}</span></td>
            <td><span class="badge badge-province">${item.province_name_en || "N/A"}</span></td>
            <td>${item.postcode || "N/A"}</td>
        `;
    dataBody.appendChild(row);
  });
}

// Sorting function
function sortTable(columnIndex) {
  const rows = Array.from(dataBody.querySelectorAll("tr"));
  const sortedRows = rows.sort((a, b) => {
    const aText = a
      .getElementsByTagName("td")
      [columnIndex].textContent.toLowerCase();
    const bText = b
      .getElementsByTagName("td")
      [columnIndex].textContent.toLowerCase();
    return aText.localeCompare(bText);
  });

  // Clear current rows
  dataBody.innerHTML = "";

  // Append sorted rows
  sortedRows.forEach((row) => dataBody.appendChild(row));
}
