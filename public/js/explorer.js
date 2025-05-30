// explorer.js - Functionality specific to the City Explorer page
document.addEventListener("DOMContentLoaded", function () {
  // Initialize explorer when page loads
  initExplorer();

  // Initialize table sorting state - default to sort by Name (column 0) ascending
  const table = document.getElementById("dataTable");
  if (table) {
    table.setAttribute("data-sort-col", "0");
    table.setAttribute("data-sort-dir", "asc");

    // Set initial sort indicator
    const nameHeader = table.querySelector("thead th:first-child i.fas");
    if (nameHeader) {
      nameHeader.className = "fas fa-sort-up";
    }
  }
});
