import React, { useState, useEffect, useRef } from 'react';
import Car from './Car';
import Obstacle from './Obstacle';

const GameBoard = ({ onGameOver, onScoreUpdate, gestureCommand, controlMode = 'lane' }) => {
  const [carLane, setCarLane] = useState(1); // 0, 1, 2 (left, center, right) - for lane mode
  const [carPosition, setCarPosition] = useState(0.0); // -1.0 to 1.0 - for proportional mode
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const gameLoopRef = useRef(null);
  const obstacleIdRef = useRef(0);

  // Handle gesture commands from MQTT
  useEffect(() => {
    if (!gestureCommand || !gameRunning) return;

    if (controlMode === 'proportional') {
      // Proportional control based on normalized accelerometer value
      if (gestureCommand.normX !== undefined) {
        setCarPosition(gestureCommand.normX); // Direct mapping
      }
    } else {
      // Lane-based control (original behavior)
      const gesture = gestureCommand.gesture || gestureCommand;
      if (gesture === 'left' && carLane > 0) {
        setCarLane(prev => prev - 1);
      } else if (gesture === 'right' && carLane < 2) {
        setCarLane(prev => prev + 1);
      }
    }
  }, [gestureCommand, carLane, carPosition, gameRunning, controlMode]);

  // Keyboard controls for testing
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning) return;
      
      if (controlMode === 'proportional') {
        // Arrow keys move by increments in proportional mode
        if (e.key === 'ArrowLeft') {
          setCarPosition(prev => Math.max(-1.0, prev - 0.1));
        } else if (e.key === 'ArrowRight') {
          setCarPosition(prev => Math.min(1.0, prev + 0.1));
        }
      } else {
        // Lane-based movement
        if (e.key === 'ArrowLeft' && carLane > 0) {
          setCarLane(prev => prev - 1);
        } else if (e.key === 'ArrowRight' && carLane < 2) {
          setCarLane(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [carLane, carPosition, gameRunning, controlMode]);

  // Game loop
  useEffect(() => {
    if (!gameRunning) return;

    const obstacleTypes = ['cone', 'barrel', 'rock'];

    // Generate obstacles
    const obstacleInterval = setInterval(() => {
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
    }, 1500);

    // Move obstacles and check collisions
    gameLoopRef.current = setInterval(() => {
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          position: obs.position + 2,
        }));

        // Check collision
        const collision = updated.some(obs => {
          if (controlMode === 'proportional') {
            // Proportional mode: check if car position overlaps with obstacle
            // Convert lane to position range
            const laneCenterPositions = [-0.6, 0.0, 0.6]; // Approximate lane centers
            const obstaclePosX = laneCenterPositions[obs.lane];
            const carPosX = carPosition;
            
            // Collision if within ~0.3 units and obstacle at car's Y position
            return Math.abs(carPosX - obstaclePosX) < 0.3 && obs.position >= 70 && obs.position <= 95;
          } else {
            // Lane mode: exact lane match
            return obs.lane === carLane && obs.position >= 70 && obs.position <= 95;
          }
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
  }, [gameRunning, carLane, carPosition, onGameOver, onScoreUpdate, controlMode]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
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
            lane={carLane} 
            position={carPosition}
            useProportional={controlMode === 'proportional'}
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
