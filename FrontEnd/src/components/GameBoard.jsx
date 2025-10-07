import React, { useState, useEffect, useRef } from 'react';
import Car from './Car';
import Obstacle from './Obstacle';

const GameBoard = ({ onGameOver, onScoreUpdate, gestureCommand, difficultyLevel = 'intermediate', onExitGame }) => {
  const [carPosition, setCarPosition] = useState(0.0); // -1.0 to 1.0 - analog control only
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const [difficulty, setDifficulty] = useState(1); // Progressive difficulty level based on score
  const gameLoopRef = useRef(null);
  const obstacleIdRef = useRef(0);

  // Difficulty configurations based on selected level
  const difficultyConfig = {
    beginner: {
      spawnInterval: 6000,   // Every 6 seconds
      obstacleSpeed: 2.0,    // Slower obstacles
      label: '🟢 Easy'
    },
    intermediate: {
      spawnInterval: 4000,   // Every 4 seconds
      obstacleSpeed: 2.5,    // Medium speed
      label: '🟡 Medium'
    },
    complex: {
      spawnInterval: 2000,   // Every 2 seconds
      obstacleSpeed: 3.5,    // Fast obstacles
      label: '🔴 Hard'
    }
  };

  const config = difficultyConfig[difficultyLevel] || difficultyConfig.intermediate;

  // Handle gesture commands from MQTT
  useEffect(() => {
    if (!gestureCommand || !gameRunning) return;

    // Analog/Proportional control based on normalized accelerometer value
    if (gestureCommand.normX !== undefined) {
      // Full range movement: -1.0 (left edge) to +1.0 (right edge)
      // Clamp to ensure it stays within bounds
      const clampedPosition = Math.max(-1.0, Math.min(1.0, gestureCommand.normX));
      setCarPosition(clampedPosition);
    }
  }, [gestureCommand, gameRunning]);

  // Keyboard controls for testing (analog only)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning) return;
      
      // Arrow keys move by increments - full range allowed
      if (e.key === 'ArrowLeft') {
        setCarPosition(prev => Math.max(-1.0, prev - 0.08)); // Move left, stop at -1.0
      } else if (e.key === 'ArrowRight') {
        setCarPosition(prev => Math.min(1.0, prev + 0.08)); // Move right, stop at +1.0
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning]);

  // Update difficulty based on score
  useEffect(() => {
    const newDifficulty = Math.floor(score / 50) + 1; // Increase every 50 points
    setDifficulty(Math.min(newDifficulty, 5)); // Cap at level 5
  }, [score]);

  // Game loop
  useEffect(() => {
    if (!gameRunning) return;

    const obstacleTypes = ['cone', 'barrel', 'rock'];

    // Get spawn interval based on difficulty level
    let spawnInterval;
    let baseSpeed;
    
    if (difficultyLevel === 'beginner') {
      spawnInterval = 6000; // 6 seconds
      baseSpeed = 2.0;
    } else if (difficultyLevel === 'intermediate') {
      spawnInterval = 4000; // 4 seconds
      baseSpeed = 2.5;
    } else { // complex/hard
      spawnInterval = 2000; // 2 seconds
      baseSpeed = 3.5;
    }
    
    const obstacleSpeed = baseSpeed + (difficulty - 1) * 0.3; // Progressive speed increase

    console.log(`🎮 Game started! Difficulty: ${difficultyLevel}, Spawn every: ${spawnInterval}ms, Speed: ${obstacleSpeed}`);

    // Generate obstacles at fixed intervals
    const obstacleInterval = setInterval(() => {
      console.log('🚧 Spawning obstacle...');
      
      // Spawn obstacle in a random lane
      const randomLane = Math.floor(Math.random() * 3);
      const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      setObstacles(prev => [
        ...prev,
        {
          id: obstacleIdRef.current++,
          lane: randomLane,
          position: -10,
          type: randomType,
        }
      ]);
    }, spawnInterval);

    // Move obstacles and check collisions
    gameLoopRef.current = setInterval(() => {
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          position: obs.position + obstacleSpeed,
        }));

        // Check collision
        const collision = updated.some(obs => {
          // Analog mode: check if car position overlaps with obstacle
          // Convert lane to position range for obstacles
          const laneCenterPositions = [-0.65, 0.0, 0.65]; // Lane centers
          const obstaclePosX = laneCenterPositions[obs.lane];
          const carPosX = carPosition;
          
          // Collision if within collision radius and obstacle at car's Y position
          const collisionRadius = 0.25; // Tighter collision detection
          return Math.abs(carPosX - obstaclePosX) < collisionRadius && obs.position >= 70 && obs.position <= 95;
        });

        if (collision) {
          setGameRunning(false);
          onGameOver();
          return prev;
        }

        // Remove off-screen obstacles and update score
        const filtered = updated.filter(obs => {
          if (obs.position > 100) {
            setScore(s => {
              const newScore = s + 10;
              onScoreUpdate(newScore);
              return newScore;
            });
            return false;
          }
          return true;
        });

        return filtered;
      });
    }, 50);

    return () => {
      clearInterval(obstacleInterval);
      clearInterval(gameLoopRef.current);
    };
  }, [gameRunning, onGameOver, onScoreUpdate, difficulty, difficultyLevel]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Exit Game Button */}
      <button
        onClick={onExitGame}
        className="absolute top-4 left-4 z-30 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg border border-red-500"
        title="Exit to Menu"
      >
        ✕ Exit Game
      </button>

      {/* Difficulty Indicator */}
      <div className="absolute top-20 right-4 z-30 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
        <div className="text-xs text-gray-400">{config.label}</div>
        <div className="text-sm font-bold text-purple-300 mb-1">Progressive</div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < difficulty ? 'bg-red-500' : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
        <div className="text-xs text-purple-400 mt-1">Level {difficulty}/5</div>
      </div>

      {/* Road */}
      <div className="absolute inset-0 flex justify-center">
        <div className="relative w-full max-w-2xl h-full bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900">
          {/* Road lanes */}
          <div className="absolute left-[33.33%] top-0 bottom-0 w-1 bg-yellow-400 opacity-40"></div>
          <div className="absolute left-[66.66%] top-0 bottom-0 w-1 bg-yellow-400 opacity-40"></div>
          
          {/* Animated road lines */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="road-line absolute left-1/2 transform -translate-x-1/2 w-2 h-16 bg-white opacity-50"
              style={{
                top: `${i * 15 - 10}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
          
          {/* Side decorations */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-green-900 to-transparent opacity-60"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-green-900 to-transparent opacity-60"></div>

          {/* Car */}
          <Car 
            position={carPosition}
          />

          {/* Obstacles */}
          {obstacles.map(obstacle => (
            <Obstacle
              key={obstacle.id}
              position={obstacle.position}
              lane={obstacle.lane}
              type={obstacle.type}
            />
          ))}
        </div>
      </div>

      {/* Speed effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30"></div>
      </div>
    </div>
  );
};

export default GameBoard;
