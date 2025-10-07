import { useState, useEffect } from 'react';
import authService from '../services/authService';

export default function Leaderboard({ onBack }) {
  const [gameMode, setGameMode] = useState('racing');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchLeaderboard();
  }, [gameMode]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.getLeaderboard(gameMode, 20);
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">🏆 Leaderboard</h1>
          <p className="text-gray-300 text-base md:text-lg">Top Players Worldwide</p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex justify-center gap-3 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setGameMode('racing')}
            className={`px-6 md:px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 text-sm md:text-base ${
              gameMode === 'racing'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            🏎️ Racing
          </button>
          <button
            onClick={() => setGameMode('slap')}
            className={`px-6 md:px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 text-sm md:text-base ${
              gameMode === 'slap'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            👋 Slap Game
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No scores yet. Be the first!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-purple-300">Rank</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-purple-300">Player</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-purple-300">Score</th>
                    {gameMode === 'slap' && (
                      <>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-purple-300">Slaps</th>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-purple-300 hidden md:table-cell">Max Speed</th>
                      </>
                    )}
                    {gameMode === 'racing' && (
                      <>
                        <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-purple-300 hidden lg:table-cell">Difficulty</th>
                      </>
                    )}
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-purple-300 hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = currentUser && entry.userId === currentUser.id;
                    return (
                      <tr
                        key={index}
                        className={`border-t border-gray-700/50 transition ${
                          isCurrentUser
                            ? 'bg-purple-600/20 hover:bg-purple-600/30'
                            : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <td className="px-3 md:px-6 py-3 md:py-4 text-left">
                          <span className="text-xl md:text-2xl">{getRankIcon(index)}</span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`font-bold text-sm md:text-base ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                            {entry.username}
                            {isCurrentUser && ' (You)'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                          <span className="text-lg md:text-xl font-bold text-yellow-400">{entry.score}</span>
                        </td>
                        {gameMode === 'slap' && (
                          <>
                            <td className="px-3 md:px-6 py-3 md:py-4 text-right text-gray-300">
                              {entry.totalSlaps || 0}
                            </td>
                            <td className="px-3 md:px-6 py-3 md:py-4 text-right text-gray-300 hidden md:table-cell">
                              {entry.maxSpeed?.toFixed(1) || '0.0'}
                            </td>
                          </>
                        )}
                        {gameMode === 'racing' && (
                          <>
                            <td className="px-3 md:px-6 py-3 md:py-4 text-center hidden lg:table-cell">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                entry.difficultyLevel === 'complex' ? 'bg-red-600/30 text-red-300' :
                                entry.difficultyLevel === 'beginner' ? 'bg-green-600/30 text-green-300' :
                                'bg-yellow-600/30 text-yellow-300'
                              }`}>
                                {entry.difficultyLevel === 'complex' ? '🔴 Hard' :
                                 entry.difficultyLevel === 'beginner' ? '🟢 Easy' :
                                 '🟡 Medium'}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-3 md:px-6 py-3 md:py-4 text-right text-gray-400 text-xs md:text-sm hidden sm:table-cell">
                          {formatDate(entry.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 md:mt-8 text-center">
          <button
            onClick={onBack}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 md:px-8 rounded-lg transition transform hover:scale-105 border border-purple-500/30 shadow-lg"
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
