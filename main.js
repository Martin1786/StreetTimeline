// 🧭 GLOBAL STATE
let residenceData = [];  // Stores houses and their resident timelines
let minYear, maxYear;    // Range of years for the full timeline

// 📊 GOOGLE SHEETS CONFIGURATION
const GOOGLE_SHEETS_CONFIG = {
  apiKey: 'AIzaSyA-LlJXRlsP0vyae_rQoRGGceUhrvOx4KA', // Get from Google Cloud Console
  spreadsheetId: '1HY0uRi5a8JdRnFIomMoo1IiOxBHN3Cgd20rqv0IPzic', // From the URL of your Google Sheet
  range: 'Sheet1!A:Z', // Adjust sheet name and range as needed
  baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets'
};

// 🔧 INITIAL SETUP: Run once page is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, initializing Google Sheets timeline...');
  
  // Render the color legend on page load
  renderLegend();
  
  // Load data from Google Sheets automatically
  loadTimelineFromGoogleSheets();
  
  // Keep CSV file input as backup option
  const input = document.getElementById('fileInput');
  if (input) {
    input.addEventListener('change', event => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = e => parseCSV(e.target.result);
      reader.readAsText(file);
    });
  }
});

// 🔗 FETCH DATA FROM GOOGLE SHEETS
async function fetchGoogleSheetsData() {
  const url = `${GOOGLE_SHEETS_CONFIG.baseUrl}/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;

  try {
    console.log('Fetching data from Google Sheets...');
    updateStatus('Connecting to Google Sheets...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.values || data.values.length === 0) {
      throw new Error('No data found in the specified range');
    }

    console.log(`Fetched ${data.values.length} rows from Google Sheets`);
    return data.values;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// 🔄 ALTERNATIVE: SIMPLE PUBLIC SHEET ACCESS (No API key needed)
async function fetchPublicGoogleSheet() {
  const publicUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/export?format=csv&gid=0`;
  
  try {
    updateStatus('Fetching public Google Sheet...');
    const response = await fetch(publicUrl);
    const csvText = await response.text();
    
    // Parse CSV manually
    const rows = csvText.split('\n').map(row => 
      row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
    ).filter(row => row.some(cell => cell.length > 0)); // Remove empty rows
    
    return rows;
  } catch (error) {
    console.error('Error fetching public sheet:', error);
    throw error;
  }
}

// 🔄 CONVERT GOOGLE SHEETS DATA TO TIMELINE FORMAT
function convertSheetsToTimelineData(sheetsData) {
  updateStatus('Processing Google Sheets data...');
  
  // First row should be headers
  const [headers, ...rows] = sheetsData;
  
  console.log('Headers found:', headers);
  console.log('Number of data rows:', rows.length);
  
  // Convert rows to objects using headers
  const records = rows.map(row => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] || '';
    });
    return record;
  }).filter(record => {
    // Filter out empty rows
    return record.Name || record.name || record.House || record.house;
  });

  console.log('Sample record:', records[0]);

  // Group by house and process residents
  const houseGroups = {};
  
  records.forEach(row => {
    // Flexible field mapping - adjust these based on your column names
    const house = row.House || row.house || row.Address || row.address || row.Building || row.building || 'Unknown';
    const name = row.Name || row.name || row.Resident || row.resident || 'Unknown Resident';
    const startYear = parseInt(row.StartYear || row['Start Year'] || row.start_year || row.From || row.from) || 0;
    const endYear = parseInt(row.EndYear || row['End Year'] || row.end_year || row.To || row.to) || 0;
    const notes = row.Notes || row.notes || row.Occupation || row.occupation || row.Type || row.type || '';

    // Skip invalid records
    if (startYear === 0 || endYear === 0 || startYear > endYear) {
      console.warn('Skipping invalid record:', { name, startYear, endYear });
      return;
    }

    const resident = {
      name,
      startYear,
      endYear,
      notes
    };

    if (!houseGroups[house]) {
      houseGroups[house] = [];
    }
    houseGroups[house].push(resident);
  });

  // Convert to timeline format with row offset calculation
  const processedData = Object.entries(houseGroups).map(([house, residents]) => {
    // Sort residents by start year
    residents.sort((a, b) => a.startYear - b.startYear);
    
    // Calculate row offsets to prevent overlapping bars
    const rows = [];
    residents.forEach(resident => {
      let rowOffset = 0;
      
      // Find the first row where this resident doesn't overlap with existing ones
      while (rows[rowOffset] && 
             rows[rowOffset].some(r => 
               !(resident.endYear < r.startYear || resident.startYear > r.endYear)
             )) {
        rowOffset++;
      }
      
      // Initialize row if needed
      if (!rows[rowOffset]) rows[rowOffset] = [];
      
      // Add resident to this row
      resident.rowOffset = rowOffset;
      rows[rowOffset].push(resident);
    });

    return { house, residents };
  });

  console.log('Processed residence data:', processedData);
  return processedData;
}

