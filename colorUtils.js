// 🎨 DETERMINE COLOR FOR A RESIDENT BASED ON NOTES FIELD
function getColorForNotes(notes) {
  const text = (notes || '').toLowerCase();

  if (text.includes('owner')) return '#69b3a2';           // sage green
  if (text.includes('tenant')) return '#5B9BD5';          // blue
  if (text.includes('widow') || text.includes('widower')) return '#FF6B6B'; // coral/salmon
  if (text.includes('labourer') || text.includes('laborer')) return '#4ECDC4'; // teal
  if (
    text.includes('shopkeeper') ||
    text.includes('shop keeper') ||
    text.includes('store') ||
    text.includes('grocer') ||
    text.includes('ran a shop')
  ) return '#FFE66D'; // soft yellow

  return '#69b3a2'; // fallback/default color (sage green)
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
