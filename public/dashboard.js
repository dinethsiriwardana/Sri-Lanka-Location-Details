// Constants
const BASE_URL = "/api";
let summaryData = {};

// DOM Elements
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarMenu = document.querySelectorAll(".sidebar-menu li");
const contentPages = document.querySelectorAll(".content-page");

// Dashboard Navigation
sidebarToggle.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");

  // Update toggle button icon
  const toggleIcon = sidebarToggle.querySelector("i");
  if (document.body.classList.contains("sidebar-collapsed")) {
    toggleIcon.classList.remove("fa-bars");
    toggleIcon.classList.add("fa-expand");
    sidebarToggle.setAttribute("title", "Expand Sidebar");
  } else {
    toggleIcon.classList.remove("fa-expand");
    toggleIcon.classList.add("fa-bars");
    sidebarToggle.setAttribute("title", "Collapse Sidebar");
  }
});

sidebarMenu.forEach((menuItem) => {
  menuItem.addEventListener("click", () => {
    // Get the page name from the data attribute
    const pageName = menuItem.getAttribute("data-page");
    showPage(pageName);

    // Update active state
    sidebarMenu.forEach((item) => item.classList.remove("active"));
    menuItem.classList.add("active");

    // Handle mobile sidebar
    if (window.innerWidth < 992) {
      document.querySelector(".sidebar").classList.remove("mobile-open");
    }
  });
});

// Detect initial hash
window.addEventListener("load", () => {
  // If there's no hash in the URL, don't add one
  const hash = window.location.hash.substring(1);
  const pageName = hash || "summary";

  showPage(pageName, !hash); // Only update URL if there was a hash already

  // Update active state in the sidebar
  sidebarMenu.forEach((item) => {
    if (item.getAttribute("data-page") === pageName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
});

// Function to show the selected page
function showPage(pageName, skipUrlUpdate = false) {
  contentPages.forEach((page) => {
    if (page.id === `${pageName}-page`) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });

  // Update URL hash only if not skipped
  if (!skipUrlUpdate) {
    history.replaceState(null, null, `#${pageName}`);
  }

  // Load page-specific data
  loadPageData(pageName);
}

// Keep track of which pages have been loaded
const loadedPages = {
  summary: false,
  explorer: false,
  provinces: false,
  districts: false,
  about: true, // No data to load for about page
};

// Function to load page-specific data
function loadPageData(pageName) {
  // Only load data if it hasn't been loaded before
  if (!loadedPages[pageName]) {
    switch (pageName) {
      case "summary":
        loadSummaryData();
        loadedPages.summary = true;
        break;
      case "explorer":
        initExplorer();
        loadedPages.explorer = true;
        break;
      case "provinces":
        loadProvinces();
        loadedPages.provinces = true;
        break;
      case "districts":
        loadDistricts();
        loadedPages.districts = true;
        break;
      case "about":
        // About page is static, no data loading needed
        break;
    }
  }
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
      fetchData(`/cities/district/${districtDropdown.value}`);
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

    const districtDropdown = document.getElementById("districtDropdown");
    districtDropdown.innerHTML = '<option value="">Select District</option>';
    districts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district.district_name_en;
      option.textContent = district.district_name_en;
      districtDropdown.appendChild(option);
    });

    // For districts page
    populateDistrictsPage(districts);

    // For district province filter
    const districtProvinceFilter = document.getElementById(
      "district-province-filter"
    );
    if (districtProvinceFilter) {
      populateProvinceFilter(districtProvinceFilter);
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
    districtsTable.appendChild(row);

    // Set the data-province attribute for filtering
    row.setAttribute("data-province", district.province_id);
  });

  // Set up province filter for districts table
  setupDistrictProvinceFilter();
}

// Setup district province filter
function setupDistrictProvinceFilter() {
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
}

// Populate province filter dropdown
async function populateProvinceFilter(dropdown) {
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
}

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
async function getProvinceName(provinceId) {
  try {
    const response = await fetch(`${BASE_URL}/provinces`);
    const provinces = await response.json();
    const province = provinces.find((p) => p.province_id === provinceId);
    return province ? province.province_name_en : "Unknown Province";
  } catch (error) {
    console.error("Error fetching province name:", error);
    return "Unknown Province";
  }
}

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
      "<tr><td colspan='4' class='text-center'>No data found</td></tr>";
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
      "<tr><td colspan='4' class='text-center'>No data found</td></tr>";
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.city_name_en}</td>
      <td>${item.district_name_en}</td>
      <td>${item.province_name_en}</td>
      <td>${item.postcode}</td>
    `;
    row.addEventListener("click", () => showCityDetails(item));
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

  // Sort the rows
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim().toLowerCase();
    const bValue = b.cells[columnIndex].textContent.trim().toLowerCase();
    return sortDirection * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
  });

  // Re-add the sorted rows
  rows.forEach((row) => tbody.appendChild(row));
};

// Load summary data when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure the UI is ready before loading data
  setTimeout(() => {
    loadSummaryData();
  }, 100);

  // Setup sidebar toggle icon based on initial state
  const toggleIcon = sidebarToggle.querySelector("i");
  if (document.body.classList.contains("sidebar-collapsed")) {
    toggleIcon.classList.remove("fa-bars");
    toggleIcon.classList.add("fa-expand");
    sidebarToggle.setAttribute("title", "Expand Sidebar");
  } else {
    toggleIcon.classList.remove("fa-expand");
    toggleIcon.classList.add("fa-bars");
    sidebarToggle.setAttribute("title", "Collapse Sidebar");
  }
});
