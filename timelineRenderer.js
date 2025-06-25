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

  // residenceData is now [{ street, houses: [{ house, residents }] }]
  residenceData.forEach(({ street, houses }, streetIdx) => {
    // Add street heading and faint line
    const streetHeading = document.createElement('div');
    streetHeading.textContent = street;
    streetHeading.style.fontWeight = 'bold';
    streetHeading.style.fontSize = '1.1em';
    streetHeading.style.margin = '32px 0 8px 0';
    streetHeading.style.padding = '4px 0';
    streetHeading.style.color = '#444';
    streetHeading.style.background = 'none';
    streetHeading.style.borderTop = streetIdx === 0 ? 'none' : '1px solid #e0e0e0';
    streetHeading.style.letterSpacing = '0.03em';
    timelineContainer.appendChild(streetHeading);

    // Create a Materialize collapsible for this street's houses
    const collapsible = document.createElement('ul');
    collapsible.className = 'collapsible';
    collapsible.style.marginBottom = '2rem';

    houses.forEach(({ house, residents }) => {
      // Create collapsible item for each house
      const li = document.createElement('li');
      // Collapsible header (house label)
      const header = document.createElement('div');
      header.className = 'collapsible-header';
      header.innerHTML = `<span style="font-weight:bold;">${house}</span><i class="material-icons right">expand_more</i>`;
      li.appendChild(header);
      // Collapsible body (timeline rows)
      const body = document.createElement('div');
      body.className = 'collapsible-body';
      // Create a div to hold the timeline rows
      const houseSection = document.createElement('div');
      houseSection.classList.add('house-section');
      
      // Calculate the total height needed for this house section
      const maxRowOffset = Math.max(...residents.map(r => r.rowOffset));
      const totalHeight = (maxRowOffset + 1) * 18;
      houseSection.style.height = `${totalHeight + 10}px`; // Less extra space for the label
      houseSection.style.marginBottom = '8px'; // Reduce space between houses
      houseSection.style.position = 'relative'; // Make sure it's a positioning context
      houseSection.style.marginLeft = '0';
      houseSection.style.paddingLeft = '0';

      // Display house label - only create once per house
      const houseLabel = document.createElement('div');
      houseLabel.classList.add('house-label');
      houseLabel.textContent = house;
      houseLabel.id = house.replace(/\s+/g, '').replace(/[^\w]/g, '');
      houseLabel.style.position = 'absolute';
      houseLabel.style.setProperty('left', '0', 'important');
      houseLabel.style.setProperty('top', '0', 'important');
      houseLabel.style.width = 'max-content';
      houseLabel.style.marginLeft = '0';
      houseLabel.style.paddingLeft = '0';
      houseLabel.style.zIndex = '1';
      houseLabel.style.fontSize = '0.85em';
      houseLabel.style.background = '#222';
      houseLabel.style.color = '#fff';
      houseLabel.style.padding = '2px 4px';
      houseLabel.style.borderRadius = '6px';
      houseLabel.style.fontWeight = 'bold';
      houseLabel.style.display = 'inline-block';
      houseLabel.style.marginBottom = '2px';
      houseSection.appendChild(houseLabel);
	
      // Add bar per resident
      // Sort residents so that those with the same rowOffset are rendered in chronological order (latest last)
      const sortedResidents = [...residents].sort((a, b) => {
        if (a.rowOffset !== b.rowOffset) return a.rowOffset - b.rowOffset;
        return a.startYear - b.startYear; // render latest last
      });
      sortedResidents.forEach(entry => {
        const row = document.createElement('div');
        row.classList.add('timeline-row');
        row.style.position = 'absolute'; // Position absolutely within the house section
        row.style.height = '18px';
        row.style.width = '100%';
        row.style.top = `${entry.rowOffset * 18 + 24}px`; // Offset by 24px to account for label height
        row.style.left = '0';
        // Ensure earlier bars are on top
        row.style.zIndex = (entry.rowOffset + 1).toString();

        const bar = document.createElement('div');
        bar.classList.add('timeline-bar');

        const pos = calculatePosition(entry.startYear, entry.endYear);
        bar.style.left = `${pos.left}%`;
        // Ensure a minimum width for visibility and tooltip interaction
        const minWidthPx = 16;
        const containerWidth = timelineContainer.offsetWidth || 800; // fallback if not rendered yet
        const minWidthPercent = (minWidthPx / containerWidth) * 100;
        bar.style.width = `${Math.max(pos.width, minWidthPercent)}%`;
        bar.style.backgroundColor = getColorForNotes(entry.notes);

        // Tooltip interactions
        bar.addEventListener('mouseenter', () => {
          showTooltip(`<strong>${entry.name}</strong><br>${entry.startYear}–${entry.endYear}<br>${entry.notes || ''}`);
        });
        bar.addEventListener('mouseleave', hideTooltip);

        // Modal interaction on click
        bar.addEventListener('click', (e) => {
          e.stopPropagation();
          // Find street and house for this resident
          let streetName = '';
          let houseName = house;
          let parent = houseSection.parentElement;
          while (parent && !streetName) {
            const heading = parent.querySelector('div[style*="font-weight: bold"][style*="font-size: 1.1em"]');
            if (heading) streetName = heading.textContent;
            parent = parent.parentElement;
          }
          // Populate Materialize modal
          const modalTitle = document.getElementById('residentModalTitle');
          const modalContent = document.getElementById('residentModalContent');
          if (modalTitle) modalTitle.textContent = entry.name;
          if (modalContent) {
            modalContent.innerHTML = `
              <div><strong>Years:</strong> ${entry.startYear}–${entry.endYear}</div>
              <div><strong>House:</strong> ${houseName || '<em>Unknown</em>'}</div>
              <div><strong>Street:</strong> ${streetName || '<em>Unknown</em>'}</div>
              <div><strong>Notes:</strong><br>${entry.notes || '<em>No notes</em>'}</div>
            `;
          }
          const modalElem = document.getElementById('residentModal');
          if (modalElem && window.M && M.Modal.getInstance(modalElem)) {
            M.Modal.getInstance(modalElem).open();
          }
        });

        const nameLabel = document.createElement('span');
        nameLabel.textContent = `${entry.name}`;
        nameLabel.style.fontSize = '0.75em';
        nameLabel.style.fontWeight = '500';
        nameLabel.style.whiteSpace = 'nowrap';
        nameLabel.style.overflow = 'hidden';
        nameLabel.style.textOverflow = 'ellipsis';
        nameLabel.style.color = '#fff';
        nameLabel.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
        
        // Adjust text color for lighter backgrounds
        if (bar.style.backgroundColor === '#FFE66D') {
          nameLabel.style.color = '#333';
          nameLabel.style.textShadow = 'none';
        }

        bar.appendChild(nameLabel);
        row.appendChild(bar);
        houseSection.appendChild(row);
      });

      body.appendChild(houseSection);
      li.appendChild(body);
      collapsible.appendChild(li);
    });

    timelineContainer.appendChild(collapsible);
    // Initialize Materialize collapsible
    if (window.M && M.Collapsible) {
      M.Collapsible.init(collapsible);
    }
  });

  // Remove left padding and margin from timeline container and parent container
  if (timelineContainer) {
    timelineContainer.style.paddingLeft = '24px';
    timelineContainer.style.marginLeft = '0';
    if (timelineContainer.parentElement) {
      timelineContainer.parentElement.style.paddingLeft = '0';
      timelineContainer.parentElement.style.marginLeft = '0';
    }
  }
}

// Add Materialize modal initialization at the end of the file
// Initialize Materialize modal
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  if (window.M && M.Modal) {
    M.Modal.init(elems);
  }
});
