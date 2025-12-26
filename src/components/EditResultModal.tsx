import React, { useState, useEffect } from 'react';

interface EditResultModalProps {
  onClose: () => void;
  onSubmit: (resultId: string, data: any) => void;
  races: any[];
  result: any;
}

export const EditResultModal: React.FC<EditResultModalProps> = ({ onClose, onSubmit, races, result }) => {
  const [formData, setFormData] = useState({
    race_id: '',
    result_date: '',
    swim_time: '',
    t1_time: '',
    bike_time: '',
    t2_time: '',
    run_time: '',
    total_time: '',
    overall_place: '',
    age_group_place: '',
    swim_pace: '',
    avg_speed: '',
    run_pace: '',
    notes: ''
  });

  // Load existing result data into form
  useEffect(() => {
    if (result) {
      // Convert time strings back to display format
      const formatTimeForInput = (timeStr: string | null) => {
        if (!timeStr) return '';
        // If it's already in HH:MM:SS format, convert to MM:SS or keep as is
        const parts = timeStr.split(':');
        if (parts.length === 3 && parts[0] === '0') {
          return `${parts[1]}:${parts[2]}`; // Convert 0:MM:SS to MM:SS
        }
        return timeStr; // Keep HH:MM:SS as is
      };

      setFormData({
        race_id: result.race_id || '',
        result_date: result.result_date || '',
        swim_time: formatTimeForInput(result.swim_time),
        t1_time: formatTimeForInput(result.t1_time),
        bike_time: formatTimeForInput(result.bike_time),
        t2_time: formatTimeForInput(result.t2_time),
        run_time: formatTimeForInput(result.run_time),
        total_time: formatTimeForInput(result.overall_time),
        overall_place: result.overall_placement?.toString() || '',
        age_group_place: result.age_group_placement?.toString() || '',
        swim_pace: '',
        avg_speed: '',
        run_pace: '',
        notes: result.notes || ''
      });
    }
  }, [result]);

  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  };

  const calculateSpeedAndPace = (raceId: string, swimTimeSeconds: number, bikeTimeSeconds: number, runTimeSeconds: number) => {
    const race = races.find(r => r.id === raceId);
    if (!race) return { swimPace: '', avgSpeed: '', runPace: '' };

    const standardDistances: { [key: string]: { swim: number; bike: number; run: number } } = {
      'sprint': { swim: 750, bike: 20, run: 5 },
      'olympic': { swim: 1500, bike: 40, run: 10 },
      '70.3': { swim: 1900, bike: 90, run: 21.1 },
      'ironman': { swim: 3800, bike: 180, run: 42.2 }
    };

    const distances = standardDistances[race.distance_type];
    if (!distances) return { swimPace: '', avgSpeed: '', runPace: '' };

    let swimPace = '';
    let avgSpeed = '';
    let runPace = '';

    if (swimTimeSeconds > 0) {
      const paceSecondsPer100m = (swimTimeSeconds / distances.swim) * 100;
      const paceMinutes = Math.floor(paceSecondsPer100m / 60);
      const paceSeconds = Math.floor(paceSecondsPer100m % 60);
      swimPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
    }

    if (bikeTimeSeconds > 0) {
      const bikeTimeHours = bikeTimeSeconds / 3600;
      const bikeDistanceMiles = distances.bike * 0.621371;
      const speedMph = bikeDistanceMiles / bikeTimeHours;
      avgSpeed = speedMph.toFixed(1);
    }

    if (runTimeSeconds > 0) {
      const runDistanceMiles = distances.run * 0.621371;
      const paceSecondsPerMile = runTimeSeconds / runDistanceMiles;
      const paceMinutes = Math.floor(paceSecondsPerMile / 60);
      const paceSeconds = Math.floor(paceSecondsPerMile % 60);
      runPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
    }

    return { swimPace, avgSpeed, runPace };
  };

  const calculateTotalTime = () => {
    const swim = timeToSeconds(formData.swim_time);
    const t1 = timeToSeconds(formData.t1_time);
    const bike = timeToSeconds(formData.bike_time);
    const t2 = timeToSeconds(formData.t2_time);
    const run = timeToSeconds(formData.run_time);
    return swim + t1 + bike + t2 + run;
  };

  const handleTimeChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (formData.race_id && ['swim_time', 'bike_time', 'run_time'].includes(field)) {
      const swimTimeSeconds = timeToSeconds(field === 'swim_time' ? value : formData.swim_time);
      const bikeTimeSeconds = timeToSeconds(field === 'bike_time' ? value : formData.bike_time);
      const runTimeSeconds = timeToSeconds(field === 'run_time' ? value : formData.run_time);
      
      const { swimPace, avgSpeed, runPace } = calculateSpeedAndPace(formData.race_id, swimTimeSeconds, bikeTimeSeconds, runTimeSeconds);
      
      if (field === 'swim_time' && (!formData.swim_pace.trim() || formData.swim_pace.match(/^\d+:\d{2}$/))) {
        newFormData.swim_pace = swimPace;
      }
      if (field === 'bike_time' && (!formData.avg_speed.trim() || formData.avg_speed.match(/^\d+(\.\d+)?$/))) {
        newFormData.avg_speed = avgSpeed;
      }
      if (field === 'run_time' && (!formData.run_pace.trim() || formData.run_pace.match(/^\d+:\d{2}$/))) {
        newFormData.run_pace = runPace;
      }
    }
    
    setFormData(newFormData);
  };

  const handleRaceChange = (raceId: string) => {
    const newFormData = { ...formData, race_id: raceId };
    
    if (raceId && (formData.swim_time || formData.bike_time || formData.run_time)) {
      const swimTimeSeconds = timeToSeconds(formData.swim_time);
      const bikeTimeSeconds = timeToSeconds(formData.bike_time);
      const runTimeSeconds = timeToSeconds(formData.run_time);
      
      const { swimPace, avgSpeed, runPace } = calculateSpeedAndPace(raceId, swimTimeSeconds, bikeTimeSeconds, runTimeSeconds);
      
      if (swimTimeSeconds > 0 && (!formData.swim_pace.trim() || formData.swim_pace.match(/^\d+:\d{2}$/))) {
        newFormData.swim_pace = swimPace;
      }
      if (bikeTimeSeconds > 0 && (!formData.avg_speed.trim() || formData.avg_speed.match(/^\d+(\.\d+)?$/))) {
        newFormData.avg_speed = avgSpeed;
      }
      if (runTimeSeconds > 0 && (!formData.run_pace.trim() || formData.run_pace.match(/^\d+:\d{2}$/))) {
        newFormData.run_pace = runPace;
      }
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalSeconds = calculateTotalTime();
    
    const formatTimeForDB = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const resultData = {
      race_id: formData.race_id,
      overall_time: formatTimeForDB(totalSeconds),
      swim_time: formData.swim_time ? formatTimeForDB(timeToSeconds(formData.swim_time)) : null,
      t1_time: formData.t1_time ? formatTimeForDB(timeToSeconds(formData.t1_time)) : null,
      bike_time: formData.bike_time ? formatTimeForDB(timeToSeconds(formData.bike_time)) : null,
      t2_time: formData.t2_time ? formatTimeForDB(timeToSeconds(formData.t2_time)) : null,
      run_time: formData.run_time ? formatTimeForDB(timeToSeconds(formData.run_time)) : null,
      overall_placement: parseInt(formData.overall_place) || null,
      age_group_placement: parseInt(formData.age_group_place) || null,
      bib_number: null,
    };

    onSubmit(result.id, resultData);
  };

  const formatTotalTime = () => {
    const total = calculateTotalTime();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-terminal-panel border-2 border-terminal-border max-w-2xl w-full max-h-[90vh] overflow-auto"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary font-mono tracking-wider">
              EDIT RACE RESULT
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Race Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                RACE INFORMATION
              </h3>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  RACE
                </label>
                <select
                  value={formData.race_id}
                  onChange={(e) => handleRaceChange(e.target.value)}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  required
                >
                  <option value="">SELECT A RACE</option>
                  {races.map((race) => (
                    <option key={race.id} value={race.id}>
                      {race.name} - {race.date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  RESULT DATE
                </label>
                <input
                  type="date"
                  value={formData.result_date}
                  onChange={(e) => setFormData({ ...formData, result_date: e.target.value })}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    OVERALL PLACE
                  </label>
                  <input
                    type="number"
                    value={formData.overall_place}
                    onChange={(e) => setFormData({ ...formData, overall_place: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="e.g. 42"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    AGE GROUP PLACE
                  </label>
                  <input
                    type="number"
                    value={formData.age_group_place}
                    onChange={(e) => setFormData({ ...formData, age_group_place: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="e.g. 8"
                  />
                </div>
              </div>
            </div>

            {/* Split Times */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                SPLIT TIMES
              </h3>

              <div className="grid gap-6">
                {/* Swim */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-swim p-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-discipline-swim font-semibold mb-3 flex items-center gap-2 font-mono tracking-wider">
                    SWIM
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        TIME (MM:SS OR HH:MM:SS)
                      </label>
                      <input
                        type="text"
                        value={formData.swim_time}
                        onChange={(e) => handleTimeChange('swim_time', e.target.value)}
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                        placeholder="12:30 or 1:12:30"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        PACE PER 100M
                      </label>
                      <input
                        type="text"
                        value={formData.swim_pace}
                        onChange={(e) => setFormData({ ...formData, swim_pace: e.target.value })}
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                        placeholder="1:40"
                      />
                    </div>
                  </div>
                </div>

                {/* T1 */}
                <div
                  className="bg-terminal-panel border-2 border-terminal-border p-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-text-secondary font-semibold mb-3 font-mono tracking-wider">
                    T1: SWIM → BIKE
                  </h4>
                  <input
                    type="text"
                    value={formData.t1_time}
                    onChange={(e) => handleTimeChange('t1_time', e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="2:15"
                  />
                </div>

                {/* Bike */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-bike p-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-discipline-bike font-semibold mb-3 flex items-center gap-2 font-mono tracking-wider">
                    BIKE
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        TIME (MM:SS OR HH:MM:SS)
                      </label>
                      <input
                        type="text"
                        value={formData.bike_time}
                        onChange={(e) => handleTimeChange('bike_time', e.target.value)}
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                        placeholder="42:30 or 1:10:00"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        AVG SPEED (MPH)
                      </label>
                      <input
                        type="text"
                        value={formData.avg_speed}
                        onChange={(e) => setFormData({ ...formData, avg_speed: e.target.value })}
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                        placeholder="22.5"
                      />
                    </div>
                  </div>
                </div>

                {/* T2 */}
                <div
                  className="bg-terminal-panel border-2 border-terminal-border p-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-text-secondary font-semibold mb-3 font-mono tracking-wider">
                    T2: BIKE → RUN
                  </h4>
                  <input
                    type="text"
                    value={formData.t2_time}
                    onChange={(e) => handleTimeChange('t2_time', e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="1:45"
                  />
                </div>

                {/* Run */}
                <div
                  className="bg-terminal-panel border-2 border-discipline-run p-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-discipline-run font-semibold mb-3 flex items-center gap-2 font-mono tracking-wider">
                    RUN
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        TIME (MM:SS OR HH:MM:SS)
                      </label>
                      <input
                        type="text"
                        value={formData.run_time}
                        onChange={(e) => handleTimeChange('run_time', e.target.value)}
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                        placeholder="23:45 or 1:23:45"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        PACE PER MILE
                      </label>
                      <input
                        type="text"
                        value={formData.run_pace}
                        onChange={(e) => setFormData({ ...formData, run_pace: e.target.value })}
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                        placeholder="7:30"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Time Display */}
                {(formData.swim_time || formData.bike_time || formData.run_time) && (
                  <div
                    className="bg-terminal-panel border-2 border-accent-yellow p-4 text-center mb-6"
                    style={{ borderRadius: 0 }}
                  >
                    <h4 className="text-text-secondary font-medium mb-2 font-mono tracking-wider uppercase">
                      CALCULATED TOTAL TIME
                    </h4>
                    <div className="text-2xl font-bold text-accent-yellow font-mono">
                      {formatTotalTime()}
                    </div>
                  </div>
                )}

                {/* Review Section */}
                <div
                  className="bg-terminal-panel border-2 border-terminal-border p-4 mb-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-text-primary font-semibold mb-3 font-mono tracking-wider">
                    REVIEW CHANGES
                  </h4>
                  <div className="text-text-secondary space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><span className="text-text-primary font-medium">RACE:</span> {races.find(r => r.id === formData.race_id)?.name || 'NOT SELECTED'}</p>
                        <p><span className="text-text-primary font-medium">DATE:</span> {formData.result_date || 'NOT SET'}</p>
                        <p><span className="text-text-primary font-medium">TOTAL TIME:</span> {formatTotalTime()}</p>
                      </div>
                      <div>
                        {formData.overall_place && <p><span className="text-text-primary font-medium">OVERALL PLACE:</span> #{formData.overall_place}</p>}
                        {formData.age_group_place && <p><span className="text-text-primary font-medium">AGE GROUP PLACE:</span> #{formData.age_group_place}</p>}
                        {formData.swim_pace && <p><span className="text-text-primary font-medium">SWIM PACE:</span> {formData.swim_pace}/100m</p>}
                        {formData.avg_speed && <p><span className="text-text-primary font-medium">BIKE SPEED:</span> {formData.avg_speed} mph</p>}
                        {formData.run_pace && <p><span className="text-text-primary font-medium">RUN PACE:</span> {formData.run_pace}/mile</p>}
                      </div>
                    </div>
                    {formData.notes && (
                      <div className="mt-3 pt-3 border-t-2 border-terminal-border">
                        <p><span className="text-text-primary font-medium">NOTES:</span></p>
                        <p className="mt-1 text-text-secondary italic">&quot;{formData.notes}&quot;</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div
                  className="bg-terminal-panel border-2 border-text-secondary p-4"
                  style={{ borderRadius: 0 }}
                >
                  <h4 className="text-text-secondary font-semibold mb-3 flex items-center gap-2 font-mono tracking-wider">
                    RACE NOTES
                  </h4>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow resize-vertical font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="Add any notes about this race - how you felt, weather conditions, strategy, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={onClose}
                className="bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={!formData.race_id || !formData.result_date}
                className="bg-terminal-panel border-2 border-discipline-run text-discipline-run px-6 py-3 font-medium hover:bg-discipline-run/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                UPDATE RACE RESULT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};