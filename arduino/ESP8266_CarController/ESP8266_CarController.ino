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
const int GESTURE_DELAY = 250;        // Minimum delay between gestures (ms)
const float DEADZONE = 1.0;           // Deadzone to prevent accidental triggers

// ========== Objects ==========
Adafruit_MPU6050 mpu;
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ========== Variables ==========
unsigned long lastGestureTime = 0;
String lastGesture = "";

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

  // Read sensor data and detect gestures
  detectGesture();
  
  delay(50);  // Small delay for stability
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

// ========== Gesture Detection ==========
void detectGesture() {
  // Get sensor events
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  // Get current time
  unsigned long currentTime = millis();
  
  // Check if enough time has passed since last gesture
  if (currentTime - lastGestureTime < GESTURE_DELAY) {
    return;
  }
  
  // Get X-axis acceleration (tilt left/right)
  float ax = a.acceleration.x;
  
  String gesture = "";
  
  // Detect tilt gestures
  if (ax < -X_THRESHOLD) {
    gesture = "left";
  } else if (ax > X_THRESHOLD) {
    gesture = "right";
  } else if (abs(ax) < DEADZONE) {
    // In deadzone - no gesture
    lastGesture = "";
    return;
  }
  
  // Only publish if gesture changed and is not empty
  if (gesture != "" && gesture != lastGesture) {
    publishGesture(gesture);
    lastGesture = gesture;
    lastGestureTime = currentTime;
    
    // Visual feedback in Serial Monitor
    Serial.print("🎮 Gesture: ");
    Serial.print(gesture.c_str());
    Serial.print(" | X: ");
    Serial.println(ax);
  }
}

// ========== Publish Gesture to MQTT ==========
void publishGesture(String gesture) {
  if (client.connected()) {
    bool success = client.publish(mqtt_topic, gesture.c_str());
    
    if (!success) {
      Serial.println("⚠️  Failed to publish gesture");
    }
  } else {
    Serial.println("⚠️  MQTT not connected, reconnecting...");
    connectMQTT();
  }
}
