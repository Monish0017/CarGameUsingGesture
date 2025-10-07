# Gesture Car Racing - Frontend

React-based frontend for the Gesture-Controlled Car Racing Game with Vite and Tailwind CSS.

## 🚀 Deployment on Vercel

### Prerequisites
- GitHub account
- Vercel account
- Backend API deployed on Render

### Deployment Steps

1. **Push your code to GitHub** (if not already done)

2. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**
   
   Add these environment variables in Vercel dashboard:
   
   ```
   VITE_API_URL=https://your-backend-app.onrender.com
   VITE_MQTT_BROKER=your_hivemq_broker_url
   VITE_MQTT_PORT=8884
   VITE_MQTT_USERNAME=your_mqtt_username
   VITE_MQTT_PASSWORD=your_mqtt_password
   VITE_MQTT_TOPIC=car/gesture
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Your app will be available at: `https://your-app-name.vercel.app`

6. **Update Backend CORS**
   - Go to your Render backend settings
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Example: `https://your-app-name.vercel.app`

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com` |
| `VITE_MQTT_BROKER` | HiveMQ Cloud broker URL | `your-cluster.hivemq.cloud` |
| `VITE_MQTT_PORT` | MQTT WebSocket port | `8884` |
| `VITE_MQTT_USERNAME` | MQTT username | `your_username` |
| `VITE_MQTT_PASSWORD` | MQTT password | `your_password` |
| `VITE_MQTT_TOPIC` | MQTT topic for gesture commands | `car/gesture` |

## 🔧 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your backend URL and MQTT credentials

4. Start development server:
   ```bash
   npm run dev
   ```

App will run on `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📦 Features

- 🏎️ Gesture-controlled racing game
- 👋 Slap game with time-based scoring
- 🏆 Global leaderboards
- 🔐 User authentication (JWT)
- 📊 Real-time MQTT communication with ESP8266
- 🎨 Responsive design with Tailwind CSS
- 🌙 Dark mode UI

## 🎮 Game Modes

### Racing Game
- **3 Difficulty Levels**: Beginner, Intermediate, Complex
- **Progressive Difficulty**: Increases every 50 points (5 levels)
- **Analog Control**: Full tilt control for smooth movement
- **Obstacle Spawning**: 
  - Easy: 6 seconds
  - Medium: 4 seconds
  - Hard: 2 seconds

### Slap Game
- Complete 10 slaps as fast as possible
- Score based on completion time
- Gesture-based slap detection

## 🔌 ESP8266 Integration

The app connects to ESP8266 with MPU6050 accelerometer via MQTT:

1. **Setup Hardware**: Follow `arduino/SETUP_GUIDE.md`
2. **Configure MQTT**: Update ESP8266 code with HiveMQ credentials
3. **Connect**: App auto-connects to MQTT broker
4. **Control**: Tilt sensor to control car movement

## 🐛 Troubleshooting

### Environment Variables Not Working
- Ensure all env vars start with `VITE_` prefix
- Restart dev server after changing `.env`
- In Vercel, redeploy after adding env vars

### CORS Errors
- Verify backend `FRONTEND_URL` matches your Vercel URL
- Check backend is running and accessible
- Ensure no trailing slashes in URLs

### MQTT Connection Issues
- Verify HiveMQ Cloud credentials
- Check firewall/network settings
- Ensure port 8884 (WebSocket) is open

### Build Errors on Vercel
- Check build logs for specific errors
- Verify all dependencies in `package.json`
- Ensure Node version compatibility (18+)

## 📱 Responsive Design

- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

## 🔐 Security Notes

- Never commit `.env` files
- Keep MQTT credentials secure
- Use environment variables for all sensitive data
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
