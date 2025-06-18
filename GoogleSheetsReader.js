// 📊 GOOGLE SHEETS CONFIGURATION
const GOOGLE_SHEETS_CONFIG = {
  apiKey: 'AIzaSyA-LlJXRlsP0vyae_rQoRGGceUhrvOx4KA', // Get from Google Cloud Console
  spreadsheetId: '1HY0uRi5a8JdRnFIomMoo1IiOxBHN3Cgd20rqv0IPzic', // From the URL of your Google Sheet
  range: 'Sheet1!A:Z', // Adjust sheet name and range as needed
  baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets'
};

// 🔗 FETCH DATA FROM GOOGLE SHEETS
async function fetchGoogleSheetsData() {
  const url = `${GOOGLE_SHEETS_CONFIG.baseUrl}/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;

  try {
    console.log('Fetching data from Google Sheets...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.values || data.values.length === 0) {
      throw new Error('No data found in the specified range');
    }

    return data.values;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// 🔄 CONVERT GOOGLE SHEETS DATA TO TIMELINE FORMAT
function convertSheetsToTimelineData(sheetsData) {
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

  // Group by house
  const residenceMap = new Map();

  records.forEach(row => {
    // Flexible field mapping - adjust these based on your column names
    const house = row.House || row.house || row.Address || row.address || 'Unknown';
    const name = row.Name || row.name || row.Resident || row.resident;
    const startYear = parseInt(row.StartYear || row['Start Year'] || row.start_year || row.From) || 0;
    const endYear = parseInt(row.EndYear || row['End Year'] || row.end_year || row.To) || 0;
    const notes = row.Notes || row.notes || row.Occupation || row.occupation || '';

    // Skip invalid records
    if (!name || startYear === 0 || endYear === 0) {
      console.warn('Skipping invalid record:', row);
      return;
    }

    const resident = {
      name,
      startYear,
      endYear,
      notes,
      rowOffset: 0 // Will be calculated later
    };

    if (!residenceMap.has(house)) {
      residenceMap.set(house, []);
    }
    residenceMap.get(house).push(resident);
  });

  // Convert to your existing timeline format
  const residenceData = Array.from(residenceMap.entries()).map(([house, residents]) => ({
    house,
    residents: residents.map((resident, index) => ({
      ...resident,
      rowOffset: index
    }))
  }));

  console.log('Processed residence data:', residenceData);
  return residenceData;
}

// 🚀 MAIN FUNCTION TO LOAD DATA AND RENDER TIMELINE
async function loadTimelineFromGoogleSheets() {
  try {
    // Show loading indicator
    showLoadingMessage('Loading data from Google Sheets...');

    // Fetch data from Google Sheets
    const sheetsData = await fetchGoogleSheetsData();

    // Convert to timeline format
    const residenceData = convertSheetsToTimelineData(sheetsData);

    if (residenceData.length === 0) {
      throw new Error('No valid residence data found');
    }

    // Calculate min/max years
    let minYear = Infinity;
    let maxYear = -Infinity;
    
    residenceData.forEach(({ residents }) => {
      residents.forEach(resident => {
        minYear = Math.min(minYear, resident.startYear);
        maxYear = Math.max(maxYear, resident.endYear);
      });
    });

    // Round to nice decade boundaries
    minYear = Math.floor(minYear / 10) * 10;
    maxYear = Math.ceil(maxYear / 10) * 10;

    console.log(`Timeline range: ${minYear} - ${maxYear}`);

    // Make global for your existing functions
    window.residenceData = residenceData;
    window.minYear = minYear;
    window.maxYear = maxYear;

    // Hide loading and render timeline
    hideLoadingMessage();
    initializeTimeline();
    renderLegend();

  } catch (error) {
    hideLoadingMessage();
    showErrorMessage(`Failed to load data: ${error.message}`);
    console.error('Timeline loading error:', error);
  }
}

// 🎨 UI HELPER FUNCTIONS
function showLoadingMessage(message) {
  const container = document.getElementById('timelineContainer');
  if (container) {
    container.innerHTML = `
      <div class="loading-message" style="
        text-align: center; 
        padding: 40px; 
        font-size: 18px; 
        color: #666;
      ">
        <div style="margin-bottom: 10px;">⏳</div>
        ${message}
      </div>`;
  }
}

function hideLoadingMessage() {
  // Will be cleared when timeline renders
}

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
      </div>`;
  }
}

// 🔧 ALTERNATIVE: SIMPLE PUBLIC SHEET ACCESS (No API key needed)
async function fetchPublicGoogleSheet() {
  // For public sheets, you can use this simpler URL format:
  const publicUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/export?format=csv&gid=0`;
  
  try {
    const response = await fetch(publicUrl);
    const csvText = await response.text();
    
    // Parse CSV manually or use a CSV parser
    const rows = csvText.split('\n').map(row => 
      row.split(',').map(cell => cell.replace(/"/g, '').trim())
    );
    
    return rows;
  } catch (error) {
    console.error('Error fetching public sheet:', error);
    throw error;
  }
}

// 🚀 INITIALIZE ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, initializing Google Sheets timeline...');
  loadTimelineFromGoogleSheets();
});

// 🔄 MANUAL REFRESH FUNCTION (optional)
function refreshData() {
  console.log('Manually refreshing data...');
  loadTimelineFromGoogleSheets();
}
