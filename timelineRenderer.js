// 📏 DRAW DECADE YEAR LABELS AT TOP
function renderYearScale(container) {
  const scale = document.createElement('div');
  scale.classList.add('year-scale');

  for (let y = minYear; y <= maxYear; y += 10) {
    const tick = document.createElement('div');
    tick.textContent = y;
    tick.style.flex = "1";
    scale.appendChild(tick);
  }

  container.appendChild(scale);
}
// 🗂️ DISPLAY COLOR LEGEND AT TOP OF PAGE
function renderLegend() {
  const legendData = [
    { label: 'Owner', color: '#69b3a2' },
    { label: 'Tenant', color: '#5B9BD5' },
    { label: 'Widow/Widower', color: '#FF6B6B' },
    { label: 'Labourer', color: '#4ECDC4' },
    { label: 'Shopkeeper / Grocer / Store', color: '#FFE66D' },
    { label: 'Other / Default', color: '#69b3a2' }
  ];

  const legend = document.getElementById('legend');
  legend.innerHTML = '';

  legendData.forEach(item => {
    const entry = document.createElement('div');
    entry.classList.add('legend-item');
    entry.innerHTML = `<span class="legend-color" style="background-color: ${item.color}"></span>${item.label}`;
    legend.appendChild(entry);
  });
}

// 🌐 ADD VERTICAL DECADE LINES BEHIND THE BARS
function renderGridLines(container) {
  const grid = document.createElement('div');
  grid.style.position = 'absolute';
  grid.style.top = '0';
  grid.style.left = '0';
  grid.style.right = '0';
  grid.style.bottom = '0';
  grid.style.zIndex = '0';  // behind everything
  grid.style.pointerEvents = 'none';

  for (let y = minYear; y <= maxYear; y += 10) {
    const line = document.createElement('div');
    const percent = ((y - minYear) / (maxYear - minYear)) * 100;
    line.style.position = 'absolute';
    line.style.left = `${percent}%`;
    line.style.top = '0';
    line.style.bottom = '0';
    line.style.width = '1px';
    line.style.background = '#ddd';
    grid.appendChild(line);
  }

  container.appendChild(grid);
}

// 📐 CALCULATE LEFT/OFFSET POSITION FOR EACH BAR
function calculatePosition(startYear, endYear) {
  const span = maxYear - minYear;
  const left = ((startYear - minYear) / span) * 100;
  const width = ((endYear - startYear) / span) * 100;
  return { left, width };
}

// 🧱 MAIN RENDER FUNCTION: BUILD TIMELINE UI
function initializeTimeline() {
  const timelineContainer = document.getElementById('timelineContainer');
  timelineContainer.innerHTML = '';

  renderGridLines(timelineContainer);
  renderYearScale(timelineContainer);

  residenceData.forEach(({ house, residents }) => {
    const houseSection = document.createElement('div');
    houseSection.classList.add('house-section');
    
    // Calculate the total height needed for this house section
    const maxRowOffset = Math.max(...residents.map(r => r.rowOffset));
    const totalHeight = (maxRowOffset + 1) * 30;
    houseSection.style.height = `${totalHeight + 30}px`; // Add extra space for the label
    houseSection.style.position = 'relative'; // Make sure it's a positioning context

    // Display house label - only create once per house
    const label = document.createElement('div');
    label.classList.add('house-label');
    label.textContent = house;
    label.id = house.replace(/\s+/g, '').replace(/[^\w]/g, '');
    label.style.position = 'relative';
    label.style.zIndex = '1';
    houseSection.appendChild(label);
	
    // Add bar per resident
    residents.forEach(entry => {
      const row = document.createElement('div');
      row.classList.add('timeline-row');
      row.style.position = 'absolute'; // Position absolutely within the house section
      row.style.height = '30px';
      row.style.width = '100%';
      row.style.top = `${entry.rowOffset * 30 + 30}px`; // Offset by 30px to account for label height
      row.style.left = '0';

      const bar = document.createElement('div');
      bar.classList.add('timeline-bar');

      const pos = calculatePosition(entry.startYear, entry.endYear);
      bar.style.left = `${pos.left}%`;
      bar.style.width = `${pos.width}%`; 
      bar.style.backgroundColor = getColorForNotes(entry.notes);
      // Optional: Adjust font size based on bar width
      const barWidth = pos.width;
      if (barWidth < 15) {
        label.style.fontSize = '0.7em';
      } else if (barWidth < 25) {
        label.style.fontSize = '0.8em';
      } else {
        label.style.fontSize = '0.9em';
      }

      // Tooltip interactions
      bar.addEventListener('mouseenter', () => {
        showTooltip(`<strong>${entry.name}</strong><br>${entry.startYear}–${entry.endYear}<br>${entry.notes || ''}`);
      });
      bar.addEventListener('mouseleave', hideTooltip);

      const label = document.createElement('span');
      // ✨ UPDATED: Include date range in the format "Name (startYear - endYear)"
      label.textContent = `${entry.name} (${entry.startYear} - ${entry.endYear})`;
      label.style.fontSize = '0.9em';
      label.style.fontWeight = '500';
      label.style.whiteSpace = 'nowrap';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.style.color = '#fff';
      label.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
      
      // Adjust text color for lighter backgrounds
      if (bar.style.backgroundColor === '#FFE66D') {
        label.style.color = '#333';
        label.style.textShadow = 'none';
      }

      bar.appendChild(label);
      row.appendChild(bar);
      houseSection.appendChild(row);
    });

    timelineContainer.appendChild(houseSection);
  });
}