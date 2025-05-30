// Constants
const BASE_URL = "/api";
let summaryData = {};

// Show/Hide loading spinner functions
function showLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "flex";
  }
}

function hideLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "none";
  }
}

// Modal handler function
function showDetailsModal(title, content) {
  const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
  document.getElementById("detailsModalLabel").textContent = title;
  document.getElementById("modal-content").innerHTML = content;
  modal.show();
}

// Summary Page
async function loadSummaryData() {
  try {
    // Show a loading indicator if we add one later
    const response = await fetch(`${BASE_URL}/summary`);

    if (!response.ok) {
      throw new Error(`Failed to fetch summary data: ${response.statusText}`);
    }

    summaryData = await response.json();
    renderSummaryData(summaryData, false); // Pass false to skip showing details immediately
  } catch (error) {
    console.error("Error fetching summary data:", error);
    // Show an error message to the user
    const provinceSummaryTable = document.getElementById(
      "province-summary-table"
    );
    if (provinceSummaryTable) {
      provinceSummaryTable.innerHTML = `<tr><td colspan="4" class="text-center text-danger">
        Failed to load summary data. Please try refreshing the page.
      </td></tr>`;
    }
  }
}

function renderSummaryData(data, showDetailsImmediately = true) {
  // For Summary KPIs
  let totalProvinces = Object.keys(data).length;
  let totalDistricts = 0;
  let totalCities = 0;
  const provinceSummaryTable = document.getElementById(
    "province-summary-table"
  );
  provinceSummaryTable.innerHTML = "";

  // For province selector dropdown
  const provinceSelect = document.getElementById("province-select");
  provinceSelect.innerHTML = '<option value="">Select Province</option>';

  // Calculate totals and populate tables
  Object.entries(data).forEach(([provinceId, province]) => {
    totalDistricts += province.districtCount;
    totalCities += province.cityCount;

    // Add row to the province summary table
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${province.provinceName}</td>
      <td>${province.districtCount}</td>
      <td>${province.cityCount}</td>
      <td><a class="detail-link" data-province-id="${provinceId}">View Districts</a></td>
    `;
    provinceSummaryTable.appendChild(row);

    // Add to province selector dropdown
    const option = document.createElement("option");
    option.value = provinceId;
    option.textContent = province.provinceName;
    provinceSelect.appendChild(option);
  });

  // Update the summary numbers
  document.getElementById("provinces-count").textContent = totalProvinces;
  document.getElementById("districts-count").textContent = totalDistricts;
  document.getElementById("cities-count").textContent = totalCities;

  // Add event listeners for detail links
  document.querySelectorAll(".detail-link").forEach((link) => {
    link.addEventListener("click", function () {
      const provinceId = this.getAttribute("data-province-id");
      showDistrictDetails(provinceId);
      provinceSelect.value = provinceId;
    });
  });

  // Add event listener to province selector
  provinceSelect.addEventListener("change", function () {
    showDistrictDetails(this.value);
  });

  // Preselect first province
  if (totalProvinces > 0) {
    const firstProvinceId = Object.keys(data)[0];
    provinceSelect.value = firstProvinceId;

    // Only show details automatically if requested
    if (showDetailsImmediately) {
      // Defer showing district details to avoid blocking the main thread
      setTimeout(() => {
        showDistrictDetails(firstProvinceId);
      }, 300);
    }
  }
}

function showDistrictDetails(provinceId) {
  if (!provinceId) return;

  const province = summaryData[provinceId];
  const districtDetailTable = document.getElementById("district-detail-table");
  districtDetailTable.innerHTML = "";

  Object.entries(province.districts).forEach(([districtId, district]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${district.districtName}</td>
      <td>${district.cityCount}</td>
    `;
    districtDetailTable.appendChild(row);
  });
}

