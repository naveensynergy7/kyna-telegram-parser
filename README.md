# Kyna Telegram Parser

A Chrome extension that automatically monitors Telegram Web groups, extracts messages with user profile information, and sends them to the Kyna API for parsing.

## 🎯 Features

- ✅ **Real-time Message Detection** - Automatically detects new messages in Telegram groups
- ✅ **Profile URL Extraction** - Clicks on user avatars to extract profile links
- ✅ **Smart Filtering** - Only processes messages from users with usernames (@)
- ✅ **Multi-Tab Support** - Works across multiple Telegram tabs and groups simultaneously
- ✅ **Duplicate Prevention** - Tracks processed messages per chat to avoid reprocessing
- ✅ **Automatic API Integration** - Sends data directly to Kyna parser API
- ✅ **Persistent Storage** - Remembers processed messages across browser restarts

## 📋 Prerequisites

- Google Chrome browser
- Access to [https://web.telegram.org](https://web.telegram.org)
- Valid Kyna API endpoint

## 🚀 Installation

### Step 1: Load Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"** button
4. Select the extension folder: `/Users/naveen/Downloads/ext`
5. The extension should now appear in your extensions list

### Step 2: Verify Installation

You should see "Kyna Telegram Parser" in your extensions list with a green "Enabled" status.

## 📖 How It Works

### Automatic Message Processing Flow

1. **Detection** 
   - Extension monitors for elements with class `bubbles-group-last`
   - Detects new messages in real-time using MutationObserver

2. **Profile Extraction**
   - Clicks on user avatar
   - Waits 2 seconds for profile to fully load
   - Captures profile URL from browser address bar

3. **Username Validation**
   - Checks if profile URL contains "@" (username)
   - If no username → Skips API call
   - If has username → Proceeds to send data

4. **Data Transmission**
   - Sends message and profile URL to background script
   - Background script makes POST request to Kyna API
   - Logs success/failure in console

5. **Cleanup**
   - Closes profile sidebar
   - Returns to chat view
   - Marks message as processed

### API Payload Format

```json
{
  "message": "Football match tomorrow 5pm at Central Park, 5v5, free entry, need 2 players",
  "platform": "telegram",
  "contactUrl": "https://web.telegram.org/#@john_doe"
}
```

### Equivalent cURL Command

```bash
curl -X POST https://parser.kyna.one/parse \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Football match tomorrow 5pm...",
    "platform": "telegram",
    "contactUrl": "https://web.telegram.org/#@john_doe"
  }'
```

## 🔧 Usage

### Basic Usage

1. **Open Telegram Web**
   - Navigate to [https://web.telegram.org](https://web.telegram.org)
   - Log in to your account

2. **Join/Open a Group**
   - Open any group or chat you want to monitor

3. **Monitor Console (Optional)**
   - Press `F12` (Windows/Linux) or `Cmd+Option+J` (Mac)
   - Watch the console for activity logs

4. **Wait for Messages**
   - Extension automatically processes new messages
   - No manual intervention required!

### Console Output Examples

**Successful Processing:**
```
🚀 Telegram Message Logger: Active
✅ Loaded last messages for 3 chats
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 NEW MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Sender: John Doe
🔗 Profile URL: https://web.telegram.org/#@john_doe
🕐 Time: 24 October 2025, 14:30:00
💬 Message: Football match tomorrow 5pm...
🆔 Message ID: 4294995596
⏱️ Timestamp: 1760538656
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Sending to API...
✅ Successfully sent to API
```

**Skipped (No Username):**
```
🔍 Clicking avatar to get profile URL...
⏳ Waiting 2 seconds for profile to load...
✅ Profile URL captured: https://web.telegram.org/#791008022
🔙 Closing sidebar...
📤 Sending to API...
⏭️ Skipping API call - No username (@) in profile URL
⏭️ Skipped - No username in profile URL
```

## 🎮 Advanced Features

### Reset History

If you want to reprocess messages (clear the memory of processed messages):

1. Open Console (`F12`)
2. Type: `clearTelegramHistory()`
3. Press Enter
4. All processed message IDs will be cleared

### Multi-Tab Support

The extension works across multiple tabs:
- Each group/chat tracks its own messages independently
- You can monitor different groups in different tabs
- No interference between tabs

### Persistent Storage

- Processed message IDs are stored in Chrome storage
- Survives browser restarts
- Prevents duplicate processing after reload

## 📁 File Structure

```
ext/
├── manifest.json       # Extension configuration and permissions
├── content.js          # Main script - monitors Telegram, extracts data
├── background.js       # Service worker - handles API calls
└── README.md           # This file
```

## 🔐 Permissions Explained

| Permission | Purpose |
|------------|---------|
| `storage` | Store processed message IDs to prevent duplicates |
| `https://parser.kyna.one/*` | Send extracted data to Kyna API |
| `https://web.telegram.org/*` | Access and monitor Telegram Web pages |

## 🐛 Troubleshooting

### Extension Not Detecting Messages

**Problem:** Messages appear but aren't being processed

**Solutions:**
1. Refresh the Telegram Web page
2. Check if extension is enabled in `chrome://extensions/`
3. Open console (`F12`) and look for errors
4. Try reloading the extension

### Profile URL Not Captured

**Problem:** Profile URL shows as "N/A"

**Solutions:**
1. Extension waits 2 seconds - ensure good internet connection
2. Some users may have restricted profiles
3. Check console for error messages

### API Calls Failing

**Problem:** Console shows "❌ API call failed"

**Solutions:**
1. Check if `https://parser.kyna.one/parse` is accessible
2. Verify API endpoint is correct in `background.js`
3. Check network tab in DevTools for detailed error
4. Ensure API is accepting requests from your origin

### Messages Reprocessed After Reload

**Problem:** Same messages logged again after page refresh

**Solutions:**
1. Check if storage permission is granted
2. Open `chrome://extensions/` → Click "Details" → Ensure "Storage" is allowed
3. Try `clearTelegramHistory()` then reload to start fresh

### Multiple Tabs Interference

**Problem:** Messages from one group affecting another

**Solutions:**
- This should not happen as each chat has its own tracking
- If it does, clear history: `clearTelegramHistory()`
- Check console for the chat IDs being tracked

## 🔒 Privacy & Security

- **Local Processing**: Message extraction happens locally in your browser
- **No Data Storage**: Extension only stores message IDs, not content
- **Direct API**: Data sent directly from your browser to Kyna API
- **No Third Parties**: No intermediate servers or tracking
- **Open Source**: All code is visible and auditable

## 🛠️ Development

### Modify API Endpoint

Edit `background.js`:
```javascript
const API_URL = 'https://your-api.com/endpoint';
```

### Adjust Wait Time for Profile Loading

Edit `content.js` (line ~108):
```javascript
await new Promise(resolve => setTimeout(resolve, 2000)); // Change 2000 to desired ms
```

### Change Detection Interval

Edit `content.js` (line ~252):
```javascript
setInterval(checkForNewMessages, 1000); // Change 1000 to desired ms
```

### Debug Mode

Add this to `content.js` for verbose logging:
```javascript
const DEBUG = true;
if (DEBUG) console.log('Debug info:', ...);
```

## 📝 API Response Handling

The extension logs API responses in the console. Check `background.js` to modify response handling:

```javascript
if (response.ok) {
  const result = await response.json();
  console.log('✅ API Response:', result);
  // Add your custom handling here
}
```

## 🔄 Update & Maintenance

### Updating the Extension

1. Make changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Changes take effect immediately

### Version Management

Update version in `manifest.json`:
```json
{
  "version": "1.0.1"
}
```

## ⚠️ Known Limitations

1. **Only Telegram Web**: Does not work with desktop or mobile Telegram apps
2. **Active Tab Required**: Tab must be open (can be in background)
3. **Username Required**: Only processes users with @username (skips numeric IDs)
4. **Rate Limiting**: If Telegram detects too many profile views, may temporarily block
5. **DOM Dependent**: May break if Telegram changes their HTML structure

## 🚦 Best Practices

1. **Monitor One Group at a Time**: For better reliability
2. **Don't Refresh Too Often**: Let the extension work naturally
3. **Check Console Regularly**: Monitor for errors or issues
4. **Clear History Periodically**: If you want to reprocess old messages
5. **Keep Tab Open**: Extension only works when Telegram Web is open

## 🆘 Support

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review console logs for error messages
3. Verify all files are present and unmodified
4. Test with a simple message to isolate the issue
5. Ensure Chrome is up to date

## 📜 License

MIT License - Free to use and modify

## 🎉 Credits

Built for Kyna - Automatic sports activity parsing from Telegram groups

---

**Version:** 1.0.0  
**Last Updated:** October 24, 2025  
**Status:** Production Ready ✅
