// Tooltip element reference
const tooltip = document.getElementById('tooltip');  // Reference to styled tooltip div

// 🎯 MOUSE TRACKING: Tooltip follows the mouse when visible
document.addEventListener('mousemove', (e) => {
  tooltip.style.left = e.pageX + 10 + 'px';
  tooltip.style.top = e.pageY + 10 + 'px';
});

// 💬 TOOLTIP HELPERS
function showTooltip(content) {
  tooltip.innerHTML = content;
  tooltip.style.display = 'block';
}

function hideTooltip() {
  tooltip.style.display = 'none';
}