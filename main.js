// 🧭 GLOBAL STATE
let residenceData = [];  // Stores houses and their resident timelines
let minYear, maxYear;    // Range of years for the full timeline

// 🔧 INITIAL SETUP: Run once page is loaded
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('fileInput');

  // When a CSV file is selected, read it and parse the contents
  input.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target.result);
    reader.readAsText(file);
  });

  // Render the color legend once, just after page loads
  renderLegend();
});

// Anchor-aware scroll once layout is ready
// Scroll to anchored house if present in URL
window.addEventListener('load', () => {
  // Create sample data for demonstration
  const sampleData = `house,resident_name,start_year,end_year,notes
House 1,John Smith,1900,1920,owner
House 1,Mary Johnson,1922,1935,tenant
House 1,Robert Brown,1930,1945,tenant
House 2,Alice Wilson,1905,1925,widow
House 2,David Lee,1928,1950,labourer
House 3,Emma Davis,1910,1940,shopkeeper`;
  
  parseCSV(sampleData);

  const id = window.location.hash.slice(1);
  if (id) {
    setTimeout(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  }
});

// 🪧 Show a status message (e.g. file errors)
function showStatus(msg, type = 'info') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = msg;
  statusEl.style.color = type === 'error' ? 'red' : 'black';
}