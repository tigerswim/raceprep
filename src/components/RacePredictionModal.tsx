import React, { useState } from 'react';

interface RacePredictionModalProps {
  course: any;
  onClose: () => void;
}

export const RacePredictionModal: React.FC<RacePredictionModalProps> = ({ course, onClose }) => {
  const [userTimes, setUserTimes] = useState({
    swimTime: '',
    bikeTime: '',
    runTime: '',
    t1Time: '2',
    t2Time: '2'
  });

  const [prediction, setPrediction] = useState<any>(null);

  if (!course) return null;

  const calculatePrediction = () => {
    // Simple prediction algorithm based on course difficulty and elevation
    const baseTimes = {
      sprint: { swim: 20, bike: 35, run: 22 }, // minutes
      olympic: { swim: 35, bike: 70, run: 45 },
      '70.3': { swim: 40, bike: 180, run: 100 },
      ironman: { swim: 70, bike: 360, run: 240 }
    };

    const base = baseTimes[course.distance_type as keyof typeof baseTimes] || baseTimes.olympic;
    const difficultyMultiplier = course.difficulty_score ? 1 + ((course.difficulty_score - 5) * 0.05) : 1;
    const elevationFactor = course.overall_elevation ? 1 + (course.overall_elevation * 0.00005) : 1;

    const predictedSwim = Math.round(base.swim * difficultyMultiplier);
    const predictedBike = Math.round(base.bike * difficultyMultiplier * elevationFactor);
    const predictedRun = Math.round(base.run * difficultyMultiplier * (course.run_elevation_gain ? 1 + (course.run_elevation_gain * 0.0001) : 1));

    const total = predictedSwim + predictedBike + predictedRun + parseInt(userTimes.t1Time || '2') + parseInt(userTimes.t2Time || '2');

    setPrediction({
      swim: predictedSwim,
      bike: predictedBike,
      run: predictedRun,
      t1: parseInt(userTimes.t1Time || '2'),
      t2: parseInt(userTimes.t2Time || '2'),
      total: total
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}min`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Race Time Prediction</h2>
              <p className="text-lg text-white/70">{course.name}</p>
              <p className="text-white/60 capitalize">{course.distance_type} • {course.location}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Course Factors */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Course Difficulty Factors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-white/60">Difficulty Score</div>
                <div className="text-white font-medium">{course.difficulty_score || 'N/A'}/10</div>
              </div>
              <div>
                <div className="text-white/60">Total Elevation</div>
                <div className="text-white font-medium">{course.overall_elevation ? `+${course.overall_elevation}ft` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-white/60">Swim Type</div>
                <div className="text-white font-medium capitalize">{course.swim_type || 'Open Water'}</div>
              </div>
              <div>
                <div className="text-white/60">Wetsuit Legal</div>
                <div className="text-white font-medium">{course.wetsuit_legal === null ? 'Unknown' : course.wetsuit_legal ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Your Times Input (Optional) */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Your Recent Times (Optional)</h3>
            <p className="text-white/60 text-sm mb-4">Enter your recent times for more accurate predictions</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">Swim (min)</label>
                <input
                  type="number"
                  value={userTimes.swimTime}
                  onChange={(e) => setUserTimes({...userTimes, swimTime: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Bike (min)</label>
                <input
                  type="number"
                  value={userTimes.bikeTime}
                  onChange={(e) => setUserTimes({...userTimes, bikeTime: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Run (min)</label>
                <input
                  type="number"
                  value={userTimes.runTime}
                  onChange={(e) => setUserTimes({...userTimes, runTime: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="45"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">T1 (min)</label>
                <input
                  type="number"
                  value={userTimes.t1Time}
                  onChange={(e) => setUserTimes({...userTimes, t1Time: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">T2 (min)</label>
                <input
                  type="number"
                  value={userTimes.t2Time}
                  onChange={(e) => setUserTimes({...userTimes, t2Time: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={calculatePrediction}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Calculate Prediction
            </button>
          </div>

          {/* Prediction Results */}
          {prediction && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-6 border border-blue-400/30">
              <h3 className="text-xl font-bold text-white mb-4">Predicted Race Times</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatTime(prediction.swim)}</div>
                  <div className="text-white/60 text-sm">Swim</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatTime(prediction.t1)}</div>
                  <div className="text-white/60 text-sm">T1</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatTime(prediction.bike)}</div>
                  <div className="text-white/60 text-sm">Bike</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatTime(prediction.t2)}</div>
                  <div className="text-white/60 text-sm">T2</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{formatTime(prediction.run)}</div>
                  <div className="text-white/60 text-sm">Run</div>
                </div>
                <div className="text-center border-l border-white/20 pl-4">
                  <div className="text-3xl font-bold text-purple-400">{formatTime(prediction.total)}</div>
                  <div className="text-white/60 text-sm">Total</div>
                </div>
              </div>
              
              <div className="text-center text-white/70 text-sm">
                * Prediction based on course difficulty, elevation, and conditions
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
            {prediction && (
              <div className="flex gap-3">
                <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-xl font-medium transition-colors">
                  Save Prediction
                </button>
                <button className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-6 py-3 rounded-xl font-medium transition-colors">
                  Create Training Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};