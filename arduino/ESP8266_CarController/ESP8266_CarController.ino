/*
 * Gesture-Controlled Car Racing Game
 * ESP8266 + MPU6050 Controller
 * 
 * This sketch reads tilt gestures from MPU6050 accelerometer
 * and publishes them to HiveMQ Cloud via MQTT over TLS
 * 
 * Hardware Setup:
 * MPU6050 VCC  -> ESP8266 3.3V
 * MPU6050 GND  -> ESP8266 GND
 * MPU6050 SDA  -> ESP8266 D2 (GPIO4)
 * MPU6050 SCL  -> ESP8266 D1 (GPIO5)
 * 
 * Libraries Required:
 * - Adafruit MPU6050
 * - Adafruit Unified Sensor
 * - PubSubClient
 * - ESP8266WiFi
 */

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// ========== WiFi Configuration ==========
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// ========== HiveMQ Cloud Configuration ==========
const char* mqtt_server = "9b51d0fda736411895b717fa7273e6d1.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // TLS port
const char* mqtt_username = "Spidy";
const char* mqtt_password = "Moni@0101";
const char* mqtt_topic = "game/car/gesture";

// ========== Gesture Detection Settings ==========
const float X_THRESHOLD = 2.5;        // Tilt threshold for left/right detection
const int GESTURE_DELAY = 100;        // Minimum delay between messages (ms)
const float DEADZONE = 1.0;           // Deadzone to prevent accidental triggers

// ========== Slap Game Settings ==========
const float SLAP_THRESHOLD = 15.0;    // Acceleration threshold for slap detection (m/s²)
const int SLAP_COOLDOWN = 500;        // Cooldown between slaps (ms)
float maxSlapSpeed = 0.0;             // Track maximum slap speed
unsigned long lastSlapTime = 0;

// ========== Objects ==========
Adafruit_MPU6050 mpu;
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ========== Variables ==========
unsigned long lastGestureTime = 0;
String lastGesture = "";
float lastAx = 0, lastAy = 0, lastAz = 0;  // Previous acceleration values

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n========================================");
  Serial.println("   Gesture Car Controller Starting");
  Serial.println("========================================\n");

  // Initialize MPU6050
  if (!initMPU6050()) {
    Serial.println("❌ MPU6050 initialization failed!");
    Serial.println("Check wiring and restart.");
    while (1) {
      delay(1000);
    }
  }

  // Connect to WiFi
  connectWiFi();

  // Setup MQTT with TLS
  espClient.setInsecure();  // For HiveMQ Cloud, we skip certificate verification
  client.setServer(mqtt_server, mqtt_port);
  
  // Connect to MQTT broker
  connectMQTT();

  Serial.println("\n✅ Setup complete! Ready to play!");
  Serial.println("Tilt the controller left/right to control the car.\n");
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();

  // Read sensor data and detect gestures/slaps
  detectGestureAndSlap();
  
  delay(20);  // Small delay for stability (50Hz update rate)
}

// ========== MPU6050 Initialization ==========
bool initMPU6050() {
  Serial.print("🔧 Initializing MPU6050... ");
  
  if (!mpu.begin()) {
    return false;
  }
  
  // Configure MPU6050 settings
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  Serial.println("✅ Success!");
  delay(100);
  return true;
}

// ========== WiFi Connection ==========
void connectWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("Check SSID and password, then restart.");
    while (1) {
      delay(1000);
    }
  }
}

