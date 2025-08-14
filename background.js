chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getPHPrice') {
    // Configurar timeout de 10 segundos para la solicitud
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 segundos de timeout

    fetch(msg.url, { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        sendResponse({ data });
      })
      .catch(err => {
        clearTimeout(timeoutId);
        // Diferenciar error de timeout vs otros errores
        if (err.name === 'AbortError') {
          sendResponse({ error: 'Request timeout: La API tardó demasiado en responder' });
        } else {
          sendResponse({ error: err.message });
        }
      });
    return true; // async response
  }
});