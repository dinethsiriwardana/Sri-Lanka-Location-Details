/**
 * Utility function to inject header and footer templates
 */
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Load header template
    const headerResponse = await fetch("templates/header.html");
    if (!headerResponse.ok) throw new Error("Failed to load header template");
    const headerText = await headerResponse.text();
    document.getElementById("header-placeholder").innerHTML = headerText;

    // Fix header content container
    const contentContainer = document.querySelector(".content-container");
    if (contentContainer) {
      const activePage = document.querySelector(".content-page.active");
      if (activePage) {
        contentContainer.appendChild(activePage);
      }
    }

    // Load footer template
    const footerResponse = await fetch("templates/footer.html");
    if (!footerResponse.ok) throw new Error("Failed to load footer template");
    const footerText = await footerResponse.text();
    document.getElementById("footer-placeholder").innerHTML = footerText;

    // Set active class for current page
    const currentPage = document.body.getAttribute("data-page");
    if (currentPage) {
      const menuItem = document.querySelector(
        `.sidebar-menu li[data-page="${currentPage}"]`
      );
      if (menuItem) {
        menuItem.classList.add("active");
      }
    }

    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    if (sidebarToggle) {
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
    }

    // Initialize mobile sidebar toggle for responsive design
    const mobileToggle = document.querySelector(".mobile-sidebar-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        document.querySelector(".sidebar").classList.toggle("mobile-open");
      });
    }
  } catch (error) {
    console.error("Error loading templates:", error);
    alert("Failed to load page templates. Please refresh the page.");
  }
});
