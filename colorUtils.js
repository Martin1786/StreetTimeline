// 🎨 DETERMINE COLOR FOR A RESIDENT BASED ON NOTES FIELD
function getColorForNotes(notes) {
  const text = (notes || '').toLowerCase();

  if (text.includes('owner')) return '#388e6c';           // darker sage green
  if (text.includes('tenant')) return '#2366a8';          // darker blue
  if (text.includes('widow') || text.includes('widower')) return '#c0392b'; // darker coral
  if (text.includes('labourer') || text.includes('laborer')) return '#009688'; // darker teal
  if (
    text.includes('shopkeeper') ||
    text.includes('shop keeper') ||
    text.includes('store') ||
    text.includes('grocer') ||
    text.includes('ran a shop')
  ) return '#FFE66D'; // soft yellow

  return '#388e6c'; // fallback/default color (darker sage green)
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
    const chip = document.createElement('div');
    chip.className = 'chip light-green darken-1 white-text';
    chip.style.marginRight = '8px';
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border-radius:3px;background:${item.color};margin-right:8px;border:1px solid #fff;"></span>${item.label}`;
    legend.appendChild(chip);
  });
}
