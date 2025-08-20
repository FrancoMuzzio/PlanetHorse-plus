chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getPHPrice') {
    // Configure 10-second timeout for request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout

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
        // Differentiate timeout error vs other errors
        if (err.name === 'AbortError') {
          sendResponse({ error: 'Request timeout: API took too long to respond' });
        } else {
          sendResponse({ error: err.message });
        }
      });
    return true; // async response
  }
});