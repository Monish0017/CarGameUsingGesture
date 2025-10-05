# 🧪 Testing & Development Guide

## Testing Without Hardware

You can fully test and develop the game without ESP8266 hardware!

### Keyboard Controls

The game has built-in keyboard controls:

```javascript
// In GameBoard.jsx - Keyboard event listener
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft') moveCar('left');
    else if (e.key === 'ArrowRight') moveCar('right');
  };
  window.addEventListener('keydown', handleKeyPress);
}, []);
```

**Controls:**
- `←` Arrow Left: Move car left
- `→` Arrow Right: Move car right

### MQTT Testing Tools

#### 1. MQTT.fx (Desktop Client)
Download: http://mqttfx.jensd.de/

**Setup:**
- Broker Address: `9b51d0fda736411895b717fa7273e6d1.s1.eu.hivemq.cloud`
- Port: `8883`
- Username: `Spidy`
- Password: `Moni@0101`
- Enable SSL/TLS

**Test Publish:**
- Topic: `game/car/gesture`
- Message: `left` or `right`
- Click Publish → Car should move!

#### 2. HiveMQ Webclient
URL: http://www.hivemq.com/demos/websocket-client/

**Setup:**
- Host: `9b51d0fda736411895b717fa7273e6d1.s1.eu.hivemq.cloud`
- Port: `8884`
- Path: `/mqtt`
- Enable SSL
- Username: `Spidy`
- Password: `Moni@0101`

**Test:**
1. Click "Connect"
2. Add subscription: `game/car/gesture`
3. Publish message: `left` or `right`

#### 3. Browser Console Testing

Open browser console (F12) and type:

```javascript
// Simulate gesture from ESP8266
const event = new CustomEvent('gesture', { detail: 'left' });
window.dispatchEvent(event);

// Or test MQTT directly
const mqtt = window.mqtt;
// (if exposed in development mode)
```

## Development Tips

### Hot Reload

Vite provides instant hot reload:
- Edit any `.jsx` file
- Save
- Browser updates instantly!

### Component Testing

Test individual components:

```jsx
// Test Car component
import Car from './components/Car';

function TestCar() {
  const [lane, setLane] = useState(1);
  
  return (
    <div>
      <Car lane={lane} />
      <button onClick={() => setLane(0)}>Left</button>
      <button onClick={() => setLane(1)}>Center</button>
      <button onClick={() => setLane(2)}>Right</button>
    </div>
  );
}
```

### Debugging MQTT

Add console logs in `mqttService.js`:

```javascript
client.on('message', (topic, message) => {
  console.log('📨 MQTT Message:', topic, message.toString());
  console.log('⏰ Timestamp:', new Date().toISOString());
  this.notifyListeners(message.toString());
});
```

Check browser console (F12) to see:
- Connection status
- Incoming messages
- Errors

### Game Speed Adjustment

For testing, slow down the game:

```jsx
// In GameBoard.jsx
const obstacleInterval = setInterval(() => {
  // Generate obstacle
}, 3000);  // Change from 1500 to 3000 (slower)

const gameLoopRef.current = setInterval(() => {
  // Move obstacles
  position: obs.position + 1,  // Change from 2 to 1 (slower)
}, 100);  // Change from 50 to 100 (slower frame rate)
```

## Testing Checklist

### Frontend Tests

- [ ] Game loads without errors
- [ ] Main menu displays correctly
- [ ] "Start Game" button works
- [ ] Keyboard controls work (← →)
- [ ] Car moves between lanes smoothly
- [ ] Obstacles spawn regularly
- [ ] Obstacles move down screen
- [ ] Collision detection works
- [ ] Score increments correctly
- [ ] Game over screen appears
- [ ] High score saves (localStorage)
- [ ] "Play Again" button works
- [ ] Connection status shows

### MQTT Tests

- [ ] MQTT client connects
- [ ] Subscription succeeds
- [ ] Messages received in console
- [ ] Car responds to `left` message
- [ ] Car responds to `right` message
- [ ] Connection status indicator updates
- [ ] Reconnection works after disconnect

### Hardware Tests (ESP8266)

- [ ] WiFi connects successfully
- [ ] MQTT connection established
- [ ] MPU6050 detected
- [ ] Tilt left → "left" published
- [ ] Tilt right → "right" published
- [ ] Serial Monitor shows gestures
- [ ] LED blinks on message (optional)
- [ ] No memory leaks (long-term test)

### Integration Tests

- [ ] ESP8266 → Game (end-to-end)
- [ ] Multiple rapid gestures handled
- [ ] Network interruption recovery
- [ ] Browser tab switching (game pauses?)
- [ ] Multiple browser tabs (conflict?)
- [ ] Mobile browser compatibility

## Performance Testing

### Measure Latency

Add timestamps to measure gesture-to-screen latency:

**ESP8266:**
```cpp
// In publishGesture()
String message = gesture + "|" + String(millis());
client.publish(mqtt_topic, message.c_str());
```

