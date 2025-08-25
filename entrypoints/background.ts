// ============= WXT BACKGROUND SCRIPT =============
// Service worker para manejar llamadas de API desde content scripts
// Migrado desde background.js sin cambios en la funcionalidad

import { defineBackground } from '#imports';
interface ChromeMessage {
  action: string;
  url: string;
  timeout?: number;
}

interface ChromeResponse {
  data?: any;
  error?: string;
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((
    msg: ChromeMessage, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response: ChromeResponse) => void
  ): boolean => {
    if (msg.action === 'getPHPrice') {
      // Configure timeout for request 
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, msg.timeout || 10000);

      fetch(msg.url, { signal: controller.signal })
        .then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data: any) => {
          sendResponse({ data });
        })
        .catch((err: Error) => {
          clearTimeout(timeoutId);
          sendResponse({ error: 'Connection failed' });
        });
      return true; // async response
    }
    return false;
  });
});