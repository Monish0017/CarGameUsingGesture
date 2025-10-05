import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import SlapGame from './components/SlapGame';
import mqttService from './services/mqttService';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, racing, slap, gameOver
  const [gameMode, setGameMode] = useState('racing'); // racing or slap
  const [controlMode, setControlMode] = useState('lane'); // lane or proportional
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [slapStats, setSlapStats] = useState({ slaps: 0, maxSpeed: 0 }); // For slap game
  const [mqttConnected, setMqttConnected] = useState(false);
  const [gestureCommand, setGestureCommand] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
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

  const startGame = (mode, control = 'lane') => {
    setScore(0);
    setGameMode(mode);
    setControlMode(control);
    setGameState(mode); // 'racing' or 'slap'
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    if (gameMode === 'racing' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('carGameHighScore', score.toString());
    }
  };

  const handleSlapGameEnd = (finalScore, slaps, maxSpeed) => {
    setScore(finalScore);
    setSlapStats({ slaps, maxSpeed });
    setGameState('gameOver');
    
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
  };

  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="w-full h-screen game-container overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl md:text-3xl font-bold neon-text">
              🏎️ Gesture Racing
            </h1>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              mqttConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                mqttConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`}></div>
              <span>{connectionStatus}</span>
            </div>
          </div>
          
          {gameState === 'playing' && (
            <div className="flex space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Score</div>
                <div className="text-3xl font-bold text-blue-400">{score}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Best</div>
                <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
              </div>
            </div>
          )}
          
          {gameState === 'racing' && (
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
                <div className="text-sm text-gray-400">Mode</div>
                <div className="text-lg font-bold text-purple-400">
                  {controlMode === 'proportional' ? '📐 Analog' : '🎯 Lane'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game States */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center space-y-8 p-8 bg-gray-900/80 backdrop-blur-lg rounded-3xl border-2 border-blue-500/30 shadow-2xl max-w-3xl mx-4">
            <div>
              <h2 className="text-6xl font-bold neon-text mb-4">
                Gesture Gaming
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                Choose your game mode!
              </p>
            </div>

            {/* Game Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Racing Game */}
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl border-2 border-blue-500/30 hover:border-blue-400 transition-all">
                <div className="text-5xl mb-4">🏎️</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Racing Game</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Tilt to move the car, avoid obstacles
                </p>
                
                {/* Control Mode Selection for Racing */}
                <div className="space-y-3">
                  <button
                    onClick={() => startGame('racing', 'lane')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    🎯 Lane Mode
                  </button>
                  <button
                    onClick={() => startGame('racing', 'proportional')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    📐 Analog Control
                  </button>
                </div>
                
                {highScore > 0 && (
                  <div className="mt-4 text-sm text-yellow-400">
                    Best: {highScore} points
                  </div>
                )}
              </div>

              {/* Slap Game */}
              <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-2xl border-2 border-red-500/30 hover:border-red-400 transition-all">
                <div className="text-5xl mb-4">👋</div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">Slap Game</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Slap the air fast for points! (30 seconds)
                </p>
                
                <button
                  onClick={() => startGame('slap')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Slapping!
                </button>
                
                {slapStats.slaps > 0 && (
                  <div className="mt-4 text-sm text-yellow-400">
                    Best: {slapStats.slaps} slaps @ {slapStats.maxSpeed.toFixed(1)} speed
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 pt-4 border-t border-gray-700">
              <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                <div className="font-bold text-blue-400 mb-1">Racing Controls</div>
                <div>🎮 Tilt left/right or ← → keys</div>
                <div>📐 Analog: smooth, precise control</div>
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

            <div className="text-xs text-gray-500 space-y-1">
              <p>🎮 IoT Project: ESP8266 + MPU6050 + HiveMQ Cloud</p>
              <p>Built with React + Tailwind + MQTT.js</p>
            </div>
          </div>
        </div>
      )}

      {gameState === 'racing' && (
        <GameBoard
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          gestureCommand={gestureCommand}
          controlMode={controlMode}
        />
      )}

      {gameState === 'slap' && (
        <SlapGame
          onGameEnd={handleSlapGameEnd}
          gestureCommand={gestureCommand}
        />
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 bg-gray-900/90 backdrop-blur-lg rounded-3xl border-2 border-red-500/30 shadow-2xl max-w-md mx-4 animate-bounce-slow">
            <div>
              <h2 className="text-5xl font-bold text-red-500 mb-2">
                {gameMode === 'racing' ? 'Game Over!' : 'Time\'s Up!'}
              </h2>
              <p className="text-gray-400">
                {gameMode === 'racing' ? 'You crashed! 💥' : 'Great slapping! 👋'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Final Score</p>
                <p className="text-6xl font-bold text-blue-400">{score}</p>
              </div>

              {gameMode === 'slap' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <p className="text-purple-300 text-sm">Total Slaps</p>
                    <p className="text-3xl font-bold text-purple-400">{slapStats.slaps}</p>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">Max Speed</p>
                    <p className="text-3xl font-bold text-red-400">{slapStats.maxSpeed.toFixed(1)}</p>
                  </div>
                </div>
              )}

              {gameMode === 'racing' && score >= highScore && score > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                  <p className="text-yellow-400 font-bold">🏆 New High Score!</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => startGame(gameMode, controlMode)}
                className="w-full px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
              <button
                onClick={backToMenu}
                className="w-full px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay (bottom) */}
      {(gameState === 'racing' || gameState === 'slap') && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
          <p className="text-sm text-gray-300">
            {mqttConnected ? (
              gameState === 'racing' ? (
                <>🎮 Tilt your ESP8266 controller to move</>
              ) : (
                <>👋 Slap the air with ESP8266 for points!</>
              )
            ) : (
              gameState === 'racing' ? (
                <>⌨️ Use Arrow Keys: ← Left | Right →</>
              ) : (
                <>🖱️ Click rapidly or press Space to simulate slaps</>
              )
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
