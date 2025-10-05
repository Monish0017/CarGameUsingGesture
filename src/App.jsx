import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import mqttService from './services/mqttService';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [gestureCommand, setGestureCommand] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('carGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
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
      mqttService.onGesture((gesture) => {
        setGestureCommand(gesture);
        // Clear gesture after a short delay
        setTimeout(() => setGestureCommand(''), 100);
      });
    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      setMqttConnected(false);
      setConnectionStatus('Connection Failed - Using Keyboard');
    }
  };

  const startGame = () => {
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('carGameHighScore', score.toString());
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
        </div>
      </div>

      {/* Game States */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center space-y-8 p-8 bg-gray-900/80 backdrop-blur-lg rounded-3xl border-2 border-blue-500/30 shadow-2xl max-w-2xl mx-4">
            <div>
              <h2 className="text-6xl font-bold neon-text mb-4">
                Gesture Racing
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                Control your car with ESP8266 gestures!
              </p>
              <p className="text-sm text-gray-400">
                Tilt left/right to move • Avoid obstacles • Score points
              </p>
            </div>

            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                <span className="text-2xl">⬅️</span>
                <span>Tilt Left</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                <span className="text-2xl">➡️</span>
                <span>Tilt Right</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startGame}
                className="w-full px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-2xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                Start Game
              </button>

              {!mqttConnected && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ ESP8266 not connected. Use keyboard arrows for testing.
                  </p>
                </div>
              )}
            </div>

            {highScore > 0 && (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400">High Score</p>
                <p className="text-4xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>🎮 IoT Project: ESP8266 + MPU6050 + HiveMQ Cloud</p>
              <p>Built with React + Tailwind + MQTT.js</p>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <GameBoard
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          gestureCommand={gestureCommand}
        />
      )}

      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 bg-gray-900/90 backdrop-blur-lg rounded-3xl border-2 border-red-500/30 shadow-2xl max-w-md mx-4 animate-bounce-slow">
            <div>
              <h2 className="text-5xl font-bold text-red-500 mb-2">
                Game Over!
              </h2>
              <p className="text-gray-400">You crashed! 💥</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Final Score</p>
                <p className="text-6xl font-bold text-blue-400">{score}</p>
              </div>

              {score > highScore && score === highScore && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                  <p className="text-yellow-400 font-bold">🏆 New High Score!</p>
                </div>
              )}

              {score === highScore && score > 0 && (
                <div className="bg-yellow-500/10 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Best Score</p>
                  <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={startGame}
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
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
          <p className="text-sm text-gray-300">
            {mqttConnected ? (
              <>🎮 Tilt your ESP8266 controller to move</>
            ) : (
              <>⌨️ Use Arrow Keys: ← Left | Right →</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
