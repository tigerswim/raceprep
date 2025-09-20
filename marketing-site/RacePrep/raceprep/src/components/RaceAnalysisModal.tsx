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

  const splitPercentages = calculateSplitPercentages();
  const insights = getPerformanceInsights();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Race Performance Analysis</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Race Info */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{race?.name || 'Unknown Race'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/70">Date:</span>
                <span className="text-white ml-2">{result.result_date}</span>
              </div>
              <div>
                <span className="text-white/70">Distance:</span>
                <span className="text-white ml-2 capitalize">{race?.distance_type || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-white/70">Total Time:</span>
                <span className="text-white ml-2 font-mono">{formatTime(result.overall_time)}</span>
              </div>
            </div>
          </div>

          {/* Combined Split Times & Distribution */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Split Times & Distribution</h3>
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

                <div className="bg-gray-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">T1: Swim → Bike</span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.t1_time)}</div>
                      <div className="text-gray-300 font-bold text-sm">{splitPercentages.t1}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gray-500 h-3 rounded-full transition-all duration-1000" 
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

                <div className="bg-gray-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">T2: Bike → Run</span>
                    <div className="text-right">
                      <div className="text-white font-mono font-semibold">{formatTime(result.t2_time)}</div>
                      <div className="text-gray-300 font-bold text-sm">{splitPercentages.t2}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gray-500 h-3 rounded-full transition-all duration-1000" 
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
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TbChartBar className="w-5 h-5" /> Performance Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/90 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Placements */}
          {(result.overall_placement || result.age_group_placement) && (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TbTrophy className="w-5 h-5" /> Race Results</h3>
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
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};