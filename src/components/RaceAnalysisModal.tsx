import React from 'react';
import {
  TbSwimming,
  TbBike,
  TbRun,
  TbChartBar,
  TbTrophy
} from 'react-icons/tb';

interface RaceAnalysisModalProps {
  onClose: () => void;
  result: any;
  races: any[];
}

export const RaceAnalysisModal: React.FC<RaceAnalysisModalProps> = ({ onClose, result, races }) => {

  if (!result) return null;

  const race = races.find(r => r.id === result.race_id);
  
  const timeToSeconds = (timeStr: string | null) => {
    if (!timeStr) return 0;
    const [hours, minutes, seconds] = timeStr.split(':').map(n => parseInt(n) || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  const calculateSplitPercentages = () => {
    const totalSeconds = timeToSeconds(result.overall_time);
    if (totalSeconds === 0) return null;

    const swimSeconds = timeToSeconds(result.swim_time);
    const t1Seconds = timeToSeconds(result.t1_time);
    const bikeSeconds = timeToSeconds(result.bike_time);
    const t2Seconds = timeToSeconds(result.t2_time);
    const runSeconds = timeToSeconds(result.run_time);

    return {
      swim: ((swimSeconds / totalSeconds) * 100).toFixed(1),
      t1: ((t1Seconds / totalSeconds) * 100).toFixed(1),
      bike: ((bikeSeconds / totalSeconds) * 100).toFixed(1),
      t2: ((t2Seconds / totalSeconds) * 100).toFixed(1),
      run: ((runSeconds / totalSeconds) * 100).toFixed(1)
    };
  };

  const getPerformanceInsights = () => {
    const insights = [];
    const percentages = calculateSplitPercentages();
    
    if (!percentages) return ['Unable to calculate performance insights - missing time data.'];

    // Standard percentage ranges for triathlon splits
    const standards = {
      sprint: { swim: [15, 25], bike: [50, 60], run: [20, 30] },
      olympic: { swim: [20, 30], bike: [50, 60], run: [15, 25] },
      '70.3': { swim: [15, 25], bike: [55, 65], run: [20, 30] },
      ironman: { swim: [15, 20], bike: [55, 65], run: [20, 30] }
    };

    const distanceType = race?.distance_type;
    if (distanceType && standards[distanceType as keyof typeof standards]) {
      const standard = standards[distanceType as keyof typeof standards];
      
      const swimPct = parseFloat(percentages.swim);
      const bikePct = parseFloat(percentages.bike);
      const runPct = parseFloat(percentages.run);

      if (swimPct < standard.swim[0]) {
        insights.push(`🏊 Strong swim performance! Your swim split (${percentages.swim}%) is faster than typical for ${distanceType} distance.`);
      } else if (swimPct > standard.swim[1]) {
        insights.push(`🏊 Focus area: Your swim split (${percentages.swim}%) took longer than typical. Consider swim training.`);
      }

      if (bikePct < standard.bike[0]) {
        insights.push(`🚴 Room for improvement: Your bike split (${percentages.bike}%) is lower than typical. You might have more to give on the bike.`);
      } else if (bikePct > standard.bike[1]) {
        insights.push(`🚴 Strong bike performance! Your bike split (${percentages.bike}%) shows good cycling strength.`);
      }

      if (runPct < standard.run[0]) {
        insights.push(`🏃 Excellent run! Your run split (${percentages.run}%) shows strong running off the bike.`);
      } else if (runPct > standard.run[1]) {
        insights.push(`🏃 Focus area: Your run split (${percentages.run}%) suggests room for improvement in run fitness or pacing.`);
      }
    }

    // Transition analysis
    const t1Pct = parseFloat(percentages.t1);
    const t2Pct = parseFloat(percentages.t2);
    
    if (t1Pct > 3) {
      insights.push(`⏱️ T1 opportunity: Your swim-to-bike transition (${percentages.t1}%) could be faster with practice.`);
    }
    
    if (t2Pct > 2) {
      insights.push(`⏱️ T2 opportunity: Your bike-to-run transition (${percentages.t2}%) has room for improvement.`);
    }

    if (insights.length === 0) {
      insights.push(`🎯 Well-balanced race! Your splits are within typical ranges for ${distanceType || 'this'} distance.`);
    }

    return insights;
  };

  const getAgeGroupComparison = () => {
    // Standard age group average times by distance (in seconds)
    const ageGroupAverages: { [key: string]: { overall: number; swim: number; bike: number; run: number; t1: number; t2: number } } = {
      'sprint': { overall: 5400, swim: 900, bike: 2400, run: 1800, t1: 120, t2: 90 }, // 1:30:00 total
      'olympic': { overall: 10800, swim: 1800, bike: 5400, run: 3000, t1: 150, t2: 120 }, // 3:00:00 total
      '70.3': { overall: 21600, swim: 2400, bike: 12600, run: 6300, t1: 180, t2: 120 }, // 6:00:00 total
      'ironman': { overall: 46800, swim: 3600, bike: 27000, run: 15600, t1: 300, t2: 300 } // 13:00:00 total
    };

    const distanceType = race?.distance_type;
    if (!distanceType || !ageGroupAverages[distanceType]) return null;

    const avg = ageGroupAverages[distanceType];
    const userTotal = timeToSeconds(result.overall_time);
    const userSwim = timeToSeconds(result.swim_time);
    const userBike = timeToSeconds(result.bike_time);
    const userRun = timeToSeconds(result.run_time);
    const userT1 = timeToSeconds(result.t1_time);
    const userT2 = timeToSeconds(result.t2_time);

    const calculatePercentile = (userTime: number, avgTime: number): number => {
      if (userTime === 0 || avgTime === 0) return 50;
      // Lower time is better - if user is faster, percentile is higher
      const ratio = userTime / avgTime;
      if (ratio <= 0.8) return 90; // Top 10%
      if (ratio <= 0.9) return 75; // Top 25%
      if (ratio <= 0.95) return 60; // Above average
      if (ratio <= 1.05) return 50; // Average
      if (ratio <= 1.1) return 40; // Below average
      if (ratio <= 1.2) return 25; // Bottom 25%
      return 10; // Bottom 10%
    };

    return {
      overall: {
        userTime: userTotal,
        avgTime: avg.overall,
        percentile: calculatePercentile(userTotal, avg.overall),
        faster: userTotal < avg.overall
      },
      swim: {
        userTime: userSwim,
        avgTime: avg.swim,
        percentile: calculatePercentile(userSwim, avg.swim),
        faster: userSwim < avg.swim
      },
      bike: {
        userTime: userBike,
        avgTime: avg.bike,
        percentile: calculatePercentile(userBike, avg.bike),
        faster: userBike < avg.bike
      },
      run: {
        userTime: userRun,
        avgTime: avg.run,
        percentile: calculatePercentile(userRun, avg.run),
        faster: userRun < avg.run
      },
      t1: {
        userTime: userT1,
        avgTime: avg.t1,
        percentile: calculatePercentile(userT1, avg.t1),
        faster: userT1 < avg.t1
      },
      t2: {
        userTime: userT2,
        avgTime: avg.t2,
        percentile: calculatePercentile(userT2, avg.t2),
        faster: userT2 < avg.t2
      }
    };
  };

  const formatTimeFromSeconds = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 75) return 'text-green-400';
    if (percentile >= 50) return 'text-blue-400';
    if (percentile >= 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPercentileLabel = (percentile: number): string => {
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 75) return 'Top 25%';
    if (percentile >= 60) return 'Above Avg';
    if (percentile >= 40) return 'Average';
    if (percentile >= 25) return 'Below Avg';
    return 'Room to grow';
  };

  const splitPercentages = calculateSplitPercentages();
  const insights = getPerformanceInsights();
  const ageGroupComparison = getAgeGroupComparison();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-terminal-panel border-2 border-terminal-border max-w-4xl w-full max-h-[90vh] overflow-auto"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary font-mono tracking-wider">
              RACE PERFORMANCE ANALYSIS
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          {/* Race Info */}
          <div
            className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6"
            style={{ borderRadius: 0 }}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-mono tracking-wider">
              {(race?.name || 'UNKNOWN RACE').toUpperCase()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-text-secondary">DATE:</span>
                <span className="text-text-primary ml-2">{result.result_date}</span>
              </div>
              <div>
                <span className="text-text-secondary">DISTANCE:</span>
                <span className="text-text-primary ml-2 uppercase">{race?.distance_type || 'UNKNOWN'}</span>
              </div>
              <div>
                <span className="text-text-secondary">TOTAL TIME:</span>
                <span className="text-accent-yellow ml-2 font-mono">{formatTime(result.overall_time)}</span>
              </div>
            </div>
          </div>

          {/* Race Timeline Visualization */}
          {splitPercentages && (
            <div
              className="bg-terminal-panel border-2 border-terminal-border p-6 mb-6"
              style={{ borderRadius: 0 }}
            >
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                RACE TIMELINE
              </h3>
              <div className="relative w-full h-16 bg-white/10 rounded-xl overflow-hidden flex">
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-1000 hover:brightness-110"
                  style={{ width: `${splitPercentages.swim}%` }}
                  title={`Swim: ${formatTime(result.swim_time)} (${splitPercentages.swim}%)`}
                >
                  {parseFloat(splitPercentages.swim) > 10 && '🏊‍♂️'}
                </div>
                <div
                  className="bg-gray-600 flex items-center justify-center text-white text-xs font-semibold transition-all duration-1000 hover:brightness-110"
                  style={{ width: `${splitPercentages.t1}%` }}
                  title={`T1: ${formatTime(result.t1_time)} (${splitPercentages.t1}%)`}
                >
                  {parseFloat(splitPercentages.t1) > 2 && 'T1'}
                </div>
                <div
                  className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-1000 hover:brightness-110"
                  style={{ width: `${splitPercentages.bike}%` }}
                  title={`Bike: ${formatTime(result.bike_time)} (${splitPercentages.bike}%)`}
                >
                  {parseFloat(splitPercentages.bike) > 10 && '🚴‍♂️'}
                </div>
                <div
                  className="bg-gray-600 flex items-center justify-center text-white text-xs font-semibold transition-all duration-1000 hover:brightness-110"
                  style={{ width: `${splitPercentages.t2}%` }}
                  title={`T2: ${formatTime(result.t2_time)} (${splitPercentages.t2}%)`}
                >
                  {parseFloat(splitPercentages.t2) > 2 && 'T2'}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-1000 hover:brightness-110"
                  style={{ width: `${splitPercentages.run}%` }}
                  title={`Run: ${formatTime(result.run_time)} (${splitPercentages.run}%)`}
                >
                  {parseFloat(splitPercentages.run) > 10 && '🏃‍♂️'}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-4 text-xs text-center">
                <div><div className="w-3 h-3 bg-blue-500 rounded mx-auto mb-1"></div>{splitPercentages.swim}%</div>
                <div><div className="w-3 h-3 bg-gray-600 rounded mx-auto mb-1"></div>{splitPercentages.t1}%</div>
                <div><div className="w-3 h-3 bg-orange-500 rounded mx-auto mb-1"></div>{splitPercentages.bike}%</div>
                <div><div className="w-3 h-3 bg-gray-600 rounded mx-auto mb-1"></div>{splitPercentages.t2}%</div>
                <div><div className="w-3 h-3 bg-green-500 rounded mx-auto mb-1"></div>{splitPercentages.run}%</div>
              </div>
            </div>
          )}

          {/* Combined Split Times & Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
              SPLIT TIMES & DISTRIBUTION
            </h3>
            {splitPercentages && (
              <div className="space-y-3">
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-400 font-medium flex items-center gap-2"><TbSwimming className="w-4 h-4" /> Swim</span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.swim_time)}</div>
                      <div className="text-blue-300 font-bold text-sm">{splitPercentages.swim}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${splitPercentages.swim}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${
                  parseFloat(splitPercentages.t1) > 3 ? 'bg-yellow-500/10 border-2 border-yellow-500/30' : 'bg-gray-500/10'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium flex items-center gap-2">
                      T1: Swim → Bike
                      {parseFloat(splitPercentages.t1) > 3 && (
                        <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-1 rounded-lg">
                          ⚡ Optimization opportunity
                        </span>
                      )}
                      {parseFloat(splitPercentages.t1) <= 2 && (
                        <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-lg">
                          ✓ Excellent
                        </span>
                      )}
                    </span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.t1_time)}</div>
                      <div className={`font-bold text-sm ${
                        parseFloat(splitPercentages.t1) > 3 ? 'text-yellow-300' : 'text-gray-300'
                      }`}>{splitPercentages.t1}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        parseFloat(splitPercentages.t1) > 3 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${splitPercentages.t1}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-orange-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-orange-400 font-medium flex items-center gap-2"><TbBike className="w-4 h-4" /> Bike</span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.bike_time)}</div>
                      <div className="text-orange-300 font-bold text-sm">{splitPercentages.bike}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${splitPercentages.bike}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${
                  parseFloat(splitPercentages.t2) > 2 ? 'bg-yellow-500/10 border-2 border-yellow-500/30' : 'bg-gray-500/10'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium flex items-center gap-2">
                      T2: Bike → Run
                      {parseFloat(splitPercentages.t2) > 2 && (
                        <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-1 rounded-lg">
                          ⚡ Optimization opportunity
                        </span>
                      )}
                      {parseFloat(splitPercentages.t2) <= 1.5 && (
                        <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-lg">
                          ✓ Excellent
                        </span>
                      )}
                    </span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.t2_time)}</div>
                      <div className={`font-bold text-sm ${
                        parseFloat(splitPercentages.t2) > 2 ? 'text-yellow-300' : 'text-gray-300'
                      }`}>{splitPercentages.t2}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        parseFloat(splitPercentages.t2) > 2 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${splitPercentages.t2}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-400 font-medium flex items-center gap-2"><TbRun className="w-4 h-4" /> Run</span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.run_time)}</div>
                      <div className="text-green-300 font-bold text-sm">{splitPercentages.run}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${splitPercentages.run}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-white/60 mt-4 text-center">
                  *Progress bars show time distribution as percentage of total race time
                </div>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          <div
            className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6"
            style={{ borderRadius: 0 }}
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2 font-mono tracking-wider">
              PERFORMANCE INSIGHTS
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/90 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Age Group Comparison */}
          {ageGroupComparison && (
            <div
              className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6"
              style={{ borderRadius: 0 }}
            >
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2 font-mono tracking-wider">
                AGE GROUP COMPARISON
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Compare your performance to age group averages for {race?.distance_type} distance
              </p>

              <div className="space-y-3">
                {/* Overall */}
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-300 font-medium">Overall Time</span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">
                          {formatTimeFromSeconds(ageGroupComparison.overall.userTime)}
                        </div>
                        <div className="text-white/50 text-xs">
                          vs {formatTimeFromSeconds(ageGroupComparison.overall.avgTime)} avg
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        ageGroupComparison.overall.percentile >= 75 ? 'bg-green-500/20 text-green-300' :
                        ageGroupComparison.overall.percentile >= 50 ? 'bg-blue-500/20 text-blue-300' :
                        ageGroupComparison.overall.percentile >= 25 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {getPercentileLabel(ageGroupComparison.overall.percentile)}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        ageGroupComparison.overall.percentile >= 75 ? 'bg-green-500' :
                        ageGroupComparison.overall.percentile >= 50 ? 'bg-blue-500' :
                        ageGroupComparison.overall.percentile >= 25 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${ageGroupComparison.overall.percentile}%` }}
                    ></div>
                  </div>
                </div>

                {/* Discipline Comparisons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Swim */}
                  {ageGroupComparison.swim.userTime > 0 && (
                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
                      <div className="text-blue-300 font-medium text-sm mb-2">🏊‍♂️ Swim</div>
                      <div className="text-white font-mono text-sm mb-1">
                        {formatTimeFromSeconds(ageGroupComparison.swim.userTime)}
                      </div>
                      <div className={`text-xs font-semibold ${getPercentileColor(ageGroupComparison.swim.percentile)}`}>
                        {getPercentileLabel(ageGroupComparison.swim.percentile)}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        avg: {formatTimeFromSeconds(ageGroupComparison.swim.avgTime)}
                      </div>
                    </div>
                  )}

                  {/* Bike */}
                  {ageGroupComparison.bike.userTime > 0 && (
                    <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-400/20">
                      <div className="text-orange-300 font-medium text-sm mb-2">🚴‍♂️ Bike</div>
                      <div className="text-white font-mono text-sm mb-1">
                        {formatTimeFromSeconds(ageGroupComparison.bike.userTime)}
                      </div>
                      <div className={`text-xs font-semibold ${getPercentileColor(ageGroupComparison.bike.percentile)}`}>
                        {getPercentileLabel(ageGroupComparison.bike.percentile)}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        avg: {formatTimeFromSeconds(ageGroupComparison.bike.avgTime)}
                      </div>
                    </div>
                  )}

                  {/* Run */}
                  {ageGroupComparison.run.userTime > 0 && (
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-400/20">
                      <div className="text-green-300 font-medium text-sm mb-2">🏃‍♂️ Run</div>
                      <div className="text-white font-mono text-sm mb-1">
                        {formatTimeFromSeconds(ageGroupComparison.run.userTime)}
                      </div>
                      <div className={`text-xs font-semibold ${getPercentileColor(ageGroupComparison.run.percentile)}`}>
                        {getPercentileLabel(ageGroupComparison.run.percentile)}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        avg: {formatTimeFromSeconds(ageGroupComparison.run.avgTime)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Transitions Comparison */}
                <div className="grid grid-cols-2 gap-3">
                  {ageGroupComparison.t1.userTime > 0 && (
                    <div className="bg-gray-500/10 rounded-lg p-3 border border-gray-400/20">
                      <div className="text-gray-300 font-medium text-sm mb-2">T1</div>
                      <div className="text-white font-mono text-sm mb-1">
                        {formatTimeFromSeconds(ageGroupComparison.t1.userTime)}
                      </div>
                      <div className={`text-xs font-semibold ${getPercentileColor(ageGroupComparison.t1.percentile)}`}>
                        {getPercentileLabel(ageGroupComparison.t1.percentile)}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        avg: {formatTimeFromSeconds(ageGroupComparison.t1.avgTime)}
                      </div>
                    </div>
                  )}

                  {ageGroupComparison.t2.userTime > 0 && (
                    <div className="bg-gray-500/10 rounded-lg p-3 border border-gray-400/20">
                      <div className="text-gray-300 font-medium text-sm mb-2">T2</div>
                      <div className="text-white font-mono text-sm mb-1">
                        {formatTimeFromSeconds(ageGroupComparison.t2.userTime)}
                      </div>
                      <div className={`text-xs font-semibold ${getPercentileColor(ageGroupComparison.t2.percentile)}`}>
                        {getPercentileLabel(ageGroupComparison.t2.percentile)}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        avg: {formatTimeFromSeconds(ageGroupComparison.t2.avgTime)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-white/50 italic mt-3 text-center">
                  *Based on typical age group averages for {race?.distance_type} distance races
                </div>
              </div>
            </div>
          )}

          {/* Placements */}
          {(result.overall_placement || result.age_group_placement) && (
            <div
              className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6"
              style={{ borderRadius: 0 }}
            >
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2 font-mono tracking-wider">
                RACE RESULTS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.overall_placement && (
                  <div className="bg-yellow-500/10 rounded-lg p-4 text-center">
                    <div className="text-yellow-400 text-sm font-medium mb-1">Overall Placement</div>
                    <div className="text-3xl font-bold text-white">#{result.overall_placement}</div>
                  </div>
                )}
                {result.age_group_placement && (
                  <div className="bg-purple-500/10 rounded-lg p-4 text-center">
                    <div className="text-purple-400 text-sm font-medium mb-1">Age Group Placement</div>
                    <div className="text-3xl font-bold text-white">#{result.age_group_placement}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-terminal-panel text-text-primary border-2 border-accent-yellow px-6 py-3 font-medium hover:bg-accent-yellow/10 transition-colors font-mono tracking-wider"
              style={{ borderRadius: 0 }}
            >
              CLOSE ANALYSIS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};