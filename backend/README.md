# Gesture Car Racing - Backend API

Backend API for the Gesture-Controlled Car Racing Game built with Express.js and MongoDB.

## 🚀 Deployment on Render

### Prerequisites
- MongoDB Atlas account with a database cluster
- Render account

### Deployment Steps

1. **Push your code to GitHub** (if not already done)

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this backend

3. **Configure the Web Service**
   - **Name**: `gesture-car-racing-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or your preferred plan)

4. **Set Environment Variables**
   
   Add these environment variables in Render dashboard:
   
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Your API will be available at: `https://your-app-name.onrender.com`

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://username:password@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT token generation | `your_super_secret_key_min_32_chars` |
| `PORT` | Server port (auto-set by Render) | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

## 🔧 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MongoDB credentials

4. Start the server:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (requires auth)
- `GET /api/user/stats` - Get user stats (requires auth)

### Leaderboard
- `GET /api/leaderboard/racing` - Get racing leaderboard
- `GET /api/leaderboard/slap` - Get slap game leaderboard
- `POST /api/leaderboard/racing` - Submit racing score (requires auth)
- `POST /api/leaderboard/slap` - Submit slap score (requires auth)

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong, unique JWT_SECRET (minimum 32 characters)
- Keep MongoDB credentials secure
- Enable MongoDB IP whitelist (add `0.0.0.0/0` for Render)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has proper permissions

### CORS Errors
- Update `FRONTEND_URL` environment variable with correct Vercel URL
- Ensure frontend URL doesn't have trailing slash

### Render Deployment Issues
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start script