// ========== MQTT Connection ==========
void connectMQTT() {
  while (!client.connected()) {
    Serial.print("🔗 Connecting to HiveMQ Cloud... ");
    
    // Create a random client ID
    String clientId = "ESP8266_CarController_";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect with credentials
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("✅ Connected!");
      Serial.print("   Topic: ");
      Serial.println(mqtt_topic);
    } else {
      Serial.print("❌ Failed, rc=");
      Serial.print(client.state());
      Serial.println(" | Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// ========== Gesture and Slap Detection ==========
void detectGestureAndSlap() {
  // Get sensor events
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  // Get current time
  unsigned long currentTime = millis();
  
  // Get acceleration values (m/s²)
  float ax = a.acceleration.x;
  float ay = a.acceleration.y;
  float az = a.acceleration.z;
  
  // Calculate total acceleration magnitude
  float accelMagnitude = sqrt(ax*ax + ay*ay + az*az);
  
  // Calculate speed (change in acceleration)
  float speedX = abs(ax - lastAx);
  float speedY = abs(ay - lastAy);
  float speedZ = abs(az - lastAz);
  float totalSpeed = sqrt(speedX*speedX + speedY*speedY + speedZ*speedZ);
  
  // Store current values for next iteration
  lastAx = ax;
  lastAy = ay;
  lastAz = az;
  
  // ===== SLAP DETECTION =====
  // Detect sudden acceleration spikes (slapping motion)
  if (accelMagnitude > SLAP_THRESHOLD && (currentTime - lastSlapTime) > SLAP_COOLDOWN) {
    float slapDistance = accelMagnitude - 9.8;  // Remove gravity component
    float slapSpeed = totalSpeed;
    
    // Track maximum speed
    if (slapSpeed > maxSlapSpeed) {
      maxSlapSpeed = slapSpeed;
    }
    
    // Publish slap data as JSON
    publishSlapData(slapSpeed, slapDistance, accelMagnitude);
    lastSlapTime = currentTime;
    
    Serial.print("👋 SLAP! Speed: ");
    Serial.print(slapSpeed);
    Serial.print(" | Distance: ");
    Serial.print(slapDistance);
    Serial.print(" | Magnitude: ");
    Serial.println(accelMagnitude);
  }
  
  // ===== RACING GAME GESTURE DETECTION =====
  // Check if enough time has passed since last gesture
  if (currentTime - lastGestureTime < GESTURE_DELAY) {
    return;
  }
  
  // Normalize ax for proportional control (-1.0 to 1.0)
  float normalizedX = constrain(ax / 10.0, -1.0, 1.0);
  float normalizedY = constrain(ay / 10.0, -1.0, 1.0);
  
  String gesture = "";
  
  // Detect tilt gestures for lane-based control
  if (ax < -X_THRESHOLD) {
    gesture = "left";
  } else if (ax > X_THRESHOLD) {
    gesture = "right";
  } else if (abs(ax) < DEADZONE && abs(ay) < DEADZONE) {
    // In deadzone - no gesture, but still send data for proportional control
    gesture = "center";
  }
  
  // Always publish data (even subtle movements for proportional control)
  if (gesture != "" || abs(normalizedX) > 0.1 || abs(normalizedY) > 0.1) {
    publishRacingData(gesture, ax, ay, normalizedX, normalizedY, totalSpeed);
    lastGesture = gesture;
    lastGestureTime = currentTime;
  }
}

// ========== Publish Racing Game Data (JSON) ==========
void publishRacingData(String gesture, float ax, float ay, float normX, float normY, float speed) {
  if (!client.connected()) {
    return;
  }
  
  // Create JSON message with all sensor data
  String json = "{";
  json += "\"type\":\"racing\",";
  json += "\"gesture\":\"" + gesture + "\",";
  json += "\"ax\":" + String(ax, 2) + ",";
  json += "\"ay\":" + String(ay, 2) + ",";
  json += "\"normX\":" + String(normX, 3) + ",";
  json += "\"normY\":" + String(normY, 3) + ",";
  json += "\"speed\":" + String(speed, 2);
  json += "}";
  
  bool success = client.publish(mqtt_topic, json.c_str());
  
  if (!success) {
    Serial.println("⚠️  Failed to publish racing data");
  }
}

// ========== Publish Slap Game Data (JSON) ==========
void publishSlapData(float speed, float distance, float magnitude) {
  if (!client.connected()) {
    return;
  }
  
  // Calculate points based on speed and distance
  int points = (int)((speed * 10) + (distance * 5));
  
  // Create JSON message
  String json = "{";
  json += "\"type\":\"slap\",";
  json += "\"speed\":" + String(speed, 2) + ",";
  json += "\"distance\":" + String(distance, 2) + ",";
  json += "\"magnitude\":" + String(magnitude, 2) + ",";
  json += "\"points\":" + String(points) + ",";
  json += "\"maxSpeed\":" + String(maxSlapSpeed, 2);
  json += "}";
  
  bool success = client.publish(mqtt_topic, json.c_str());
  
  if (!success) {
    Serial.println("⚠️  Failed to publish slap data");
  }
}
