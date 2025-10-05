# Arduino Setup Instructions

## Step-by-Step Guide to Upload ESP8266 Code

### 1. Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### 2. Install ESP8266 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Board Manager URLs", add:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
4. Click **OK**
5. Go to **Tools → Board → Boards Manager**
6. Search for "esp8266"
7. Install **esp8266 by ESP8266 Community**

### 3. Install Required Libraries
1. Go to **Sketch → Include Library → Manage Libraries**
2. Search and install the following:
   - **Adafruit MPU6050** (by Adafruit)
   - **Adafruit Unified Sensor** (by Adafruit)
   - **PubSubClient** (by Nick O'Leary)

### 4. Configure Arduino IDE
1. Go to **Tools → Board → ESP8266 Boards**
2. Select **NodeMCU 1.0 (ESP-12E Module)**
3. Set the following:
   - **Upload Speed**: 115200
   - **CPU Frequency**: 80 MHz
   - **Flash Size**: 4MB (FS:2MB OTA:~1019KB)
   - **Port**: Select your COM port (e.g., COM3, COM4)

### 5. Update WiFi Credentials
Open `ESP8266_CarController.ino` and update:

```cpp
const char* ssid = "YOUR_WIFI_SSID";           // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
```

### 6. Upload Code
1. Connect ESP8266 to computer via USB
2. Click **Upload** button (→) in Arduino IDE
3. Wait for "Done uploading" message

### 7. Monitor Serial Output
1. Click **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see connection status and gesture data

## Troubleshooting

### Upload Failed
- Press and hold **FLASH** button on ESP8266 during upload
- Try a different USB cable
- Check if correct COM port is selected

### MPU6050 Not Found
- Verify wiring connections
- Check if MPU6050 has power (LED should be on)
- Try I2C scanner sketch to verify address

### WiFi Connection Issues
- Ensure WiFi is 2.4GHz (not 5GHz)
- Check SSID and password (case-sensitive)
- Move closer to router

### MQTT Connection Issues
- Verify internet connection
- Check HiveMQ credentials
- Ensure firewall allows port 8883

## Expected Serial Output

```
========================================
   Gesture Car Controller Starting
========================================

🔧 Initializing MPU6050... ✅ Success!
📡 Connecting to WiFi: YourNetwork
.....
✅ WiFi Connected!
   IP Address: 192.168.1.100
🔗 Connecting to HiveMQ Cloud... ✅ Connected!
   Topic: game/car/gesture

✅ Setup complete! Ready to play!
Tilt the controller left/right to control the car.

🎮 Gesture: left | X: -3.24
🎮 Gesture: right | X: 4.15
```

## Testing the Controller

1. **Tilt Left**: Accelerometer X should show negative value (< -2.5)
2. **Tilt Right**: Accelerometer X should show positive value (> 2.5)
3. **Center**: X should be near 0 (within deadzone)

## Calibration

If gestures are too sensitive or not sensitive enough:

```cpp
// Increase for less sensitivity
const float X_THRESHOLD = 3.5;  

// Decrease for more sensitivity  
const float X_THRESHOLD = 2.0;
```

## Wiring Reference

```
ESP8266 (NodeMCU)    MPU6050
─────────────────    ───────
3.3V          ────→  VCC
GND           ────→  GND
D2 (GPIO4)    ────→  SDA
D1 (GPIO5)    ────→  SCL
```

Good luck! 🚀
