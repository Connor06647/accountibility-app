# Idle Session Timeout Configuration

## ✅ **Implementation Complete**

The app now has **platform-specific session management** to improve security and user experience.

## 🔧 **Current Settings**

### Website Users (Browser)
- **Idle Timeout**: **2 hours** of inactivity
- **Warning**: Shows console message 10 minutes before logout
- **Auto-Logout**: Automatic sign-out after timeout
- **Activity Tracking**: Mouse, keyboard, touch, scroll events

### PWA Users (Installed App)
- **Idle Timeout**: **7 days** (much longer for convenience)
- **Persistent Session**: Better for daily use
- **Platform Detection**: Automatically detects PWA vs browser

## 🔐 **Security Benefits**

1. **Website Security**: Users get logged out from shared computers
2. **Convenience**: PWA users stay logged in longer
3. **Activity Tracking**: Real user activity is tracked, not just page refreshes
4. **Automatic**: No manual intervention needed

## 🧪 **Testing**

**To Test Idle Timeout:**
1. Open **http://localhost:3000** (browser = website mode)
2. Log in to your account
3. Wait 2 hours without any activity (mouse, keyboard, etc.)
4. User should be automatically logged out

**To Test PWA Mode:**
1. Install the app as PWA
2. Sessions persist for 7 days of inactivity

**To Test Different Platforms:**
- Browser tab = Website mode (2 hour timeout)
- Installed PWA = App mode (7 day timeout)

## 💡 **How It Works**

```javascript
// Website: 2 hours = 2 * 60 * 60 * 1000 ms
const WEBSITE_IDLE_TIMEOUT = 2 * 60 * 60 * 1000;

// PWA: 7 days = 7 * 24 * 60 * 60 * 1000 ms  
const PWA_IDLE_TIMEOUT = 7 * 24 * 60 * 60 * 1000;
```

**Activity Events Tracked:**
- `mousedown`, `mousemove` 
- `keypress`, `scroll`
- `touchstart`, `click`

**Platform Detection:**
- Uses `(display-mode: standalone)` media query
- Detects if running as installed PWA vs browser

This provides the perfect balance of **security** (website) and **convenience** (PWA)! 🎯