// City Explorer Page
function initExplorer() {
  // This code is adapted from the original app.js
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

  loadDistricts();
  loadProvinces();

  // Load all cities by default
  fetchData("/cities");

  // Setup event delegation for nearby search buttons added dynamically to rows
  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest(".nearby-search-btn")) {
      const button = e.target.closest(".nearby-search-btn");
      const lat = button.getAttribute("data-lat");
      const lon = button.getAttribute("data-lon");

      // Set filter type to nearby
      filterType.value = "nearby";

      // Trigger the change event to update the UI
      const event = new Event("change");
      filterType.dispatchEvent(event);

      // Populate the latitude and longitude inputs
      latitudeInput.value = lat;
      longitudeInput.value = lon;

      // Focus on the radius input for easy adjustment
      radiusInput.focus();
      radiusInput.select();
    }
  });

  // Filter change event
  filterType.addEventListener("change", () => {
    filterInputContainer.style.display = "none";
    districtDropdownContainer.style.display = "none";
    provinceDropdownContainer.style.display = "none";
    nearbyContainer.style.display = "none";

    switch (filterType.value) {
      case "district":
        districtDropdownContainer.style.display = "block";
        break;
      case "province":
        provinceDropdownContainer.style.display = "block";
        break;
      case "postcode":
        filterInputContainer.style.display = "block";
        filterInput.placeholder = "Enter postcode";
        break;
      case "search":
        filterInputContainer.style.display = "block";
        filterInput.placeholder = "Enter city name";
        break;
      case "nearby":
        nearbyContainer.style.display = "block";
        break;
      default:
        // Load all cities if no filter selected
        fetchData("/cities");
    }
  });

  // Event listeners for filter inputs
  filterInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const endpoint = getEndpoint();
      if (endpoint) {
        fetchData(endpoint);
      }
    }
  });

  districtDropdown.addEventListener("change", function () {
    if (districtDropdown.value) {
      // Get the selected option text (district name) instead of the value (district id)
      const selectedOption =
        districtDropdown.options[districtDropdown.selectedIndex];
      const districtName = selectedOption.textContent;
      fetchData(`/cities/district/${districtName}`);
    }
  });

  provinceDropdown.addEventListener("change", function () {
    if (provinceDropdown.value) {
      fetchData(`/cities/province/${provinceDropdown.value}`);
    }
  });

  nearbySearchBtn.addEventListener("click", function () {
    const lat = latitudeInput.value;
    const lon = longitudeInput.value;
    const radius = radiusInput.value || 10;

    if (lat && lon) {
      fetchData(`/cities/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
    } else {
      alert("Please enter latitude and longitude");
    }
  });

  // Function to get the endpoint based on current filter selection
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
          endpoint = `/cities/search?q=${filterInput.value}`;
        }
        break;
      case "nearby":
        // Handled by nearbySearchBtn click event
        break;
      default:
        endpoint = "/cities";
    }

    return endpoint;
  }
}

// Load districts for city explorer page and district page
async function loadDistricts() {
  try {
    const response = await fetch(`${BASE_URL}/districts`);
    const districts = await response.json();

    // Populate district dropdowns for explorer page
    const districtDropdown = document.getElementById("districtDropdown");
    if (districtDropdown) {
      districtDropdown.innerHTML = '<option value="">Select District</option>';
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district.district_id;
        option.textContent = district.district_name_en;
        districtDropdown.appendChild(option);
      });
    }

    // For districts page
    await populateDistrictsPage(districts);

    // For district province filter
    const districtProvinceFilter = document.getElementById(
      "district-province-filter"
    );
    if (districtProvinceFilter) {
      await populateProvinceFilter(districtProvinceFilter);
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
  }
}

// Provinces page
async function loadProvinces() {
  try {
    const response = await fetch(`${BASE_URL}/provinces`);
    const provinces = await response.json();

    const provinceDropdown = document.getElementById("provinceDropdown");
    if (provinceDropdown) {
      provinceDropdown.innerHTML = '<option value="">Select Province</option>';
      provinces.forEach((province) => {
        const option = document.createElement("option");
        option.value = province.province_name_en;
        option.textContent = province.province_name_en;
        provinceDropdown.appendChild(option);
      });
    }

    // For provinces page
    populateProvincesPage(provinces);
  } catch (error) {
    console.error("Error fetching provinces:", error);
  }
}

// Populate the provinces page
function populateProvincesPage(provinces) {
  const provincesTable = document.getElementById("provinces-table");
  if (!provincesTable) return;

  provincesTable.innerHTML = "";
  provinces.forEach((province) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${province.province_name_en}</td>
      <td>${province.province_name_si}</td>
      <td>${province.province_name_ta}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="showProvinceDetails('${province.province_id}')">
          Show Districts
        </button>
      </td>
    `;
    provincesTable.appendChild(row);
  });
}

// Show province details in modal
window.showProvinceDetails = async function (provinceId) {
  try {
    const response = await fetch(
      `${BASE_URL}/districts/province/${provinceId}`
    );
    const districts = await response.json();

    const modalContent = document.getElementById("modal-content");
    const provinceName = await getProvinceName(provinceId);

    let content = `<h5>Districts in ${provinceName}</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>District Name (EN)</th>
              <th>District Name (SI)</th>
              <th>District Name (TA)</th>
            </tr>
          </thead>
          <tbody>`;

    districts.forEach((district) => {
      content += `
        <tr>
          <td>${district.district_name_en}</td>
          <td>${district.district_name_si}</td>
          <td>${district.district_name_ta}</td>
        </tr>
      `;
    });

    content += `</tbody></table></div>`;
    modalContent.innerHTML = content;

    const detailsModalLabel = document.getElementById("detailsModalLabel");
    detailsModalLabel.textContent = `${provinceName} Province Details`;

    const detailsModal = new bootstrap.Modal(
      document.getElementById("detailsModal")
    );
    detailsModal.show();
  } catch (error) {
    console.error("Error fetching province details:", error);
  }
};

// Populate the districts page
async function populateDistrictsPage(districts) {
  const districtsTable = document.getElementById("districts-table");
  if (!districtsTable) return;

  districtsTable.innerHTML = "";

  // First, get all provinces for the province names
  const provincesResponse = await fetch(`${BASE_URL}/provinces`);
  const provinces = await provincesResponse.json();

  // Create a province lookup map
  const provinceMap = {};
  provinces.forEach((province) => {
    provinceMap[province.province_id] = province.province_name_en;
  });

  // Create the district rows
  districts.forEach((district) => {
    const row = document.createElement("tr");
    const provinceName = provinceMap[district.province_id] || "Unknown";

    row.innerHTML = `
      <td>${district.district_name_en}</td>
      <td>${district.district_name_si}</td>
      <td>${district.district_name_ta}</td>
      <td>${provinceName}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="showDistrictCities('${district.district_id}')">
          Show Cities
        </button>
      </td>
    `;

    // Important: Set the data-province attribute before adding to the table
    row.setAttribute("data-province", district.province_id);

    // Add the row to the table
    districtsTable.appendChild(row);
  });

  console.log("Districts populated with data-province attributes");
  return districts; // Return districts for chaining
}

// Setup district province filter - make this available to all pages
window.setupDistrictProvinceFilter = function () {
  const districtProvinceFilter = document.getElementById(
    "district-province-filter"
  );
  if (!districtProvinceFilter) return;

  districtProvinceFilter.addEventListener("change", function () {
    const provinceId = this.value;
    const rows = document.querySelectorAll("#districts-table tr");

    rows.forEach((row) => {
      if (!provinceId || row.getAttribute("data-province") === provinceId) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
};

// Populate province filter dropdown - make this available to all pages
window.populateProvinceFilter = async function (dropdown) {
  try {
    const response = await fetch(`${BASE_URL}/provinces`);
    const provinces = await response.json();

    dropdown.innerHTML = '<option value="">All Provinces</option>';
    provinces.forEach((province) => {
      const option = document.createElement("option");
      option.value = province.province_id;
      option.textContent = province.province_name_en;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching provinces for filter:", error);
  }
};

// Show district cities in modal
window.showDistrictCities = async function (districtId) {
  try {
    // First get district info
    const districtsResponse = await fetch(`${BASE_URL}/districts`);
    const districts = await districtsResponse.json();
    const district = districts.find((d) => d.district_id === districtId);

    if (!district) throw new Error("District not found");

    // Get cities in this district
    const citiesResponse = await fetch(
      `${BASE_URL}/cities/district/${district.district_name_en}`
    );
    const cities = await citiesResponse.json();

    const modalContent = document.getElementById("modal-content");

    let content = `<h5>Cities in ${district.district_name_en} District</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>City Name (EN)</th>
              <th>City Name (SI)</th>
              <th>City Name (TA)</th>
              <th>Postcode</th>
            </tr>
          </thead>
          <tbody>`;

    cities.forEach((city) => {
      content += `
        <tr>
          <td>${city.city_name_en}</td>
          <td>${city.city_name_si}</td>
          <td>${city.city_name_ta}</td>
          <td>${city.postcode}</td>
        </tr>
      `;
    });

    content += `</tbody></table></div>`;
    modalContent.innerHTML = content;

    const detailsModalLabel = document.getElementById("detailsModalLabel");
    detailsModalLabel.textContent = `${district.district_name_en} District Details`;

    const detailsModal = new bootstrap.Modal(
      document.getElementById("detailsModal")
    );
    detailsModal.show();
  } catch (error) {
    console.error("Error fetching district details:", error);
  }
};

// Helper function to get province name by ID
window.getProvinceName = async function (provinceId) {
  try {
    const response = await fetch(`${BASE_URL}/provinces`);
    const provinces = await response.json();
    const province = provinces.find((p) => p.province_id === provinceId);
    return province ? province.province_name_en : "Unknown Province";
  } catch (error) {
    console.error("Error fetching province name:", error);
    return "Unknown Province";
  }
};

// Main data fetching function for city explorer page
async function fetchData(endpoint) {
  try {
    // Show loading spinner
    const loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.style.display = "flex";

    const response = await fetch(BASE_URL + endpoint);
    const data = await response.json();
    renderTable(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    // Clear the table if there's an error
    const dataBody = document.getElementById("dataBody");
    dataBody.innerHTML =
      "<tr><td colspan='7' class='text-center'>No data found</td></tr>";
  } finally {
    // Hide loading spinner
    const loadingSpinner = document.getElementById("loadingSpinner");
    loadingSpinner.style.display = "none";
  }
}

// Render table for city explorer page
function renderTable(data) {
  const dataBody = document.getElementById("dataBody");
  dataBody.innerHTML = "";

  if (!Array.isArray(data)) {
    // If data is not an array (e.g., getting a single city by postcode)
    data = [data];
  }

  if (data.length === 0) {
    dataBody.innerHTML =
      "<tr><td colspan='7' class='text-center'>No data found</td></tr>";
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.city_name_en}</td>
      <td>${item.district_name_en}</td>
      <td>${item.province_name_en}</td>
      <td>${item.postcode}</td>
      <td>${item.latitude}</td>
      <td>${item.longitude}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary nearby-search-btn" 
          data-lat="${item.latitude}" data-lon="${item.longitude}" title="Find cities near ${item.city_name_en}">
          <i class="fas fa-search-location"></i> Nearby
        </button>
      </td>
    `;

    // Add click event for row (excluding the button)
    row.addEventListener("click", (e) => {
      // Only show city details if the click wasn't on the search button
      if (!e.target.closest(".nearby-search-btn")) {
        showCityDetails(item);
      }
    });

    dataBody.appendChild(row);
  });
}

// Show city details
function showCityDetails(city) {
  const modalContent = document.getElementById("modal-content");

  let content = `
    <div class="row">
      <div class="col-md-6">
        <h5>City Information</h5>
        <table class="table">
          <tr>
            <th>Name (EN)</th>
            <td>${city.city_name_en}</td>
          </tr>
          <tr>
            <th>Name (SI)</th>
            <td>${city.city_name_si}</td>
          </tr>
          <tr>
            <th>Name (TA)</th>
            <td>${city.city_name_ta}</td>
          </tr>
          <tr>
            <th>Postcode</th>
            <td>${city.postcode}</td>
          </tr>
        </table>
      </div>
      <div class="col-md-6">
        <h5>Location</h5>
        <table class="table">
          <tr>
            <th>District</th>
            <td>${city.district_name_en}</td>
          </tr>
          <tr>
            <th>Province</th>
            <td>${city.province_name_en}</td>
          </tr>
          <tr>
            <th>Latitude</th>
            <td>${city.latitude}</td>
          </tr>
          <tr>
            <th>Longitude</th>
            <td>${city.longitude}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-12">
        <h5>Map</h5>
        <div class="map-container">
          <a href="https://www.google.com/maps/search/?api=1&query=${city.latitude},${city.longitude}" target="_blank" class="btn btn-outline-primary">
            <i class="fas fa-map-marker-alt"></i> View on Google Maps
          </a>
        </div>
      </div>
    </div>
  `;

  modalContent.innerHTML = content;

  const detailsModalLabel = document.getElementById("detailsModalLabel");
  detailsModalLabel.textContent = `${city.city_name_en} Details`;

  const detailsModal = new bootstrap.Modal(
    document.getElementById("detailsModal")
  );
  detailsModal.show();
}

// Table sorting function for city explorer page
window.sortTable = function (columnIndex) {
  const table = document.getElementById("dataTable");
  const tbody = document.getElementById("dataBody");
  const rows = Array.from(tbody.rows);

  let sortDirection = table.getAttribute("data-sort-dir") === "asc" ? -1 : 1;

  if (table.getAttribute("data-sort-col") !== columnIndex.toString()) {
    sortDirection = 1;
    table.setAttribute("data-sort-col", columnIndex);
  }

  table.setAttribute("data-sort-dir", sortDirection === 1 ? "asc" : "desc");

  // Update sort indicators in table headers
  updateSortIndicators(
    table,
    columnIndex,
    sortDirection === 1 ? "asc" : "desc"
  );

  // Sort the rows
  rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();

    // Check if we're sorting numeric columns (Latitude, Longitude, Postcode)
    if (columnIndex === 3 || columnIndex === 4 || columnIndex === 5) {
      const aValue = parseFloat(aText) || 0;
      const bValue = parseFloat(bText) || 0;
      return sortDirection * (aValue - bValue);
    } else {
      // Text comparison for non-numeric columns
      const aValue = aText.toLowerCase();
      const bValue = bText.toLowerCase();
      return sortDirection * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
    }
  });

  // Re-add the sorted rows
  rows.forEach((row) => tbody.appendChild(row));
};

// Function to update sort indicators in table headers
function updateSortIndicators(table, activeColumnIndex, direction) {
  const headers = table.querySelectorAll("thead th");

  // Remove all active sort classes
  headers.forEach((header) => {
    // Reset to default sort icon
    const icon = header.querySelector("i.fas");
    if (icon) {
      icon.className = "fas fa-sort";
    }
  });

  // Add the appropriate sort icon to the active column
  const activeHeader = headers[activeColumnIndex];
  if (activeHeader) {
    const icon = activeHeader.querySelector("i.fas");
    if (icon) {
      icon.className =
        direction === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  }
}

// Initialize page based on current path
document.addEventListener("DOMContentLoaded", () => {
  // No automatic initialization in the shared file
  // Each page has its own initialization script
});
