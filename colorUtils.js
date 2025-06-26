// 🎨 DETERMINE COLOR FOR A RESIDENT BASED ON NOTES FIELD
function getColorForNotes(notes) {
  const text = (notes || '').toLowerCase();
  let role = 'Other / Default';
  if (text.includes('owner')) role = 'Owner';
  else if (text.includes('tenant')) role = 'Tenant';
  else if (text.includes('widow') || text.includes('widower')) role = 'Widow/Widower';
  else if (text.includes('labourer') || text.includes('laborer')) role = 'Labourer';
  else if (
    text.includes('shopkeeper') ||
    text.includes('shop keeper') ||
    text.includes('store') ||
    text.includes('grocer') ||
    text.includes('ran a shop')
  ) role = 'Shopkeeper / Grocer / Store';

  // Check for custom color
  const customColor = localStorage.getItem(`legendColor_${role}`);
  if (customColor) return customColor;

  // Default colors
  switch (role) {
    case 'Owner': return '#388e6c';
    case 'Tenant': return '#2366a8';
    case 'Widow/Widower': return '#c0392b';
    case 'Labourer': return '#009688';
    case 'Shopkeeper / Grocer / Store': return '#FFE66D';
    default: return '#388e6c';
  }
}

// 🗂️ DISPLAY COLOR LEGEND AT TOP OF PAGE
function renderLegend() {
  const legendData = [
    { label: 'Owner', color: '#388e6c' },
    { label: 'Tenant', color: '#2366a8' },
    { label: 'Widow/Widower', color: '#c0392b' },
    { label: 'Labourer', color: '#009688' },
    { label: 'Shopkeeper / Grocer / Store', color: '#FFE66D' },
    { label: 'Other / Default', color: '#388e6c' }
  ];

  const legend = document.getElementById('legend');
  legend.innerHTML = '';

  legendData.forEach(item => {
    // Use custom color if set
    const customColor = localStorage.getItem(`legendColor_${item.label}`) || item.color;
    const chip = document.createElement('div');
    chip.className = 'chip light-green darken-1 white-text';
    chip.style.marginRight = '8px';
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';

    // Color picker input
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = customColor;
    colorInput.title = `Pick color for ${item.label}`;
    colorInput.style.display = 'none'; // Hide by default
    colorInput.addEventListener('input', (e) => {
      localStorage.setItem(`legendColor_${item.label}`, e.target.value);
      updateAllRoleColors();
    });
    chip.appendChild(colorInput);

    // Color swatch
    const swatch = document.createElement('span');
    swatch.className = 'legend-color';
    swatch.style.background = customColor;
    swatch.style.marginRight = '8px';
    swatch.style.border = '1px solid #fff';
    swatch.style.cursor = 'pointer';
    swatch.title = `Pick color for ${item.label}`;
    swatch.addEventListener('click', () => colorInput.click());
    chip.appendChild(swatch);

    // Label
    const label = document.createElement('span');
    label.textContent = item.label;
    chip.appendChild(label);

    legend.appendChild(chip);
  });
}

// Update all timeline bars and legend chips with new colors
function updateAllRoleColors() {
  // Update legend
  renderLegend();
  // Update timeline bars
  document.querySelectorAll('.timeline-bar').forEach(bar => {
    const notes = bar.getAttribute('data-notes');
    if (notes !== null) {
      bar.style.backgroundColor = getColorForNotes(notes);
      // Adjust text color for yellow backgrounds
      const nameLabel = bar.querySelector('span');
      if (bar.style.backgroundColor === 'rgb(255, 230, 109)' || bar.style.backgroundColor === '#FFE66D') {
        if (nameLabel) {
          nameLabel.style.color = '#333';
          nameLabel.style.textShadow = 'none';
        }
      } else {
        if (nameLabel) {
          nameLabel.style.color = '#fff';
          nameLabel.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
        }
      }
    }
  });
}
