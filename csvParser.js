// ✅ CSV HEADER CHECKING
function validateHeaders(headers, expected) {
  const cleanHeaders = headers.map(h => h.trim().toLowerCase());
  const cleanExpected = expected.map(h => h.toLowerCase());
  return {
    valid: cleanExpected.every(h => cleanHeaders.includes(h))
  };
}

// 📄 CSV PARSING & CLEANING
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const expected = ['house', 'resident_name', 'start_year', 'end_year', 'notes'];

  const { valid } = validateHeaders(headers, expected);
  if (!valid) {
    showStatus("Invalid headers in CSV file.", "error");
    return;
  }

  // Parse data rows and convert years into numbers
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    obj.start_year = parseInt(obj.start_year, 10);
    obj.end_year = parseInt(obj.end_year, 10);
    return obj;
  }).filter(r => !isNaN(r.start_year) && !isNaN(r.end_year));

  convertToTimelineFormat(rows);
}

// 🧱 TRANSFORM ROWS INTO HOUSE-BASED STRUCTURE
function convertToTimelineFormat(rows) {
  const houseMap = new Map();

  // Group rows by house
  rows.forEach(row => {
    if (!houseMap.has(row.house)) houseMap.set(row.house, []);
    houseMap.get(row.house).push({
      name: row.resident_name,
      startYear: row.start_year,
      endYear: row.end_year,
      notes: row.notes,
      rowOffset: -30  // placeholder, will be assigned below
    });
  });

  // Construct array of houses and apply overlap logic
  residenceData = Array.from(houseMap.entries()).map(([house, residents]) => {
    residents.sort((a, b) => a.startYear - b.startYear);

    const levels = [];
    residents.forEach(res => {
      let placed = false;
      for (let i = 0; i < levels.length; i++) {
        if (res.startYear > levels[i]) {
          res.rowOffset = i;
          levels[i] = res.endYear;
          placed = true;
          break;
        }
      }
      if (!placed) {
        res.rowOffset = levels.length;
        levels.push(res.endYear);
      }
    });

    return { house, residents };
  });

  // ✅ These stay OUTSIDE the map() function
  updateYearRange(rows);
  initializeTimeline();
}

// 📅 CALCULATE TIMELINE SPAN
function updateYearRange(rows) {
  minYear = Math.min(...rows.map(r => r.start_year));
  maxYear = Math.max(...rows.map(r => r.end_year));
}
