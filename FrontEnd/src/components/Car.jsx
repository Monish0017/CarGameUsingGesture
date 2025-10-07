import React from 'react';

const Car = ({ position = 0 }) => {
  // Proportional positioning based on normalized value (-1.0 to 1.0)
  // Maps to 10% (left edge) to 90% (right edge) of screen
  const getProportionalPosition = () => {
    // Convert -1.0 to 1.0 range into 10% to 90% range
    const percentage = ((position + 1.0) / 2.0) * 80 + 10;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div
      className="absolute bottom-24 transform -translate-x-1/2 transition-all duration-200 ease-out"
      style={{ zIndex: 10, left: getProportionalPosition() }}
    >
      {/* Car body */}
      <div className="relative w-16 h-24 car-shadow">
        {/* Car main body */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-lg">
          {/* Windshield */}
          <div className="absolute top-2 left-2 right-2 h-8 bg-gradient-to-b from-cyan-300 to-cyan-400 rounded-t-lg opacity-60"></div>
          
          {/* Side windows */}
          <div className="absolute top-12 left-1 w-4 h-6 bg-cyan-300 opacity-40 rounded"></div>
          <div className="absolute top-12 right-1 w-4 h-6 bg-cyan-300 opacity-40 rounded"></div>
          
          {/* Headlights */}
          <div className="absolute bottom-1 left-2 w-3 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1 right-2 w-3 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          
          {/* Racing stripe */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-white opacity-50"></div>
        </div>
        
        {/* Wheels */}
        <div className="absolute -left-1 top-4 w-3 h-6 bg-gray-900 rounded-sm border-2 border-gray-700"></div>
        <div className="absolute -right-1 top-4 w-3 h-6 bg-gray-900 rounded-sm border-2 border-gray-700"></div>
        <div className="absolute -left-1 bottom-4 w-3 h-6 bg-gray-900 rounded-sm border-2 border-gray-700"></div>
        <div className="absolute -right-1 bottom-4 w-3 h-6 bg-gray-900 rounded-sm border-2 border-gray-700"></div>
      </div>
    </div>
  );
};

export default Car;
