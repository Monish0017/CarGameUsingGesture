import React, { useState, useEffect, useRef } from 'react';

const SlapGame = ({ onGameEnd, gestureCommand, onExitGame }) => {
  const [slaps, setSlaps] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [slapCount, setSlapCount] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [maxDistance, setMaxDistance] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [recentSlap, setRecentSlap] = useState(null);
  const gameEndedRef = useRef(false);
  
  // Use refs to store latest values for game end
  const totalScoreRef = useRef(0);
  const slapCountRef = useRef(0);
  const maxSpeedRef = useRef(0);

  const MAX_SLAPS = 10; // Game ends after 10 slaps

  // Check if game should end after each slap count change
  useEffect(() => {
    if (slapCount >= MAX_SLAPS && gameActive && !gameEndedRef.current) {
      gameEndedRef.current = true;
      setGameActive(false);
      
      console.log('Game ending after 10 slaps with scores:', {
        score: totalScoreRef.current,
        slaps: slapCountRef.current,
        maxSpeed: maxSpeedRef.current
      });
      
      // Small delay to ensure UI updates before game end
      setTimeout(() => {
        onGameEnd(totalScoreRef.current, slapCountRef.current, maxSpeedRef.current);
      }, 100);
    }
  }, [slapCount, gameActive, onGameEnd]);

  // Handle slap gesture data from MQTT
  useEffect(() => {
    if (!gestureCommand || !gameActive) return;
    
    // Check if this is a slap event
    if (gestureCommand.type === 'slap') {
      const { speed, distance, points, magnitude } = gestureCommand;
      
      // Add slap to history
      const newSlap = {
        id: Date.now(),
        speed: parseFloat(speed) || 0,
        distance: parseFloat(distance) || 0,
        points: parseInt(points) || 0,
        magnitude: parseFloat(magnitude) || 0,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setSlaps(prev => [newSlap, ...prev.slice(0, 9)]); // Keep last 10 slaps
      setTotalScore(prev => {
        const newTotal = prev + newSlap.points;
        totalScoreRef.current = newTotal; // Update ref immediately
        console.log('MQTT Slap - Points:', newSlap.points, 'New total:', newTotal);
        return newTotal;
      });
      setSlapCount(prev => {
        const newCount = prev + 1;
        slapCountRef.current = newCount; // Update ref immediately
        return newCount;
      });
      
      // Update max values
      if (newSlap.speed > maxSpeed) {
        setMaxSpeed(newSlap.speed);
        maxSpeedRef.current = newSlap.speed; // Update ref immediately
      }
      if (newSlap.distance > maxDistance) setMaxDistance(newSlap.distance);
      
      // Show recent slap feedback
      setRecentSlap(newSlap);
      setTimeout(() => setRecentSlap(null), 2000);
    }
  }, [gestureCommand, gameActive, maxSpeed, maxDistance]);

  // Keyboard/Mouse testing controls
  useEffect(() => {
    if (!gameActive) return;

    const simulateSlap = () => {
      const randomSpeed = 5 + Math.random() * 15; // 5-20
      const randomDistance = 3 + Math.random() * 7; // 3-10
      const points = Math.round(randomSpeed * 10 + randomDistance * 5);
      
      const newSlap = {
        id: Date.now(),
        speed: randomSpeed,
        distance: randomDistance,
        points: points,
        magnitude: randomSpeed * 1.5,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setSlaps(prev => [newSlap, ...prev.slice(0, 9)]);
      setTotalScore(prev => {
        const newTotal = prev + newSlap.points;
        totalScoreRef.current = newTotal; // Update ref immediately
        console.log('Test Slap - Points:', newSlap.points, 'New total:', newTotal);
        return newTotal;
      });
      setSlapCount(prev => {
        const newCount = prev + 1;
        slapCountRef.current = newCount; // Update ref immediately
        return newCount;
      });
      
      if (newSlap.speed > maxSpeed) {
        setMaxSpeed(newSlap.speed);
        maxSpeedRef.current = newSlap.speed; // Update ref immediately
      }
      if (newSlap.distance > maxDistance) setMaxDistance(newSlap.distance);
      
      setRecentSlap(newSlap);
      setTimeout(() => setRecentSlap(null), 2000);
    };

    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        simulateSlap();
      }
    };

    const handleClick = () => {
      simulateSlap();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [gameActive, maxSpeed, maxDistance]);

  // Calculate quality rating
  const getSlapRating = (points) => {
    if (points > 200) return { text: '🔥 LEGENDARY!', color: 'text-red-500' };
    if (points > 150) return { text: '⚡ AMAZING!', color: 'text-yellow-400' };
    if (points > 100) return { text: '💪 GREAT!', color: 'text-blue-400' };
    if (points > 50) return { text: '👍 GOOD', color: 'text-green-400' };
    return { text: '👋 NICE', color: 'text-gray-400' };
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Exit Game Button */}
      <button
        onClick={onExitGame}
        className="absolute top-4 left-4 z-30 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg border border-red-500"
        title="Exit to Menu"
      >
        ✕ Exit Game
      </button>

      {/* Timer and Stats Header */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 pt-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Slaps Remaining */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border-2 border-purple-500/30">
            <div className="text-sm text-purple-300">Slaps Remaining</div>
            <div className={`text-4xl font-bold ${slapCount >= 8 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
              {MAX_SLAPS - slapCount}
            </div>
          </div>

          {/* Score */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border-2 border-yellow-500/30">
            <div className="text-sm text-yellow-300">Total Score</div>
            <div className="text-4xl font-bold text-yellow-400">{totalScore}</div>
          </div>

          {/* Slap Count */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border-2 border-blue-500/30">
            <div className="text-sm text-blue-300">Slaps</div>
            <div className="text-4xl font-bold text-blue-400">{slapCount}</div>
          </div>

          {/* Max Speed */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border-2 border-red-500/30">
            <div className="text-sm text-red-300">Max Speed</div>
            <div className="text-3xl font-bold text-red-400">{maxSpeed.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Recent Slap Feedback */}
        {recentSlap && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce z-30 px-4">
            <div className="bg-black/80 backdrop-blur-lg rounded-3xl p-6 md:p-8 border-4 border-yellow-400 shadow-2xl max-w-md">
              <div className={`text-4xl md:text-6xl font-bold mb-3 md:mb-4 ${getSlapRating(recentSlap.points).color}`}>
                {getSlapRating(recentSlap.points).text}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                +{recentSlap.points} POINTS!
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4 text-base md:text-lg">
                <div className="text-purple-300">
                  Speed: <span className="text-white font-bold">{recentSlap.speed.toFixed(1)}</span>
                </div>
                <div className="text-purple-300">
                  Distance: <span className="text-white font-bold">{recentSlap.distance.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {gameActive && slapCount === 0 && (
          <div className="text-center space-y-6">
            <div className="text-8xl animate-bounce">👋</div>
            <div className="text-5xl font-bold text-white neon-text">
              SLAP THE AIR!
            </div>
            <div className="text-2xl text-purple-300">
              Complete 10 slaps as fast as you can!
            </div>
            <div className="text-xl text-gray-400">
              Faster & Further = More Points!
            </div>
          </div>
        )}
      </div>

      {/* Slap History */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="max-w-5xl mx-auto bg-black/50 backdrop-blur-md rounded-2xl p-3 md:p-4 border-2 border-purple-500/30">
          <div className="text-base md:text-lg font-bold text-purple-300 mb-2">Recent Slaps</div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
            {slaps.map((slap) => (
              <div 
                key={slap.id}
                className="bg-purple-900/50 rounded-lg p-2 border border-purple-500/30 text-center"
              >
                <div className="text-lg md:text-xl font-bold text-yellow-400">+{slap.points}</div>
                <div className="text-xs text-purple-300">
                  S: {slap.speed.toFixed(1)} | D: {slap.distance.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated background circles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-purple-500/20"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `pulse ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SlapGame;
