// Gas Fee Calculator
async function calculateFee(gasLimit, speed = 'average') {
  const prices = await fetchGasPrices();
  const gasPrice = parseFloat(prices[speed]);
  const feeInGwei = gasLimit * gasPrice;
  const feeInEth = feeInGwei / 1e9;
  const ethPrice = await getEthUsdPrice();
  const feeInUsd = feeInEth * ethPrice;

  return {
    gwei: feeInGwei.toFixed(2),
    eth: feeInEth.toFixed(8),
    usd: feeInUsd.toFixed(4)
  };
}

async function getEthUsdPrice() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const data = await res.json();
    return data.ethereum.usd;
  } catch {
    return 3000;
  }
}

const GAS_LIMITS = {
  transfer: 21000,
  erc20: 65000,
  swap: 150000,
  nft_mint: 200000,
  contract_deploy: 500000
};

async function renderCalculator() {
  const container = document.querySelector('#calculator');
  if (!container) return;

  const results = await Promise.all(
    Object.entries(GAS_LIMITS).map(async ([action, limit]) => {
      const fee = await calculateFee(limit);
      return { action, limit, fee };
    })
  );

  container.innerHTML = `
    <div style="max-width:600px;margin:24px auto;padding:0 24px">
      <h3 style="margin-bottom:16px">⛽ Fee Calculator</h3>
      ${results.map(r => `
        <div class="history-item">
          <span style="text-transform:capitalize">
            ${r.action.replace('_', ' ')}
          </span>
          <span>${r.limit.toLocaleString()} gas</span>
          <span style="color:#0052ff">$${r.fee.usd}</span>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', renderCalculator);