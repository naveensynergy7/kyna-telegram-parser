# Telegram Message Logger - Simple Chrome Extension

A minimal Chrome extension that logs the latest Telegram messages to the browser console.

## What it does

- Monitors Telegram Web for messages with class `bubbles-group-last`
- Extracts message details (sender, content, timestamp)
- Logs everything to the browser console

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select this folder: `/Users/naveen/Downloads/ext`

## Usage

1. Go to [https://web.telegram.org](https://web.telegram.org)
2. Open any group/chat
3. Open **Developer Console** (Press `F12` or `Cmd+Option+J` on Mac)
4. New messages will automatically be logged to the console!

## Console Output

Each new message will show:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 NEW MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Sender: John Doe
🕐 Time: 15 October 2025, 20:00:56
💬 Message: Hello everyone!
🆔 Message ID: 4294995596
⏱️ Timestamp: 1760538656
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Message Object: { sender, message, messageId, ... }
```

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main script that monitors and logs messages
- `README.md` - This file

## No Permissions Required

This extension only needs access to `web.telegram.org` - no storage, no notifications, nothing else!

## Troubleshooting

**Not seeing messages?**
1. Make sure you're on `web.telegram.org`
2. Open the console (`F12`)
3. Refresh the page
4. You should see "✅ Monitoring started" message

**Still not working?**
- Check if the extension is enabled in `chrome://extensions/`
- Try reloading the extension

That's it! Simple and straightforward. 🚀

