// Request price via background
async function fetchTokenPrice(currency) {
  return new Promise((resolve, reject) => {
    // Configurar timeout del lado del cliente (15 segundos)
    const clientTimeoutId = setTimeout(() => {
      reject(new Error('Client timeout: No se recibió respuesta del service worker'));
    }, 15000); // 15 segundos (más que el timeout del fetch para dar margen)

    chrome.runtime.sendMessage(
      {
        action: 'getPHPrice',
        url: `${CONFIG.API_BASE_URL}${CONFIG.TOKEN_ADDRESS}`
      },
      (response) => {
        clearTimeout(clientTimeoutId);
        
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
