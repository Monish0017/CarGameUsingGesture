# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Step 1: Install Dependencies ✅
```bash
npm install
```
**Status**: ✅ Already completed!

### Step 2: Start the Game 🎮
```bash
npm run dev
```
**Status**: ✅ Server running at http://localhost:3000

### Step 3: Open in Browser 🌐
Open your browser and navigate to:
```
http://localhost:3000
```

You'll see the game menu with:
- 🏎️ Stylish racing game interface
- 📊 Score display
- 🔗 Connection status indicator

### Step 4: Test with Keyboard ⌨️
Even without ESP8266, you can play using:
- **Arrow Left (←)**: Move car left
- **Arrow Right (→)**: Move car right

### Step 5: Connect ESP8266 (Optional) 🎛️

#### Hardware Setup:
1. **Wire MPU6050 to ESP8266**:
   ```
   MPU6050 → ESP8266
   VCC → 3.3V
   GND → GND
   SDA → D2
   SCL → D1
   ```

2. **Program ESP8266**:
   - Open `arduino/ESP8266_CarController/ESP8266_CarController.ino`
   - Update WiFi credentials:
     ```cpp
     const char* ssid = "YOUR_WIFI_SSID";
     const char* password = "YOUR_WIFI_PASSWORD";
     ```
   - Upload to ESP8266 (see `arduino/SETUP_GUIDE.md`)

3. **Verify Connection**:
   - Check Serial Monitor (115200 baud)
   - Should see: "✅ Connected to HiveMQ Cloud"
   - Game UI should show: "🟢 Connected to ESP8266"

4. **Play with Gestures**:
   - Hold ESP8266 like a game controller
   - Tilt left → Car moves left
   - Tilt right → Car moves right

## 🎯 Game Controls

### With ESP8266 (Gesture Mode):
- **Tilt Left**: Move car to left lane
- **Tilt Right**: Move car to right lane
- **Keep Steady**: Stay in current lane

### With Keyboard (Testing Mode):
- **← Left Arrow**: Move car left
- **→ Right Arrow**: Move car right

## 🎮 How to Play

1. Click **"Start Game"** button
2. **Avoid obstacles**:
   - 🚧 Orange cones
   - 🛢️ Red barrels
   - 🪨 Gray rocks
3. **Score points**: +10 for each obstacle passed
4. **Beat high score**: Your best score is saved!

## 📱 UI Features

### Main Menu:
- ✨ Animated neon title
- 🎯 Game instructions
- 🏆 High score display
- 🔗 Connection status

### Playing:
- 🏎️ Animated racing car
- 🛣️ Moving road lines
- 🎯 Dynamic obstacles
- 📊 Live score counter
- 🔗 Connection indicator

### Game Over:
- 💥 Crash animation
- 📊 Final score
- 🏆 New high score celebration
- 🔄 Play again / Menu options

## 🔧 Configuration

### Adjust Game Difficulty:
Edit `src/components/GameBoard.jsx`:
```jsx
// Obstacle spawn rate (line ~44)
}, 1500);  // Lower = harder (more obstacles)

// Obstacle speed (line ~56)
position: obs.position + 2,  // Higher = faster
```

### Adjust Gesture Sensitivity:
Edit `arduino/ESP8266_CarController/ESP8266_CarController.ino`:
```cpp
const float X_THRESHOLD = 2.5;  // Lower = more sensitive
```

## 📊 Tech Stack Overview

```
┌─────────────────────────────────────────────┐
│           Browser Game (React)              │
│  React + Tailwind + MQTT.js + Canvas        │
└────────────────┬────────────────────────────┘
                 │
                 │ WebSocket Secure (WSS)
                 ↓
┌─────────────────────────────────────────────┐
│         HiveMQ Cloud (MQTT Broker)          │
│       TLS Encrypted, Port 8884              │
└────────────────┬────────────────────────────┘
                 │
                 │ MQTT over TLS
                 ↓
┌─────────────────────────────────────────────┐
│      ESP8266 + MPU6050 Controller          │
│    WiFi → MQTT Client → Gesture Sensor     │
└─────────────────────────────────────────────┘
```

## ⚡ Quick Troubleshooting

### Game won't start?
- Check if server is running: `npm run dev`
- Open http://localhost:3000 in browser
- Check browser console (F12) for errors

### ESP8266 not connecting?
- Verify WiFi credentials (2.4GHz only)
- Check Serial Monitor for error messages
- See `arduino/SETUP_GUIDE.md`

### Car not responding to gestures?
- Check connection status in game UI
- Verify ESP8266 is publishing (Serial Monitor)
- Tilt more dramatically (increase angle)

### Game too hard/easy?
- Adjust `X_THRESHOLD` for gesture sensitivity
- Adjust obstacle spawn rate in GameBoard.jsx

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Arduino Setup**: See `arduino/SETUP_GUIDE.md`
- **Troubleshooting**: See README.md → Troubleshooting section

## 🎉 You're Ready!

Your gesture-controlled racing game is now running!

**Current Status:**
- ✅ Frontend running at http://localhost:3000
- ✅ MQTT credentials configured
- ✅ Keyboard controls working
- ⏳ ESP8266 setup pending (optional)

**Next Steps:**
1. Open http://localhost:3000 in browser
2. Click "Start Game" and play with keyboard
3. (Optional) Setup ESP8266 for gesture control

---

**Have fun racing! 🏁🏎️💨**
