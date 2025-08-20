chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getPHPrice') {
    // Configure timeout for request using value from config
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, msg.timeout || 10000); // Use provided timeout or fallback to 10 seconds

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