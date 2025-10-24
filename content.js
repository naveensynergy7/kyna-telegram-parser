// Simple Telegram Message Logger with Profile URL Extraction
console.log('🚀 Telegram Message Logger: Active');

// Track last processed message ID per group/chat
let lastMessagePerChat = {};
let isProcessing = false;

// Load last message IDs from storage
chrome.storage.local.get(['lastMessagePerChat'], (result) => {
  if (result.lastMessagePerChat) {
    lastMessagePerChat = result.lastMessagePerChat;
    console.log(`✅ Loaded last messages for ${Object.keys(lastMessagePerChat).length} chats`);
  }
});

// Save last message ID for a specific chat
function saveLastMessageId(chatId, messageId) {
  lastMessagePerChat[chatId] = messageId;
  chrome.storage.local.set({ lastMessagePerChat: lastMessagePerChat });
}

// Get last message ID for a specific chat
function getLastMessageId(chatId) {
  return lastMessagePerChat[chatId] || null;
}

// Clear last message IDs (call this from console to reset)
window.clearTelegramHistory = function() {
  lastMessagePerChat = {};
  chrome.storage.local.remove('lastMessagePerChat');
  console.log('✅ Cleared all chat history');
};

/**
 * Wait for URL to change to profile page
 */
function waitForProfileUrl(maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkUrl = setInterval(() => {
      const url = window.location.href;
      
      // Check if URL contains user ID (profile opened)
      if (url.includes('#') && !url.includes('?')) {
        clearInterval(checkUrl);
        resolve(url);
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(checkUrl);
        reject('Timeout waiting for profile URL');
      }
    }, 100); // Check every 100ms
  });
}

/**
 * Wait for element to appear in DOM
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject('Timeout waiting for element: ' + selector);
    }, timeout);
  });
}

/**
 * Extract profile URL by clicking avatar
 */
async function extractProfileUrl(bubbleGroup) {
  try {
    // Find the user avatar
    const avatar = bubbleGroup.querySelector('.user-avatar, .bubbles-group-avatar');
    if (!avatar) {
      console.log('⚠️ No avatar found');
      return null;
    }
    
    console.log('🔍 Clicking avatar to get profile URL...');
    
    // Click the avatar
    avatar.click();
    
    // Wait 2 seconds for profile to fully load (including username)
    console.log('⏳ Waiting 2 seconds for profile to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the profile URL
    const profileUrl = window.location.href;
    console.log('✅ Profile URL captured:', profileUrl);
    
    // Find and click the close button
    const closeButton = await waitForElement('.btn-icon.sidebar-close-button', 2000);
    if (closeButton) {
      console.log('🔙 Closing sidebar...');
      closeButton.click();
      
      // Wait for sidebar to close
      await new Promise(resolve => setTimeout(resolve, 300));
    } else {
      console.log('⚠️ Close button not found');
    }
    
    return profileUrl;
    
  } catch (error) {
    console.error('❌ Error extracting profile URL:', error);
    
    // Try to close sidebar anyway if it's open
    try {
      const closeButton = document.querySelector('.btn-icon.sidebar-close-button');
      if (closeButton) closeButton.click();
    } catch (e) {}
    
    return null;
  }
}

/**
 * Extract and log message from bubble element
 */
async function logMessage(bubbleGroup) {
  if (isProcessing) return; // Prevent concurrent processing
  
  try {
    const bubble = bubbleGroup.querySelector('.bubble:not(.service)');
    if (!bubble) return;

    const messageId = bubble.getAttribute('data-mid');
    const chatId = bubble.getAttribute('data-peer-id'); // Group/chat ID
    
    // Skip if this is the last processed message or older for this specific chat
    const lastMsgId = getLastMessageId(chatId);
    if (messageId && lastMsgId && messageId <= lastMsgId) return;
    
    // Mark as processing
    isProcessing = true;

    // Extract message data
    const sender = bubble.querySelector('.peer-title')?.textContent.trim() || 'Unknown';
    const message = bubble.querySelector('.translatable-message')?.textContent.trim() || '';
    const timestamp = bubble.getAttribute('data-timestamp');
    const timeDisplay = bubble.querySelector('.time-inner')?.getAttribute('title') || '';

    // Get profile URL by clicking avatar
    const profileUrl = await extractProfileUrl(bubbleGroup);

    // Log to console
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 NEW MESSAGE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Sender:', sender);
    console.log('🔗 Profile URL:', profileUrl || 'N/A');
    console.log('🕐 Time:', timeDisplay);
    console.log('💬 Message:', message);
    console.log('🆔 Message ID:', messageId);
    console.log('⏱️ Timestamp:', timestamp);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Also log as object for easy inspection
    const messageData = {
      sender,
      profileUrl,
      message,
      messageId,
      chatId,
      timestamp,
      timeDisplay,
      extractedAt: new Date().toISOString()
    };
    
    console.log('📦 Message Object:', messageData);
    
    // Save this as the last processed message for this chat
    if (messageId && chatId) {
      saveLastMessageId(chatId, messageId);
    }
    
    // Send to background script for API call
    console.log('📤 Sending to API...');
    chrome.runtime.sendMessage({
      type: 'NEW_MESSAGE',
      data: messageData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Error sending to background:', chrome.runtime.lastError);
      } else if (response) {
        if (response.success) {
          console.log('✅ Successfully sent to API');
        } else if (response.skipped) {
          console.log('⏭️ Skipped - No username in profile URL');
        } else {
          console.error('❌ API call failed:', response.error);
        }
      }
    });
    
    isProcessing = false;
    
  } catch (error) {
    console.error('❌ Error extracting message:', error);
    isProcessing = false;
  }
}

/**
 * Check for messages with bubbles-group-last class
 */
function checkForNewMessages() {
  const lastBubbleGroups = document.querySelectorAll('.bubbles-group.bubbles-group-last');
  lastBubbleGroups.forEach(logMessage);
}

// Initial check
setTimeout(checkForNewMessages, 2000);

// Watch for new messages using MutationObserver
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if added node has the target class
          if (node.classList?.contains('bubbles-group-last') ||
              node.querySelector?.('.bubbles-group-last')) {
            checkForNewMessages();
          }
        }
      });
    } else if (mutation.type === 'attributes' && 
               mutation.attributeName === 'class' &&
               mutation.target.classList?.contains('bubbles-group-last')) {
      checkForNewMessages();
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

console.log('✅ Monitoring started - Latest messages will be logged here');
