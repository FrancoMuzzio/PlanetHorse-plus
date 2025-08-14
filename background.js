chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getPHPrice') {
    fetch(msg.url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        sendResponse({ data });
      })
      .catch(err => {
        sendResponse({ error: err.message });
      });
    return true; // async response
  }
});