// Request price via background
async function fetchTokenPrice(currency) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}`
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || response.error) {
          reject(new Error(response?.error || 'Unknown error'));
          return;
        }
        resolve(response.data.result[CONFIG.TOKEN_ADDRESS][currency]);
      }
    );
  });
}
