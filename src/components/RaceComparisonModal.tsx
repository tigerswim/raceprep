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
      <div
        className="bg-terminal-panel border-2 border-terminal-border max-w-6xl w-full max-h-[90vh] overflow-auto"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary font-mono tracking-wider">
              RACE COMPARISON
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {compareRaces.map(({ race, bestResult }, index) => (
              <div
                key={race.id}
                className="bg-terminal-panel border-2 border-terminal-border p-6"
                style={{ borderRadius: 0 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1 font-mono tracking-wider">
                      {race.name}
                    </h3>
                    <p className="text-text-primary text-xs font-mono">
                      {race.location} • {race.date}
                    </p>
                    <p className="text-text-secondary text-xs font-mono uppercase">
                      {race.distance_type}
                    </p>
                  </div>
                  <button
                    onClick={() => removeRace(race.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-mono tracking-wider uppercase"
                  >
                    REMOVE
                  </button>
                </div>

                {bestResult && (
                  <div className="space-y-4">
                    {/* Overall Time */}
                    <div
                      className="bg-terminal-panel border-2 border-accent-yellow p-3 text-center"
                      style={{ borderRadius: 0 }}
                    >
                      <div className="text-text-secondary text-xs mb-1 font-mono tracking-wider uppercase">
                        TOTAL TIME
                      </div>
                      <div className="text-2xl font-bold text-accent-yellow font-mono">
                        {formatTime(bestResult.overall_time)}
                      </div>
                    </div>

                    {/* Split Times */}
                    <div className="space-y-2">
                      <div
                        className="bg-terminal-panel border-2 border-discipline-swim p-2 flex justify-between"
                        style={{ borderRadius: 0 }}
                      >
                        <span className="text-discipline-swim text-xs font-mono tracking-wider uppercase">
                          🏊‍♂️ SWIM
                        </span>
                        <span className="text-text-primary font-mono text-xs">
                          {formatTime(bestResult.swim_time)}
                        </span>
                      </div>
                      <div
                        className="bg-terminal-panel border-2 border-terminal-border p-2 flex justify-between"
                        style={{ borderRadius: 0 }}
                      >
                        <span className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                          T1
                        </span>
                        <span className="text-text-primary font-mono text-xs">
                          {formatTime(bestResult.t1_time)}
                        </span>
                      </div>
                      <div
                        className="bg-terminal-panel border-2 border-discipline-bike p-2 flex justify-between"
                        style={{ borderRadius: 0 }}
                      >
                        <span className="text-discipline-bike text-xs font-mono tracking-wider uppercase">
                          🚴‍♂️ BIKE
                        </span>
                        <span className="text-text-primary font-mono text-xs">
                          {formatTime(bestResult.bike_time)}
                        </span>
                      </div>
                      <div
                        className="bg-terminal-panel border-2 border-terminal-border p-2 flex justify-between"
                        style={{ borderRadius: 0 }}
                      >
                        <span className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                          T2
                        </span>
                        <span className="text-text-primary font-mono text-xs">
                          {formatTime(bestResult.t2_time)}
                        </span>
                      </div>
                      <div
                        className="bg-terminal-panel border-2 border-discipline-run p-2 flex justify-between"
                        style={{ borderRadius: 0 }}
                      >
                        <span className="text-discipline-run text-xs font-mono tracking-wider uppercase">
                          🏃‍♂️ RUN
                        </span>
                        <span className="text-text-primary font-mono text-xs">
                          {formatTime(bestResult.run_time)}
                        </span>
                      </div>
                    </div>

                    {/* Placements */}
                    {(bestResult.overall_placement || bestResult.age_group_placement) && (
                      <div className="grid grid-cols-2 gap-2">
                        {bestResult.overall_placement && (
                          <div
                            className="bg-terminal-panel border-2 border-accent-yellow p-2 text-center"
                            style={{ borderRadius: 0 }}
                          >
                            <div className="text-accent-yellow text-xs font-mono tracking-wider uppercase">
                              OVERALL
                            </div>
                            <div className="text-accent-yellow font-bold font-mono">
                              #{bestResult.overall_placement}
                            </div>
                          </div>
                        )}
                        {bestResult.age_group_placement && (
                          <div
                            className="bg-terminal-panel border-2 border-text-secondary p-2 text-center"
                            style={{ borderRadius: 0 }}
                          >
                            <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                              AGE GROUP
                            </div>
                            <div className="text-text-primary font-bold font-mono">
                              #{bestResult.age_group_placement}
                            </div>
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
            <div
              className="mt-8 bg-terminal-panel border-2 border-terminal-border p-6"
              style={{ borderRadius: 0 }}
            >
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                📊 QUICK COMPARISON
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fastest Overall */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-run p-4"
                  style={{ borderRadius: 0 }}
                >
                  <div className="text-discipline-run text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    🏆 FASTEST OVERALL
                  </div>
                  {(() => {
                    const fastest = compareRaces.reduce((fastest, current) => {
                      if (!fastest.bestResult?.overall_time) return current;
                      if (!current.bestResult?.overall_time) return fastest;

                      return timeToSeconds(current.bestResult.overall_time) < timeToSeconds(fastest.bestResult.overall_time)
                        ? current : fastest;
                    });

                    return (
                      <div>
                        <div className="text-text-primary font-semibold text-xs font-mono">
                          {fastest.race.name}
                        </div>
                        <div className="text-discipline-run font-mono text-sm">
                          {formatTime(fastest.bestResult?.overall_time)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Best Swim */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-swim p-4"
                  style={{ borderRadius: 0 }}
                >
                  <div className="text-discipline-swim text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    🏊‍♂️ BEST SWIM
                  </div>
                  {(() => {
                    const bestSwim = compareRaces.reduce((best, current) => {
                      if (!best.bestResult?.swim_time) return current;
                      if (!current.bestResult?.swim_time) return best;

                      return timeToSeconds(current.bestResult.swim_time) < timeToSeconds(best.bestResult.swim_time)
                        ? current : best;
                    });

                    return (
                      <div>
                        <div className="text-text-primary font-semibold text-xs font-mono">
                          {bestSwim.race.name}
                        </div>
                        <div className="text-discipline-swim font-mono text-sm">
                          {formatTime(bestSwim.bestResult?.swim_time)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Best Bike */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-bike p-4"
                  style={{ borderRadius: 0 }}
                >
                  <div className="text-discipline-bike text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    🚴‍♂️ BEST BIKE
                  </div>
                  {(() => {
                    const bestBike = compareRaces.reduce((best, current) => {
                      if (!best.bestResult?.bike_time) return current;
                      if (!current.bestResult?.bike_time) return best;

                      return timeToSeconds(current.bestResult.bike_time) < timeToSeconds(best.bestResult.bike_time)
                        ? current : best;
                    });

                    return (
                      <div>
                        <div className="text-text-primary font-semibold text-xs font-mono">
                          {bestBike.race.name}
                        </div>
                        <div className="text-discipline-bike font-mono text-sm">
                          {formatTime(bestBike.bestResult?.bike_time)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Best Run */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-run p-4"
                  style={{ borderRadius: 0 }}
                >
                  <div className="text-discipline-run text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    🏃‍♂️ BEST RUN
                  </div>
                  {(() => {
                    const bestRun = compareRaces.reduce((best, current) => {
                      if (!best.bestResult?.run_time) return current;
                      if (!current.bestResult?.run_time) return best;

                      return timeToSeconds(current.bestResult.run_time) < timeToSeconds(best.bestResult.run_time)
                        ? current : best;
                    });

                    return (
                      <div>
                        <div className="text-text-primary font-semibold text-xs font-mono">
                          {bestRun.race.name}
                        </div>
                        <div className="text-discipline-run font-mono text-sm">
                          {formatTime(bestRun.bestResult?.run_time)}
                        </div>
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
              className="bg-terminal-panel border-2 border-red-400 text-red-400 px-4 py-2 font-medium hover:bg-red-400/10 transition-colors font-mono tracking-wider"
              style={{ borderRadius: 0 }}
            >
              CLEAR ALL
            </button>
            <button
              onClick={onClose}
              className="bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider"
              style={{ borderRadius: 0 }}
            >
              CLOSE COMPARISON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
