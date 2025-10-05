# 🏎️ Gesture-Controlled Car Racing Game

An interactive IoT racing game controlled by hand gestures using ESP8266, MPU6050 accelerometer, and real-time MQTT communication through HiveMQ Cloud.

![Project Banner](https://img.shields.io/badge/IoT-Racing_Game-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![MQTT](https://img.shields.io/badge/MQTT-HiveMQ-purple?style=for-the-badge)
![ESP8266](https://img.shields.io/badge/ESP8266-IoT-red?style=for-the-badge)

## 🎯 Project Overview

Control a racing car in real-time by tilting an ESP8266+MPU6050 controller. The game features:

- **Gesture Control**: Tilt left/right to move the car
- **Real-Time Communication**: MQTT over TLS via HiveMQ Cloud
- **Modern UI**: Built with React and Tailwind CSS
- **Obstacle Avoidance**: Dodge cones, barrels, and rocks
- **Score Tracking**: Beat your high score!

## 🎮 Demo

**Gameplay:**
- Tilt ESP8266 controller left → Car moves left
- Tilt controller right → Car moves right
- Avoid obstacles to score points
- Collision → Game Over!

## 🛠️ Hardware Setup

### Components Required

| Component | Quantity | Purpose |
|-----------|----------|---------|
| ESP8266 (NodeMCU/Wemos D1) | 1 | WiFi + MQTT client |
| MPU6050 | 1 | Accelerometer/gyroscope |
| Jumper Wires | 4 | Connections |
| Micro USB Cable | 1 | Power & programming |
| Breadboard | 1 | Optional (for prototyping) |

### Wiring Diagram

```
MPU6050          ESP8266
--------         --------
VCC      →       3.3V
GND      →       GND
SDA      →       D2 (GPIO4)
SCL      →       D1 (GPIO5)
```

**Visual Wiring:**
```
         ESP8266 (NodeMCU)
         ┌───────────────┐
         │   ┌─────┐     │
      D1 │───┤ SCL │     │
      D2 │───┤ SDA │     │
     3V3 │───┤ VCC │     │  MPU6050
     GND │───┤ GND │     │
         │   └─────┘     │
         │      USB      │
         └───────┬───────┘
                 │
              (to PC)
```

## 📋 Prerequisites

### Software Required

1. **Node.js** (v16 or higher)
2. **Arduino IDE** (v1.8.19 or higher)
3. **VS Code** (optional, recommended)

### Arduino Libraries

Install these libraries via Arduino IDE Library Manager:

- `Adafruit MPU6050` (v2.2.4+)
- `Adafruit Unified Sensor` (v1.1.9+)
- `PubSubClient` (v2.8.0+)
- `ESP8266WiFi` (included with ESP8266 board package)

**To install ESP8266 board:**
1. File → Preferences → Additional Board Manager URLs
2. Add: `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
3. Tools → Board → Boards Manager → Search "ESP8266" → Install

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd d:\CarGameCC
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file is already configured with your HiveMQ credentials:

```env
VITE_MQTT_BROKER=9b51d0fda736411895b717fa7273e6d1.s1.eu.hivemq.cloud
VITE_MQTT_PORT=8884
VITE_MQTT_USERNAME=Spidy
VITE_MQTT_PASSWORD=Moni@0101
VITE_MQTT_USE_TLS=true
VITE_MQTT_TOPIC=game/car/gesture
```

### 4. Program ESP8266

1. Open `arduino/ESP8266_CarController/ESP8266_CarController.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Select board: **Tools → Board → ESP8266 Boards → NodeMCU 1.0 (ESP-12E Module)**
4. Select port: **Tools → Port → (your COM port)**
5. Click **Upload** ✅

### 5. Verify ESP8266 Connection

1. Open Serial Monitor (115200 baud)
2. You should see:
   ```
   ========================================
      Gesture Car Controller Starting
   ========================================
   
   🔧 Initializing MPU6050... ✅ Success!
   📡 Connecting to WiFi: YourNetwork
   ✅ WiFi Connected!
      IP Address: 192.168.1.xxx
   🔗 Connecting to HiveMQ Cloud... ✅ Connected!
      Topic: game/car/gesture
   
   ✅ Setup complete! Ready to play!
   ```

### 6. Run the Game

```bash
npm run dev
```

Open browser at: **http://localhost:3000**

## 🎮 How to Play

1. **Power on ESP8266** with MPU6050 connected
2. **Wait for connection** (green indicator in game UI)
3. **Click "Start Game"**
4. **Tilt controller**:
   - Tilt left → Car moves left lane
   - Tilt right → Car moves right lane
5. **Avoid obstacles** (cones, barrels, rocks)
6. **Score points** for each obstacle passed (+10)
7. **Beat high score!** 🏆

### Keyboard Controls (Testing Mode)

If ESP8266 is not connected, use keyboard:
- **Arrow Left** ← → Move car left
- **Arrow Right** → → Move car right

## 📁 Project Structure

```
CarGameCC/
├── arduino/
│   └── ESP8266_CarController/
│       └── ESP8266_CarController.ino    # ESP8266 firmware
├── src/
│   ├── components/
│   │   ├── Car.jsx                      # Car component with animations
│   │   ├── Obstacle.jsx                 # Obstacle components (cone, barrel, rock)
│   │   └── GameBoard.jsx                # Main game logic & loop
│   ├── services/
│   │   └── mqttService.js               # MQTT client for HiveMQ Cloud
│   ├── App.jsx                          # Main app with UI states
│   ├── main.jsx                         # React entry point
│   └── index.css                        # Tailwind + custom styles
├── .env                                 # Environment variables
├── package.json                         # Node dependencies
├── vite.config.js                       # Vite configuration
├── tailwind.config.js                   # Tailwind CSS config
└── README.md                            # This file
```

## 🔧 Troubleshooting

### ESP8266 Issues

**Problem:** ESP8266 won't connect to WiFi
- ✅ Check SSID and password (case-sensitive)
- ✅ Ensure WiFi is 2.4GHz (ESP8266 doesn't support 5GHz)
- ✅ Move closer to router

**Problem:** MPU6050 not detected
- ✅ Check wiring (especially SDA/SCL)
- ✅ Ensure 3.3V power (not 5V)
- ✅ Try different I2C pins

**Problem:** MQTT connection fails
- ✅ Verify HiveMQ credentials in `.ino` file
- ✅ Check internet connection
- ✅ Ensure port 8883 is not blocked by firewall

### Game Issues

**Problem:** Game shows "Connection Failed"
- ✅ Verify `.env` file has correct HiveMQ credentials
- ✅ Check browser console for errors (F12)
- ✅ Ensure ESP8266 is publishing to correct topic

**Problem:** Car doesn't respond to gestures
- ✅ Open Serial Monitor (115200) and verify gestures are detected
- ✅ Check MQTT topic matches in both ESP8266 and `.env`
- ✅ Tilt controller more (increase tilt angle)

**Problem:** Gestures too sensitive/insensitive
- ✅ Adjust `X_THRESHOLD` in `.ino` file:
  - Increase for less sensitivity (e.g., 3.5)
  - Decrease for more sensitivity (e.g., 2.0)

## ⚙️ Configuration

### Gesture Sensitivity (ESP8266)

Edit `arduino/ESP8266_CarController/ESP8266_CarController.ino`:

```cpp
const float X_THRESHOLD = 2.5;        // Adjust tilt sensitivity
const int GESTURE_DELAY = 250;        // Delay between gestures (ms)
const float DEADZONE = 1.0;           // Center deadzone
```

### Game Difficulty (React)

Edit `src/components/GameBoard.jsx`:

```jsx
// Line 44: Obstacle spawn rate
const obstacleInterval = setInterval(() => {
  // ...
}, 1500);  // Decrease for more obstacles (harder)

// Line 56: Obstacle speed
position: obs.position + 2,  // Increase for faster obstacles
```

## 🎨 Customization

### Change Car Color

Edit `src/components/Car.jsx`:

```jsx
<div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-lg">
```

Change `blue` to `red`, `green`, `purple`, etc.

### Add New Obstacle Types

Edit `src/components/Obstacle.jsx` to add custom obstacles!

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Vite |
| **IoT Messaging** | MQTT.js, HiveMQ Cloud (TLS) |
| **Hardware** | ESP8266 (NodeMCU), MPU6050 |
| **Language** | JavaScript (ES6+), C++ (Arduino) |

## 🌐 MQTT Architecture

```
┌─────────────┐         MQTT/TLS          ┌──────────────┐
│  ESP8266    │────────────────────────────→│  HiveMQ      │
│  + MPU6050  │  Topic: game/car/gesture   │  Cloud       │
└─────────────┘                            └──────┬───────┘
                                                   │
                                                   │ WSS
                                                   ↓
                                          ┌─────────────────┐
                                          │  React Game     │
                                          │  (Browser)      │
                                          └─────────────────┘
```

## 🎓 Educational Value

This project demonstrates:

1. **IoT Concepts**: Sensor integration, wireless communication
2. **Cloud Integration**: MQTT broker, real-time messaging
3. **Frontend Development**: React, state management, animations
4. **Embedded Systems**: ESP8266 programming, I2C communication
5. **Security**: TLS encryption for IoT devices

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Verify wiring and connections
3. Check Serial Monitor for ESP8266 logs
4. Check browser console for frontend errors

## 🎉 Acknowledgments

- **HiveMQ Cloud** for MQTT broker
- **Adafruit** for MPU6050 libraries
- **React** & **Tailwind CSS** communities

---

**Made with ❤️ for IoT enthusiasts**

🚀 **Ready to race? Start your engines!** 🏁
