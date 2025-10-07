import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import SlapGame from './components/SlapGame';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Leaderboard from './components/Leaderboard';
import mqttService from './services/mqttService';
import authService from './services/authService';

function App() {
  const [appState, setAppState] = useState('auth'); // auth, menu, racing, slap, leaderboard, gameOver
  const [authView, setAuthView] = useState('login'); // login or signup
  const [gameMode, setGameMode] = useState('racing'); // racing or slap
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate'); // beginner, intermediate, complex
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [slapStats, setSlapStats] = useState({ slaps: 0, maxSpeed: 0, score: 0 });
  const [mqttConnected, setMqttConnected] = useState(false);
  const [gestureCommand, setGestureCommand] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const isValid = await authService.verifyToken();
        if (isValid) {
          setCurrentUser(authService.getCurrentUser());
          setAppState('menu');
        } else {
          setAppState('auth');
        }
      }
    };
    
    checkAuth();

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('carGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Load slap game high score
    const savedSlapScore = localStorage.getItem('slapGameHighScore');
    if (savedSlapScore) {
      setSlapStats(JSON.parse(savedSlapScore));
    }

    // Connect to MQTT
    connectMQTT();

    return () => {
      mqttService.disconnect();
    };
  }, []);

  const connectMQTT = async () => {
    try {
      setConnectionStatus('Connecting to MQTT...');
      await mqttService.connect();
      setMqttConnected(true);
      setConnectionStatus('Connected to ESP8266');

      // Listen for gesture commands
      mqttService.onGesture((data) => {
        setGestureCommand(data);
        // Clear gesture after a short delay (for simple gestures)
        if (typeof data === 'string') {
          setTimeout(() => setGestureCommand(null), 100);
        }
      });
    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      setMqttConnected(false);
      setConnectionStatus('Connection Failed - Using Keyboard');
    }
  };

  const startGame = (mode, difficulty = 'intermediate') => {
    setScore(0);
    setGameMode(mode);
    setDifficultyLevel(difficulty);
    setAppState(mode); // 'racing' or 'slap'
  };

  const handleGameOver = async () => {
    setAppState('gameOver');
    if (gameMode === 'racing') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('carGameHighScore', score.toString());
      }
      
      // Submit score to server if authenticated
      if (authService.isAuthenticated()) {
        try {
          await authService.submitScore('racing', score, { 
            difficultyLevel 
          });
          // Refresh user data
          const updatedUser = await authService.getUserProfile();
          setCurrentUser(updatedUser);
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      }
    }
  };

  const handleSlapGameEnd = async (finalScore, slaps, maxSpeed) => {
    setScore(finalScore);
    setSlapStats({ score: finalScore, slaps, maxSpeed });
    setAppState('gameOver');
    
    // Save best slap game stats
    const savedStats = localStorage.getItem('slapGameHighScore');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      if (finalScore > (stats.score || 0)) {
        localStorage.setItem('slapGameHighScore', JSON.stringify({
          score: finalScore,
          slaps,
          maxSpeed
        }));
      }
    } else {
      localStorage.setItem('slapGameHighScore', JSON.stringify({
        score: finalScore,
        slaps,
        maxSpeed
      }));
    }
    
    // Submit score to server if authenticated
    if (authService.isAuthenticated()) {
      try {
        await authService.submitScore('slap', finalScore, { 
          totalSlaps: slaps,
          maxSpeed 
        });
        // Refresh user data
        const updatedUser = await authService.getUserProfile();
        setCurrentUser(updatedUser);
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  };

  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
  };

  const backToMenu = () => {
    setAppState('menu');
  };

  const exitGame = () => {
    setAppState('menu');
    setScore(0);
  };

  const handleAuthSuccess = () => {
    setCurrentUser(authService.getCurrentUser());
    setAppState('menu');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAppState('auth');
  };

  const showLeaderboard = () => {
    setAppState('leaderboard');
  };

  return (
    <div className="w-full min-h-screen game-container">
      {/* Authentication Views */}
      {appState === 'auth' && (
        <>
          {authView === 'login' ? (
            <Login 
              onSuccess={handleAuthSuccess} 
              onSwitchToSignUp={() => setAuthView('signup')}
            />
          ) : (
            <SignUp 
              onSuccess={handleAuthSuccess} 
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
        </>
      )}

      {/* Leaderboard View */}
      {appState === 'leaderboard' && (
        <Leaderboard onBack={backToMenu} />
      )}

      {/* Game Views */}
      {(appState === 'menu' || appState === 'racing' || appState === 'slap' || appState === 'gameOver') && (
        <>
          {/* Header - Fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 py-3 gap-3">
              <div className="flex items-center space-x-2 md:space-x-4">
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold neon-text whitespace-nowrap">
                  🏎️ Gesture Racing
                </h1>
                <div className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 rounded-full text-xs ${
                  mqttConnected 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    mqttConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-xs md:text-sm hidden sm:inline">{connectionStatus}</span>
                  <span className="text-xs sm:hidden">{mqttConnected ? '✓ ESP' : '⚠ KB'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-4">
                {currentUser && (
                  <div className="flex items-center space-x-2">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-gray-400">Logged in as</div>
                      <div className="text-sm md:text-base font-bold text-purple-400">{currentUser.username}</div>
                    </div>
                    <div className="text-sm font-bold text-purple-400 md:hidden">{currentUser.username}</div>
                    <button
                      onClick={handleLogout}
                      className="px-2 py-1 md:px-4 md:py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition text-xs md:text-sm font-semibold border border-red-500/30"
                    >
                      Logout
                    </button>
                  </div>
                )}
                
                {appState === 'racing' && (
                  <div className="flex space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Score</div>
                      <div className="text-3xl font-bold text-blue-400">{score}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Best</div>
                      <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Difficulty</div>
                      <div className="text-lg font-bold text-purple-400 capitalize">
                        {difficultyLevel === 'beginner' && '🟢 Easy'}
                        {difficultyLevel === 'intermediate' && '� Medium'}
                        {difficultyLevel === 'complex' && '🔴 Hard'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

      {/* Game States - Content below header */}
      {appState === 'menu' && (
        <div className="fixed inset-0 pt-20 md:pt-24 overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
          <div className="w-full max-w-5xl mx-auto px-4 py-8">
            <div className="text-center space-y-6 md:space-y-8 p-6 md:p-8 bg-gray-900/90 backdrop-blur-lg rounded-3xl border-2 border-blue-500/30 shadow-2xl">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold neon-text mb-4">
                  Gesture Gaming
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-2">
                  Choose your game mode!
                </p>
              </div>

              {/* Game Mode Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Racing Game */}
                <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl border-2 border-blue-500/30 hover:border-blue-400 transition-all hover:scale-[1.02]">
                  <div className="text-5xl mb-4">🏎️</div>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">Racing Game</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    🎮 Tilt your ESP8266 to control the car - Full analog precision!
                  </p>
                  
                  {/* Difficulty Selection */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-blue-300 mb-3">SELECT DIFFICULTY</div>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => startGame('racing', 'beginner')}
                        className="px-4 py-3 bg-green-600/30 hover:bg-green-600/50 text-white font-bold rounded-lg transition border border-green-500/30 hover:scale-105 transform"
                        title="Slower obstacles, easier gameplay"
                      >
                        <div className="text-lg">🟢 Beginner</div>
                        <div className="text-xs text-gray-300 mt-1">Slower pace, good for learning</div>
                      </button>
                      <button
                        onClick={() => startGame('racing', 'intermediate')}
                        className="px-4 py-3 bg-yellow-600/30 hover:bg-yellow-600/50 text-white font-bold rounded-lg transition border border-yellow-500/30 hover:scale-105 transform"
                        title="Balanced difficulty"
                      >
                        <div className="text-lg">🟡 Intermediate</div>
                        <div className="text-xs text-gray-300 mt-1">Balanced speed and obstacles</div>
                      </button>
                      <button
                        onClick={() => startGame('racing', 'complex')}
                        className="px-4 py-3 bg-red-600/30 hover:bg-red-600/50 text-white font-bold rounded-lg transition border border-red-500/30 hover:scale-105 transform"
                        title="Very challenging!"
                      >
                        <div className="text-lg">� Complex</div>
                        <div className="text-xs text-gray-300 mt-1">Fast and intense - extreme challenge!</div>
                      </button>
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div style={{display: 'none'}}>
                    <div className="text-xs font-bold text-blue-300 mb-2">DIFFICULTY LEVEL</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        className="px-3 py-2 bg-green-600/30 hover:bg-green-600/50 text-white text-xs font-bold rounded-lg transition border border-green-500/30"
                        title="Fewer obstacles, slower speed"
                      >
                        🟢 Easy
                      </button>
                      <button
                        className="px-3 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 text-white text-xs font-bold rounded-lg transition border border-yellow-500/30"
                        title="Balanced gameplay"
                      >
                        🟡 Medium
                      </button>
                      <button
                        className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-white text-xs font-bold rounded-lg transition border border-red-500/30"
                        title="Many obstacles, high speed"
                      >
                        � Hard
                      </button>
                    </div>
                  </div>
                  
                  {highScore > 0 && (
                    <div className="mt-4 text-sm text-yellow-400 font-semibold">
                      🏆 Best: {highScore} points
                    </div>
                  )}
                </div>

                {/* Slap Game */}
                <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-2xl border-2 border-red-500/30 hover:border-red-400 transition-all hover:scale-[1.02]">
                  <div className="text-5xl mb-4">👋</div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Slap Game</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    Complete 10 slaps - Faster = Higher Score!
                  </p>
                  
                  <button
                    onClick={() => startGame('slap')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    👋 Start Slapping!
                  </button>
                  
                  {slapStats.score > 0 && (
                    <div className="mt-4 text-sm text-yellow-400 font-semibold">
                      🏆 Best: {slapStats.score} pts ({slapStats.slaps} slaps)
                    </div>
                  )}
                </div>
              </div>

            {/* Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 pt-6 border-t border-gray-700 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                <div className="font-bold text-blue-400 mb-1">🏎️ Racing Controls</div>
                <div>🎮 Tilt ESP8266 left/right for full control</div>
                <div>⌨️ Use ← → keys for testing</div>
                <div>🎯 Full analog precision - reach the edges!</div>
              </div>
              <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                <div className="font-bold text-red-400 mb-1">Slap Game</div>
                <div>👋 Fast movements = more points</div>
                <div>⚡ Speed + Distance = Score</div>
              </div>
            </div>

            {!mqttConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ ESP8266 not connected. Using keyboard/mouse for testing.
                </p>
              </div>
            )}

            {/* Leaderboard Button */}
            <button
              onClick={showLeaderboard}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🏆 View Leaderboard
            </button>

            {/* User Stats */}
            {currentUser && currentUser.stats && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold text-purple-400">Your Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-900/30 rounded-lg p-3">
                    <div className="text-blue-300 font-semibold">Racing</div>
                    <div className="text-2xl font-bold text-blue-400">{currentUser.stats.racing.highScore}</div>
                    <div className="text-gray-400 text-xs">{currentUser.stats.racing.gamesPlayed} games</div>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-3">
                    <div className="text-purple-300 font-semibold">Slap Game</div>
                    <div className="text-2xl font-bold text-purple-400">{currentUser.stats.slap.highScore}</div>
                    <div className="text-gray-400 text-xs">{currentUser.stats.slap.totalSlaps} slaps</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>🎮 IoT Project: ESP8266 + MPU6050 + HiveMQ Cloud</p>
              <p>Built with React + Tailwind + MQTT.js + MongoDB</p>
            </div>
            </div>
          </div>
        </div>
      )}

      {appState === 'racing' && (
        <div className="pt-16 md:pt-20 w-full" style={{ height: 'calc(100vh - 4rem)' }}>
          <GameBoard
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            gestureCommand={gestureCommand}
            difficultyLevel={difficultyLevel}
            onExitGame={exitGame}
          />
        </div>
      )}

      {appState === 'slap' && (
        <div className="pt-16 md:pt-20 w-full" style={{ height: 'calc(100vh - 4rem)' }}>
          <SlapGame
            onGameEnd={handleSlapGameEnd}
            gestureCommand={gestureCommand}
            onExitGame={exitGame}
          />
        </div>
      )}

      {appState === 'gameOver' && (
        <div className="pt-20 md:pt-24 pb-8 px-4 min-h-screen overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-auto my-8">
            <div className="text-center space-y-6 p-8 bg-gray-900/95 backdrop-blur-lg rounded-3xl border-2 border-red-500/30 shadow-2xl">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-red-500 mb-2">
                  {gameMode === 'racing' ? 'Game Over!' : 'Round Complete!'}
                </h2>
                <p className="text-gray-400 text-lg">
                  {gameMode === 'racing' ? 'You crashed! 💥' : '10 Slaps Done! 👋'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-blue-500/30">
                  <p className="text-gray-300 text-sm mb-2">Final Score</p>
                  <p className="text-5xl md:text-6xl font-bold text-blue-400">{score}</p>
                </div>

                {gameMode === 'slap' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-900/40 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-purple-300 text-sm mb-1">Total Slaps</p>
                      <p className="text-3xl font-bold text-purple-400">{slapStats.slaps}</p>
                    </div>
                    <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300 text-sm mb-1">Max Speed</p>
                      <p className="text-3xl font-bold text-red-400">{slapStats.maxSpeed.toFixed(1)}</p>
                    </div>
                  </div>
                )}

                {gameMode === 'racing' && score >= highScore && score > 0 && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 animate-pulse">
                    <p className="text-yellow-400 font-bold text-lg">🏆 New High Score!</p>
                  </div>
                )}

                {gameMode === 'slap' && score >= (slapStats.score || 0) && score > 0 && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 animate-pulse">
                    <p className="text-yellow-400 font-bold text-lg">🏆 New High Score!</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => startGame(gameMode, difficultyLevel)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ▶️ Play Again
                </button>
                <button
                  onClick={backToMenu}
                  className="w-full px-8 py-3 bg-gray-700/80 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300 border border-gray-600"
                >
                  🏠 Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay (bottom) */}
      {(appState === 'racing' || appState === 'slap') && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
          <p className="text-sm text-gray-300">
            {mqttConnected ? (
              appState === 'racing' ? (
                <>🎮 Tilt your ESP8266 controller to move</>
              ) : (
                <>👋 Slap the air with ESP8266 for points!</>
              )
            ) : (
              appState === 'racing' ? (
                <>⌨️ Use Arrow Keys: ← Left | Right →</>
              ) : (
                <>🖱️ Click rapidly or press Space to simulate slaps</>
              )
            )}
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default App;
