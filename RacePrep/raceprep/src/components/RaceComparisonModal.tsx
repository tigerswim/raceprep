import React from 'react';

interface RaceComparisonModalProps {
  onClose: () => void;
  races: any[];
  raceResults: any[];
  comparingRaces: string[];
  setComparingRaces: (races: string[]) => void;
}

export const RaceComparisonModal: React.FC<RaceComparisonModalProps> = ({ 
  onClose, 
  races, 
  raceResults, 
  comparingRaces, 
  setComparingRaces 
}) => {

  const getResultsForRace = (raceId: string) => {
    return raceResults.filter(result => result.race_id === raceId);
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  const timeToSeconds = (timeStr: string | null) => {
    if (!timeStr) return 0;
    const [hours, minutes, seconds] = timeStr.split(':').map(n => parseInt(n) || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const getBestResultForRace = (raceId: string) => {
    const results = getResultsForRace(raceId);
    if (results.length === 0) return null;
    
    return results.sort((a, b) => {
      const timeA = a.overall_time || '99:99:99';
      const timeB = b.overall_time || '99:99:99';
      return timeA.localeCompare(timeB);
    })[0];
  };

  const compareRaces = comparingRaces.map(raceId => {
    const race = races.find(r => r.id === raceId);
    const bestResult = getBestResultForRace(raceId);
    return { race, bestResult };
  }).filter(item => item.race && item.bestResult);

  const removeRace = (raceId: string) => {
    setComparingRaces(comparingRaces.filter(id => id !== raceId));
  };

  if (compareRaces.length === 0) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Race Comparison</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {compareRaces.map(({ race, bestResult }, index) => (
              <div key={race.id} className="bg-white/5 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{race.name}</h3>
                    <p className="text-white/70 text-sm">{race.location} • {race.date}</p>
                    <p className="text-white/60 text-sm capitalize">{race.distance_type}</p>
                  </div>
                  <button
                    onClick={() => removeRace(race.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {bestResult && (
                  <div className="space-y-4">
                    {/* Overall Time */}
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-white/70 text-sm mb-1">Total Time</div>
                      <div className="text-2xl font-bold text-white font-mono">
                        {formatTime(bestResult.overall_time)}
                      </div>
                    </div>

                    {/* Split Times */}
                    <div className="space-y-2">
                      <div className="bg-blue-500/10 rounded-lg p-2 flex justify-between">
                        <span className="text-blue-400 text-sm">🏊‍♂️ Swim</span>
                        <span className="text-white font-mono text-sm">{formatTime(bestResult.swim_time)}</span>
                      </div>
                      <div className="bg-gray-500/10 rounded-lg p-2 flex justify-between">
                        <span className="text-gray-400 text-sm">T1</span>
                        <span className="text-white font-mono text-sm">{formatTime(bestResult.t1_time)}</span>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-2 flex justify-between">
                        <span className="text-orange-400 text-sm">🚴‍♂️ Bike</span>
                        <span className="text-white font-mono text-sm">{formatTime(bestResult.bike_time)}</span>
                      </div>
                      <div className="bg-gray-500/10 rounded-lg p-2 flex justify-between">
                        <span className="text-gray-400 text-sm">T2</span>
                        <span className="text-white font-mono text-sm">{formatTime(bestResult.t2_time)}</span>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2 flex justify-between">
                        <span className="text-green-400 text-sm">🏃‍♂️ Run</span>
                        <span className="text-white font-mono text-sm">{formatTime(bestResult.run_time)}</span>
                      </div>
                    </div>

                    {/* Placements */}
                    {(bestResult.overall_placement || bestResult.age_group_placement) && (
                      <div className="grid grid-cols-2 gap-2">
                        {bestResult.overall_placement && (
                          <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                            <div className="text-yellow-400 text-xs">Overall</div>
                            <div className="text-white font-bold">#{bestResult.overall_placement}</div>
                          </div>
                        )}
                        {bestResult.age_group_placement && (
                          <div className="bg-purple-500/10 rounded-lg p-2 text-center">
                            <div className="text-purple-400 text-xs">Age Group</div>
                            <div className="text-white font-bold">#{bestResult.age_group_placement}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Summary */}
          {compareRaces.length > 1 && (
            <div className="mt-8 bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Quick Comparison</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fastest Overall */}
                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="text-green-400 text-sm font-medium mb-2">🏆 Fastest Overall</div>
                  {(() => {
                    const fastest = compareRaces.reduce((fastest, current) => {
                      if (!fastest.bestResult?.overall_time) return current;
                      if (!current.bestResult?.overall_time) return fastest;
                      
                      return timeToSeconds(current.bestResult.overall_time) < timeToSeconds(fastest.bestResult.overall_time) 
                        ? current : fastest;
                    });
                    
                    return (
                      <div>
                        <div className="text-white font-semibold text-sm">{fastest.race.name}</div>
                        <div className="text-green-300 font-mono">{formatTime(fastest.bestResult?.overall_time)}</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Best Swim */}
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <div className="text-blue-400 text-sm font-medium mb-2">🏊‍♂️ Best Swim</div>
                  {(() => {
                    const bestSwim = compareRaces.reduce((best, current) => {
                      if (!best.bestResult?.swim_time) return current;
                      if (!current.bestResult?.swim_time) return best;
                      
                      return timeToSeconds(current.bestResult.swim_time) < timeToSeconds(best.bestResult.swim_time) 
                        ? current : best;
                    });
                    
                    return (
                      <div>
                        <div className="text-white font-semibold text-sm">{bestSwim.race.name}</div>
                        <div className="text-blue-300 font-mono">{formatTime(bestSwim.bestResult?.swim_time)}</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Best Bike */}
                <div className="bg-orange-500/10 rounded-lg p-4">
                  <div className="text-orange-400 text-sm font-medium mb-2">🚴‍♂️ Best Bike</div>
                  {(() => {
                    const bestBike = compareRaces.reduce((best, current) => {
                      if (!best.bestResult?.bike_time) return current;
                      if (!current.bestResult?.bike_time) return best;
                      
                      return timeToSeconds(current.bestResult.bike_time) < timeToSeconds(best.bestResult.bike_time) 
                        ? current : best;
                    });
                    
                    return (
                      <div>
                        <div className="text-white font-semibold text-sm">{bestBike.race.name}</div>
                        <div className="text-orange-300 font-mono">{formatTime(bestBike.bestResult?.bike_time)}</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Best Run */}
                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="text-green-400 text-sm font-medium mb-2">🏃‍♂️ Best Run</div>
                  {(() => {
                    const bestRun = compareRaces.reduce((best, current) => {
                      if (!best.bestResult?.run_time) return current;
                      if (!current.bestResult?.run_time) return best;
                      
                      return timeToSeconds(current.bestResult.run_time) < timeToSeconds(best.bestResult.run_time) 
                        ? current : best;
                    });
                    
                    return (
                      <div>
                        <div className="text-white font-semibold text-sm">{bestRun.race.name}</div>
                        <div className="text-green-300 font-mono">{formatTime(bestRun.bestResult?.run_time)}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setComparingRaces([])}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};