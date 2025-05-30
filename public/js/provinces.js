// Provinces Page Script
document.addEventListener("DOMContentLoaded", function () {
  // Ensure we're on the provinces page
  if (document.body.getAttribute("data-page") !== "provinces") {
    return;
  }

  // Initialize the page and load data
  loadProvinces();
  loadProvincesDropdown();

  // Add event listeners
  document
    .getElementById("province-dropdown")
    .addEventListener("change", handleProvinceSelection);

  // Hide the districts table initially
  hideDistrictsTable();
});

// Function to load provinces
function loadProvinces() {
  console.log("Loading provinces from provinces.js");

  // Fetch the provinces data
  fetch("/api/provinces")
    .then((response) => response.json())
    .then((data) => {
      const provincesTable = document.getElementById("provinces-table");
      provincesTable.innerHTML = "";

      data.forEach((province) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${province.province_name_en || ""}</td>
                    <td>${province.province_name_si || ""}</td>
                    <td>${province.province_name_ta || ""}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showDistrictsByProvince('${province.province_id}', '${province.province_name_en}')">
                            <i class="fas fa-eye"></i> Show Districts
                        </button>
                    </td>
                `;
        provincesTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error loading provinces:", error);
    });
}

// Function to load provinces dropdown
function loadProvincesDropdown() {
  fetch("/api/provinces")
    .then((response) => response.json())
    .then((data) => {
      const provinceDropdown = document.getElementById("province-dropdown");

      // Clear existing options except the first one
      while (provinceDropdown.options.length > 1) {
        provinceDropdown.remove(1);
      }

      // Add provinces to dropdown
      data.forEach((province) => {
        const option = document.createElement("option");
        option.value = province.province_id;
        option.textContent = province.province_name_en;
        provinceDropdown.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error loading provinces dropdown:", error);
    });
}

// Handle province selection from dropdown
function handleProvinceSelection() {
  const provinceDropdown = document.getElementById("province-dropdown");
  const selectedProvinceId = provinceDropdown.value;
  const selectedProvinceName =
    provinceDropdown.options[provinceDropdown.selectedIndex].text;

  if (selectedProvinceId) {
    showDistrictsByProvince(selectedProvinceId, selectedProvinceName);
  } else {
    // Hide districts table if no province is selected
    hideDistrictsTable();
  }
}

// Helper function to hide the districts table
function hideDistrictsTable() {
  const districtsTable = document.getElementById("province-districts-table");
  if (districtsTable) {
    districtsTable.innerHTML =
      '<tr><td colspan="4" class="text-center">Please select a province to view districts</td></tr>';
  }
}

// Function to show districts by province
function showDistrictsByProvince(provinceId, provinceName) {
  console.log("Showing districts for province:", provinceId, provinceName);

  // Fetch districts for this province
  fetch(`/api/districts/province/${provinceId}`)
    .then((response) => response.json())
    .then((data) => {
      const districtsTable = document.getElementById(
        "province-districts-table"
      );
      districtsTable.innerHTML = "";

      if (data.length === 0) {
        districtsTable.innerHTML =
          '<tr><td colspan="4" class="text-center">No districts found for this province</td></tr>';
        return;
      }

      data.forEach((district) => {
        const row = document.createElement("tr");

        // Fetch city count separately
        const cityCount = "...";

        row.innerHTML = `
                    <td>${district.district_name_en || ""}</td>
                    <td>${district.district_name_si || ""}</td>
                    <td>${district.district_name_ta || ""}</td>
                    <td>${cityCount}</td>
                `;
        districtsTable.appendChild(row);

        // Always fetch city count separately since it's not included in the district data
        fetchDistrictCityCount(district.district_name_en, row.cells[3]);
      });
    })
    .catch((error) => {
      console.error("Error loading districts:", error);
      const districtsTable = document.getElementById(
        "province-districts-table"
      );
      districtsTable.innerHTML =
        '<tr><td colspan="4" class="text-center text-danger">Error loading districts</td></tr>';
    });
}

// Function to fetch district city count
function fetchDistrictCityCount(districtName, cell) {
  // Using the district name based on the API structure
  fetch(`/api/cities/district/${encodeURIComponent(districtName)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      cell.textContent = data.length || 0;
    })
    .catch((error) => {
      console.error("Error fetching city count:", error);
      cell.textContent = "Error";
    });
}