**React:**
```javascript
client.on('message', (topic, message) => {
  const [gesture, timestamp] = message.toString().split('|');
  const latency = Date.now() - parseInt(timestamp);
  console.log(`⚡ Latency: ${latency}ms`);
});
```

### Expected Performance

- **Latency**: 50-150ms (gesture to screen)
- **Frame Rate**: 60 FPS (check with browser tools)
- **Memory**: <50MB (browser DevTools)
- **CPU**: <20% (low-end devices)

## Common Issues & Solutions

### Issue: High Latency (>500ms)

**Causes:**
- Weak WiFi signal
- Network congestion
- MQTT broker overload

**Solutions:**
- Move ESP8266 closer to router
- Use 5GHz WiFi for laptop (ESP8266 stays on 2.4GHz)
- Check HiveMQ dashboard for status

### Issue: Missed Gestures

**Causes:**
- Messages too frequent (flooding)
- Deadzone too large
- Threshold too high

**Solutions:**
- Increase `GESTURE_DELAY` in Arduino code
- Decrease `DEADZONE` value
- Lower `X_THRESHOLD` for sensitivity

### Issue: False Triggers

**Causes:**
- Vibration or movement
- Threshold too low
- No deadzone

**Solutions:**
- Increase `X_THRESHOLD` (less sensitive)
- Increase `DEADZONE` (wider neutral zone)
- Add delay between gestures

### Issue: Game Too Fast/Slow

**Solutions:**
```jsx
// GameBoard.jsx - Adjust these values

// Slower obstacles
}, 2000);  // Spawn interval (higher = slower spawn)
position: obs.position + 1,  // Speed (lower = slower)

// Faster obstacles  
}, 1000);  // Spawn interval (lower = faster spawn)
position: obs.position + 3,  // Speed (higher = faster)
```

## Browser Compatibility

### Tested Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 120+ | ✅ Perfect | Recommended |
| Firefox | 121+ | ✅ Perfect | Works great |
| Edge | 120+ | ✅ Perfect | Chromium-based |
| Safari | 17+ | ✅ Good | WebSocket may vary |
| Opera | 106+ | ✅ Perfect | Chromium-based |

### Mobile Testing

- ✅ iOS Safari (iPhone/iPad)
- ✅ Chrome Android
- ✅ Samsung Internet
- ⚠️ Keyboard controls don't work on mobile (need ESP8266)

## Automated Testing (Optional)

### Jest Unit Tests

```bash
npm install --save-dev jest @testing-library/react
```

Example test:
```javascript
import { render, screen } from '@testing-library/react';
import Car from './components/Car';

test('renders car in correct lane', () => {
  render(<Car lane={1} />);
  const car = screen.getByTestId('car');
  expect(car).toHaveClass('left-[42.5%]');
});
```

### Cypress E2E Tests

```bash
npm install --save-dev cypress
```

Example test:
```javascript
describe('Car Racing Game', () => {
  it('starts game and moves car', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Start Game').click();
    cy.get('body').trigger('keydown', { key: 'ArrowLeft' });
    // Assert car moved
  });
});
```

## Load Testing

### Simulate Multiple Clients

```javascript
// test-mqtt-load.js
const mqtt = require('mqtt');

for (let i = 0; i < 10; i++) {
  const client = mqtt.connect(/* ... */);
  setInterval(() => {
    client.publish('game/car/gesture', 
      Math.random() > 0.5 ? 'left' : 'right'
    );
  }, 1000);
}
```

Run: `node test-mqtt-load.js`

## Debugging Tools

### Browser DevTools

**Console** (F12):
- See MQTT connection logs
- Check for JavaScript errors
- Monitor gesture messages

**Network** tab:
- Check WebSocket connection
- Monitor MQTT traffic
- Verify TLS encryption

**Performance** tab:
- Measure frame rate
- Check for memory leaks
- Profile game loop

### Arduino Serial Monitor

**Tools → Serial Monitor** (115200 baud)

Look for:
```
✅ WiFi Connected!
✅ MQTT Connected!
🎮 Gesture: left | X: -3.45
🎮 Gesture: right | X: 4.12
```

### HiveMQ Cloud Dashboard

Login: https://console.hivemq.cloud/

Check:
- Connection status
- Message rate
- Error logs
- Data usage

## Development Workflow

### Recommended Flow

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Open browser** at http://localhost:3000

3. **Test with keyboard** first

4. **Open DevTools** (F12) → Console

5. **Make changes** to code

6. **Auto-reload** sees changes instantly

7. **Test gestures** with MQTT client

8. **Upload to ESP8266** when ready

9. **Test end-to-end** with hardware

### Git Workflow (Optional)

```bash
git init
git add .
git commit -m "Initial commit: Gesture car racing game"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Debugging
npm run dev -- --debug  # Verbose logging
npm run dev -- --host   # Expose to network

# Package management
npm list               # List installed packages
npm outdated          # Check for updates
npm audit             # Security check
```

## Next Steps

After testing:
1. ✅ Verify all features work
2. ✅ Document any custom changes
3. ✅ Create presentation slides
4. ✅ Practice demo with hardware
5. ✅ Prepare for Q&A

---

Happy testing! 🧪✨
