chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getPHPrice') {
      fetch(msg.url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          const tokenKey = msg.address.toLowerCase();
          const tokenObj = data[tokenKey] || 
                          data.data?.[tokenKey] || 
                          data.prices?.[tokenKey] ||
                          data.result?.[tokenKey];
          // Validación robusta del precio
          function validatePrice(tokenObj) {
            if (!tokenObj || typeof tokenObj.usd !== 'number') return null;
            if (tokenObj.usd < 0 || tokenObj.usd > 999999) return null;
            if (isNaN(tokenObj.usd)) return null;
            return tokenObj.usd;
          }

          const validPrice = validatePrice(tokenObj);
          if (validPrice === null) {
            sendResponse({ error: 'Invalid price data', price: 0 });
          } else {
            sendResponse({ price: validPrice });
          }
        })
        .catch(err => {
          sendResponse({ error: err.message });
        });
      return true; // respuesta asíncrona
    }
  });