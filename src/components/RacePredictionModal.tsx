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
      <div
        className="bg-terminal-panel border-2 border-terminal-border max-w-3xl w-full max-h-[90vh] overflow-auto"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2 font-mono tracking-wider">
                RACE TIME PREDICTION
              </h2>
              <p className="text-sm text-text-primary font-mono">
                {course.name}
              </p>
              <p className="text-text-secondary text-xs font-mono uppercase">
                {course.distance_type} • {course.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          {/* Course Factors */}
          <div
            className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6"
            style={{ borderRadius: 0 }}
          >
            <h3 className="text-sm font-semibold text-text-primary mb-3 font-mono tracking-wider">
              COURSE DIFFICULTY FACTORS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  DIFFICULTY SCORE
                </div>
                <div className="text-accent-yellow font-medium font-mono">
                  {course.difficulty_score || 'N/A'}/10
                </div>
              </div>
              <div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  TOTAL ELEVATION
                </div>
                <div className="text-accent-yellow font-medium font-mono">
                  {course.overall_elevation ? `+${course.overall_elevation}ft` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  SWIM TYPE
                </div>
                <div className="text-accent-yellow font-medium font-mono uppercase">
                  {course.swim_type || 'OPEN WATER'}
                </div>
              </div>
              <div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  WETSUIT LEGAL
                </div>
                <div className="text-accent-yellow font-medium font-mono">
                  {course.wetsuit_legal === null ? 'UNKNOWN' : course.wetsuit_legal ? 'YES' : 'NO'}
                </div>
              </div>
            </div>
          </div>

          {/* Your Times Input (Optional) */}
          <div
            className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6"
            style={{ borderRadius: 0 }}
          >
            <h3 className="text-sm font-semibold text-text-primary mb-3 font-mono tracking-wider">
              YOUR RECENT TIMES (OPTIONAL)
            </h3>
            <p className="text-text-secondary text-xs mb-4 font-mono">
              ENTER YOUR RECENT TIMES FOR MORE ACCURATE PREDICTIONS
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-text-secondary text-xs mb-1 font-mono tracking-wider uppercase">
                  SWIM (MIN)
                </label>
                <input
                  type="number"
                  value={userTimes.swimTime}
                  onChange={(e) => setUserTimes({...userTimes, swimTime: e.target.value})}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1 font-mono tracking-wider uppercase">
                  BIKE (MIN)
                </label>
                <input
                  type="number"
                  value={userTimes.bikeTime}
                  onChange={(e) => setUserTimes({...userTimes, bikeTime: e.target.value})}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1 font-mono tracking-wider uppercase">
                  RUN (MIN)
                </label>
                <input
                  type="number"
                  value={userTimes.runTime}
                  onChange={(e) => setUserTimes({...userTimes, runTime: e.target.value})}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="45"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1 font-mono tracking-wider uppercase">
                  T1 (MIN)
                </label>
                <input
                  type="number"
                  value={userTimes.t1Time}
                  onChange={(e) => setUserTimes({...userTimes, t1Time: e.target.value})}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1 font-mono tracking-wider uppercase">
                  T2 (MIN)
                </label>
                <input
                  type="number"
                  value={userTimes.t2Time}
                  onChange={(e) => setUserTimes({...userTimes, t2Time: e.target.value})}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                />
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={calculatePrediction}
              className="bg-accent-yellow text-terminal-bg px-8 py-3 font-medium hover:bg-accent-yellow/90 transition-all font-mono tracking-wider"
              style={{ borderRadius: 0 }}
            >
              CALCULATE PREDICTION
            </button>
          </div>

          {/* Prediction Results */}
          {prediction && (
            <div
              className="bg-terminal-panel border-2 border-accent-yellow p-6 mb-6"
              style={{ borderRadius: 0 }}
            >
              <h3 className="text-lg font-bold text-accent-yellow mb-4 font-mono tracking-wider">
                PREDICTED RACE TIMES
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-discipline-swim font-mono">
                    {formatTime(prediction.swim)}
                  </div>
                  <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    SWIM
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-yellow font-mono">
                    {formatTime(prediction.t1)}
                  </div>
                  <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    T1
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-discipline-bike font-mono">
                    {formatTime(prediction.bike)}
                  </div>
                  <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    BIKE
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-yellow font-mono">
                    {formatTime(prediction.t2)}
                  </div>
                  <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    T2
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-discipline-run font-mono">
                    {formatTime(prediction.run)}
                  </div>
                  <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    RUN
                  </div>
                </div>
                <div className="text-center border-l-2 border-terminal-border pl-4">
                  <div className="text-3xl font-bold text-accent-yellow font-mono">
                    {formatTime(prediction.total)}
                  </div>
                  <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    TOTAL
                  </div>
                </div>
              </div>

              <div className="text-center text-text-secondary text-xs font-mono">
                * PREDICTION BASED ON COURSE DIFFICULTY, ELEVATION, AND CONDITIONS
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider"
              style={{ borderRadius: 0 }}
            >
              CLOSE
            </button>
            {prediction && (
              <div className="flex gap-3">
                <button
                  className="bg-terminal-panel border-2 border-discipline-swim text-discipline-swim px-6 py-3 font-medium hover:bg-discipline-swim/10 transition-colors font-mono tracking-wider"
                  style={{ borderRadius: 0 }}
                >
                  SAVE PREDICTION
                </button>
                <button
                  className="bg-terminal-panel border-2 border-discipline-run text-discipline-run px-6 py-3 font-medium hover:bg-discipline-run/10 transition-colors font-mono tracking-wider"
                  style={{ borderRadius: 0 }}
                >
                  CREATE TRAINING PLAN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
