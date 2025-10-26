// Background service worker - handles API calls
console.log('🚀 Telegram Logger Background: Active');

// API endpoint
const API_URL = 'https://parser.kyna.one/parse';

/**
 * Send message data to API
 */
async function sendToAPI(messageData) {
  try {
    // Check if profile URL contains @ (username)
    if (!messageData.profileUrl || !messageData.profileUrl.includes('@')) {
      console.log('⏭️ Skipping API call - No username (@) in profile URL');
      return { success: false, error: 'No username in profile URL', skipped: true };
    }
    
    console.log('📤 Sending to API:', messageData);
    
    const payload = {
      message: messageData.message,
      platform: "telegram",
      contactUrl: messageData.profileUrl || null
    };
    
    console.log('📦 API Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Response:', result);
      return { success: true, data: result };
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return { success: false, error: `${response.status}: ${response.statusText}` };
    }
    
  } catch (error) {
    console.error('❌ Failed to send to API:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Listen for messages from content script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'NEW_MESSAGE') {
    console.log('📨 Received message from content script');
    
    // Send to API
    sendToAPI(request.data)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

console.log('✅ Background service worker ready');

