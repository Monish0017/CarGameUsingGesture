import React from 'react';

const Obstacle = ({ position, lane, type }) => {
  const lanePositions = {
    0: 'left-[15%]',
    1: 'left-[42.5%]',
    2: 'left-[70%]',
  };

  const obstacleTypes = {
    cone: {
      color: 'bg-gradient-to-b from-orange-400 to-orange-600',
      shape: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    },
    barrel: {
      color: 'bg-gradient-to-b from-red-500 to-red-700',
      shape: 'rounded-lg',
    },
    rock: {
      color: 'bg-gradient-to-b from-gray-600 to-gray-800',
      shape: 'rounded-full',
    },
  };

  const currentType = obstacleTypes[type] || obstacleTypes.cone;

  return (
    <div
      className={`absolute ${lanePositions[lane]} transform -translate-x-1/2`}
      style={{ 
        top: `${position}%`,
        zIndex: 5,
      }}
    >
      {type === 'cone' ? (
        <div className="relative w-12 h-16">
          <div
            className={`w-full h-full ${currentType.color}`}
            style={{ clipPath: currentType.shape }}
          >
            {/* Cone stripes */}
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-white opacity-70"></div>
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-white opacity-70"></div>
          </div>
          {/* Cone base */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-14 h-2 bg-gray-800 rounded-full"></div>
        </div>
      ) : type === 'barrel' ? (
        <div className="relative w-12 h-16">
          <div className={`w-full h-full ${currentType.color} ${currentType.shape} shadow-lg`}>
            {/* Barrel bands */}
            <div className="absolute top-2 left-0 right-0 h-1 bg-yellow-400"></div>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400"></div>
            <div className="absolute bottom-2 left-0 right-0 h-1 bg-yellow-400"></div>
          </div>
        </div>
      ) : (
        <div className={`w-14 h-14 ${currentType.color} ${currentType.shape} shadow-xl`}>
          {/* Rock texture */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 left-2 w-3 h-3 bg-gray-700 rounded-full"></div>
            <div className="absolute bottom-3 right-2 w-4 h-4 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Obstacle;
