// Gas Price Fetcher
async function fetchGasPrices() {
  try {
    const response = await fetch(
      'https://api.basescan.org/api?module=gastracker&action=gasoracle'
    );
    const data = await response.json();
    return {
      slow: data.result.SafeGasPrice,
      average: data.result.ProposeGasPrice,
      fast: data.result.FastGasPrice
    };
  } catch {
    return { slow: '0.001', average: '0.002', fast: '0.005' };
  }
}

async function updateGasUI() {
  const prices = await fetchGasPrices();

  document.getElementById('slow').textContent = prices.slow;
  document.getElementById('average').textContent = prices.average;
  document.getElementById('fast').textContent = prices.fast;

  const now = new Date().toLocaleTimeString();
  const el = document.getElementById('last-update');
  if (el) el.textContent = `Updated: ${now}`;

  saveGasHistory(prices);
}

function saveGasHistory(prices) {
  let history = JSON.parse(localStorage.getItem('gas_history') || '[]');
  history.unshift({ ...prices, time: new Date().toISOString() });
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem('gas_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const container = document.querySelector('.history-list');
  if (!container) return;
  const history = JSON.parse(localStorage.getItem('gas_history') || '[]');
  container.innerHTML = history.slice(0, 5).map(h => `
    <div class="history-item">
      <span>${new Date(h.time).toLocaleTimeString()}</span>
      <span>🐢 ${h.slow}</span>
      <span>🚗 ${h.average}</span>
      <span>🚀 ${h.fast}</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  updateGasUI();
  setInterval(updateGasUI, 15000);
});