const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api`;

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Sign up new user
  async signup(username, email, password) {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login existing user
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Verify token
  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        this.logout();
        return false;
      }

      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      return false;
    }
  }

  // Submit score
  async submitScore(gameMode, score, additionalData = {}) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/user/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          gameMode,
          score,
          ...additionalData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Score submission failed');
      }

      // Update local user stats
      if (data.stats) {
        this.user.stats = data.stats;
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      console.error('Score submission error:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(gameMode, limit = 10) {
    try {
      const response = await fetch(`${API_BASE}/leaderboard/${gameMode}?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch leaderboard');
      }

      return data.leaderboard;
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  // Get user score history
  async getScoreHistory(gameMode = null, limit = 10) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const url = gameMode 
        ? `${API_BASE}/user/scores?gameMode=${gameMode}&limit=${limit}`
        : `${API_BASE}/user/scores?limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch score history');
      }

      return data.scores;
    } catch (error) {
      console.error('Score history fetch error:', error);
      throw error;
    }
  }

  // Set authentication data
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
