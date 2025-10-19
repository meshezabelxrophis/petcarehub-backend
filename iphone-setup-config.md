# 📱 iPhone GPS Tracking Setup - Complete Configuration

## Your Specific ngrok URL: 
**https://12e8c37f119f.ngrok-free.app**

---

## 🚀 WHAT YOU NEED TO DO MANUALLY (Only 3 steps!)

### 1. Start Your Development Server
```bash
cd "/Users/abdulwaseyhussain/Desktop/programming/FYP - Copy"
npm run dev
```

### 2. Download iPhone App
**Option A: OwnTracks (Recommended)**
- Open App Store on iPhone
- Search "OwnTracks" 
- Download the app (it's free)

**Option B: iOS Shortcuts (Built-in)**
- Use the built-in Shortcuts app
- Follow the configuration below

### 3. Configure the App (I'll give you exact settings)

---

## 📋 EXACT OWNTRACKS CONFIGURATION

Open OwnTracks app → Settings:

**Connection Tab:**
- Mode: **HTTP**
- URL: **https://12e8c37f119f.ngrok-free.app/api/update-pet-location**
- Method: **POST**
- Headers: Add this:
  ```
  Content-Type: application/json
  ngrok-skip-browser-warning: true
  ```

**Reporting Tab:**
- Move: **ON**
- Extended JSON: **ON**
- Publish Interval: **60 seconds** (adjust as needed)

**Device ID:** **1** (or any number you want for pet_id)

---

## 📱 iOS SHORTCUTS CONFIGURATION (Alternative)

If you prefer using iOS Shortcuts:

1. Open **Shortcuts** app
2. Tap **+** to create new shortcut
3. Add these actions in order:

**Action 1: Get Current Location**
- Search "Get Current Location"
- Add it

**Action 2: Get Contents of URL**
- Search "Get Contents of URL" 
- Configure:
  - URL: `https://12e8c37f119f.ngrok-free.app/api/update-pet-location`
  - Method: **POST**
  - Headers:
    ```
    Content-Type: application/json
    ngrok-skip-browser-warning: true
    ```
  - Request Body:
    ```json
    {
      "pet_id": 1,
      "latitude": [Latitude from Get Current Location],
      "longitude": [Longitude from Get Current Location]
    }
    ```

4. Name your shortcut "Send Pet Location"
5. Test it by running the shortcut

---

## 🧪 TESTING COMMANDS (I'll run these for you)

After you start your server, these will work:

```bash
# Test endpoint
curl -X POST https://12e8c37f119f.ngrok-free.app/api/update-pet-location \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"pet_id": 1, "latitude": 31.5204, "longitude": 74.3587}'

# Check if location updated
curl -H "ngrok-skip-browser-warning: true" https://12e8c37f119f.ngrok-free.app/api/pet-location
```

---

## 🔧 PERMISSIONS YOU'LL NEED TO GRANT

When you first use the app, iPhone will ask for:
- **Location Services**: Choose "Always" or "While Using App"
- **Network Access**: Allow

---

## 🎯 EXPECTED BEHAVIOR

1. **iPhone app sends location** → Your ngrok URL → Your local server
2. **Map updates every 5 seconds** with new location
3. **Real-time tracking** on your web application

---

## 🆘 TROUBLESHOOTING

**If location doesn't update:**
1. Check iPhone location permissions
2. Ensure your dev server is running (`npm run dev`)
3. Test with curl commands first
4. Check iPhone is connected to internet

**If you get "tunnel not found":**
- Restart ngrok: `ngrok http 3000`



