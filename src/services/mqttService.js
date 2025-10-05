import mqtt from 'mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      const broker = import.meta.env.VITE_MQTT_BROKER;
      const port = import.meta.env.VITE_MQTT_PORT;
      const username = import.meta.env.VITE_MQTT_USERNAME;
      const password = import.meta.env.VITE_MQTT_PASSWORD;
      
      // Use WebSocket Secure connection for browser
      const url = `wss://${broker}:${port}/mqtt`;
      
      console.log('Connecting to MQTT broker:', url);

      const options = {
        username: username,
        password: password,
        protocol: 'wss',
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        clean: true,
        clientId: `car_game_${Math.random().toString(16).substr(2, 8)}`,
      };

      this.client = mqtt.connect(url, options);

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.connected = true;
        
        const topic = import.meta.env.VITE_MQTT_TOPIC || 'game/car/gesture';
        this.client.subscribe(topic, (err) => {
          if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
            resolve(true);
          } else {
            console.error('Subscription error:', err);
            reject(err);
          }
        });
      });

      this.client.on('message', (topic, message) => {
        const gesture = message.toString();
        console.log('Received gesture:', gesture);
        this.notifyListeners(gesture);
      });

      this.client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        this.connected = false;
        reject(err);
      });

      this.client.on('offline', () => {
        console.log('MQTT client offline');
        this.connected = false;
      });

      this.client.on('reconnect', () => {
        console.log('MQTT client reconnecting...');
      });
    });
  }

  onGesture(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(gesture) {
    this.listeners.forEach(callback => callback(gesture));
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new MQTTService();