// 🚀 MAIN FUNCTION TO LOAD DATA AND RENDER TIMELINE
async function loadTimelineFromGoogleSheets() {
  try {
    updateStatus('Loading data from Google Sheets...');

    // Try API first, fall back to public access
    let sheetsData;
    try {
      sheetsData = await fetchGoogleSheetsData();
    } catch (apiError) {
      console.warn('API access failed, trying public sheet access:', apiError.message);
      updateStatus('API failed, trying public access...');
      sheetsData = await fetchPublicGoogleSheet();
    }

    // Convert to timeline format
    residenceData = convertSheetsToTimelineData(sheetsData);

    if (residenceData.length === 0) {
      throw new Error('No valid residence data found');
    }

    // Calculate global year range
    const allYears = residenceData.flatMap(({ residents }) => 
      residents.flatMap(r => [r.startYear, r.endYear])
    );
    minYear = Math.min(...allYears);
    maxYear = Math.max(...allYears);

    // Round to nice decade boundaries
    minYear = Math.floor(minYear / 10) * 10;
    maxYear = Math.ceil(maxYear / 10) * 10;

    console.log(`Timeline range: ${minYear} - ${maxYear}`);
    updateStatus(`Timeline ready: ${residenceData.length} buildings, ${minYear}–${maxYear}`);

    // Sort houses by name for consistent display
    residenceData.sort((a, b) => a.house.localeCompare(b.house));

    // Initialize and render the timeline
    initializeTimeline();

  } catch (error) {
    updateStatus(`Failed to load data: ${error.message}`, 'error');
    showErrorMessage(`Failed to load data: ${error.message}`);
    console.error('Timeline loading error:', error);
  }
}

// 📊 FALLBACK: PARSE CSV DATA (for file upload option)
function parseCSV(csvText) {
  updateStatus('Parsing CSV data...');
  
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }
    
    // Convert CSV to sheets format and process
    const sheetsData = lines.map(line => 
      line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );
    
    residenceData = convertSheetsToTimelineData(sheetsData);
    
    if (residenceData.length === 0) {
      throw new Error('No valid data rows found');
    }
    
    // Calculate global year range
    const allYears = residenceData.flatMap(({ residents }) => 
      residents.flatMap(r => [r.startYear, r.endYear])
    );
    minYear = Math.min(...allYears);
    maxYear = Math.max(...allYears);
    
    // Round to nice decade boundaries
    minYear = Math.floor(minYear / 10) * 10;
    maxYear = Math.ceil(maxYear / 10) * 10;
    
    updateStatus(`CSV loaded: ${residenceData.length} buildings, ${minYear}–${maxYear}`);
    
    // Sort and render
    residenceData.sort((a, b) => a.house.localeCompare(b.house));
    initializeTimeline();
    
  } catch (error) {
    updateStatus(`Error: ${error.message}`, 'error');
    console.error('CSV parsing error:', error);
  }
}

// 🎨 UI HELPER FUNCTIONS
function showErrorMessage(message) {
  const container = document.getElementById('timelineContainer');
  if (container) {
    container.innerHTML = `
      <div class="error-message" style="
        color: #d32f2f; 
        background: #ffebee; 
        border: 1px solid #ffcdd2; 
        padding: 20px; 
        margin: 20px; 
        border-radius: 4px;
        text-align: center;
      ">
        <strong>⚠️ Error:</strong> ${message}
        <br><br>
        <small>Check the browser console for more details.</small>
        <br><br>
        <button onclick="refreshData()" style="
          background: #1976d2; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 4px; 
          cursor: pointer;
        ">🔄 Retry</button>
      </div>`;
  }
}

// 📱 UPDATE STATUS MESSAGE
function updateStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = type;
    
    // Clear status after 5 seconds for non-error messages
    if (type !== 'error') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = '';
      }, 5000);
    }
  }
  
  console.log(`Status: ${message}`);
}

// 🔄 MANUAL REFRESH FUNCTION
function refreshData() {
  console.log('Manually refreshing data...');
  const container = document.getElementById('timelineContainer');
  if (container) {
    container.innerHTML = '<div style="text-align: center; padding: 20px;">🔄 Refreshing...</div>';
  }
  loadTimelineFromGoogleSheets();
}

// 🌐 EXPOSE REFRESH FUNCTION GLOBALLY
window.refreshData = refreshData;
