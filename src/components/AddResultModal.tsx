import { logger } from '../utils/logger';
import React, { useState } from 'react';
import { UserRaceFormModal } from './UserRaceFormModal';
import { dbHelpers } from '../services/supabase';

interface AddResultModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  races: any[];
}

export const AddResultModal: React.FC<AddResultModalProps> = ({ onClose, onSubmit, races }) => {
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  const [showCreateRaceModal, setShowCreateRaceModal] = useState(false);
  const [isCreatingRace, setIsCreatingRace] = useState(false);
  const [updatedRaces, setUpdatedRaces] = useState(races);

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

  // Simplified calculation helpers - no longer dependent on race distance data
  const calculateSpeedAndPace = (raceId: string, swimTimeSeconds: number, bikeTimeSeconds: number, runTimeSeconds: number) => {
    // Since race distances are not in the database schema anymore,
    // users will need to manually enter pace/speed or we can provide
    // standard distance assumptions based on race type
    const race = races.find(r => r.id === raceId);
    if (!race) return { swimPace: '', avgSpeed: '', runPace: '' };

    // Standard distances by race type (estimates for auto-calculation)
    const standardDistances: { [key: string]: { swim: number; bike: number; run: number } } = {
      'sprint': { swim: 750, bike: 20, run: 5 }, // meters, km, km
      'olympic': { swim: 1500, bike: 40, run: 10 },
      '70.3': { swim: 1900, bike: 90, run: 21.1 },
      'ironman': { swim: 3800, bike: 180, run: 42.2 }
    };

    const distances = standardDistances[race.distance_type];
    if (!distances) return { swimPace: '', avgSpeed: '', runPace: '' };

    let swimPace = '';
    let avgSpeed = '';
    let runPace = '';

    // Calculate swim pace per 100m
    if (swimTimeSeconds > 0) {
      const paceSecondsPer100m = (swimTimeSeconds / distances.swim) * 100;
      const paceMinutes = Math.floor(paceSecondsPer100m / 60);
      const paceSeconds = Math.floor(paceSecondsPer100m % 60);
      swimPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
    }

    // Calculate bike speed
    if (bikeTimeSeconds > 0) {
      const bikeTimeHours = bikeTimeSeconds / 3600;
      const bikeDistanceMiles = distances.bike * 0.621371; // Convert km to miles
      const speedMph = bikeDistanceMiles / bikeTimeHours;
      avgSpeed = speedMph.toFixed(1);
    }

    // Calculate run pace per mile
    if (runTimeSeconds > 0) {
      const runDistanceMiles = distances.run * 0.621371; // Convert km to miles
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

  // Auto-update speed and pace when times change
  const handleTimeChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate speed and pace if we have race selected and times entered
    if (formData.race_id && ['swim_time', 'bike_time', 'run_time'].includes(field)) {
      const swimTimeSeconds = timeToSeconds(field === 'swim_time' ? value : formData.swim_time);
      const bikeTimeSeconds = timeToSeconds(field === 'bike_time' ? value : formData.bike_time);
      const runTimeSeconds = timeToSeconds(field === 'run_time' ? value : formData.run_time);

      const { swimPace, avgSpeed, runPace } = calculateSpeedAndPace(formData.race_id, swimTimeSeconds, bikeTimeSeconds, runTimeSeconds);

      // Only update calculated values if user hasn't manually entered values (empty or auto-calculated)
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

  // Handle race selection change and trigger auto-calculation
  const handleRaceChange = (raceId: string) => {
    const newFormData = { ...formData, race_id: raceId };

    // Auto-calculate speeds and paces if times are already entered
    if (raceId && (formData.swim_time || formData.bike_time || formData.run_time)) {
      const swimTimeSeconds = timeToSeconds(formData.swim_time);
      const bikeTimeSeconds = timeToSeconds(formData.bike_time);
      const runTimeSeconds = timeToSeconds(formData.run_time);

      const { swimPace, avgSpeed, runPace } = calculateSpeedAndPace(raceId, swimTimeSeconds, bikeTimeSeconds, runTimeSeconds);

      // Only update if user hasn't manually entered values
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

  // Handle race creation from the create tab
  const handleCreateRace = async (raceData: any) => {
    setIsCreatingRace(true);
    try {
      const { data: newRace, error } = await dbHelpers.userRaces.create(raceData);

      if (error) {
        throw new Error(error);
      }

      if (newRace) {
        // Add the new race to our local list
        setUpdatedRaces(prev => [...prev, newRace]);

        // Pre-select the new race for the result
        setFormData(prev => ({ ...prev, race_id: newRace.id }));

        // Switch back to the select tab
        setActiveTab('select');

        alert(`Race "${newRace.name}" created successfully! It has been selected for your result.`);
      }
    } catch (error: any) {
      logger.error('Error creating race:', error);
      alert('Failed to create race. Please try again.');
    } finally {
      setIsCreatingRace(false);
      setShowCreateRaceModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds = calculateTotalTime();

    // Format times as strings for database (HH:MM:SS format)
    const formatTimeForDB = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resultData = {
      race_id: formData.race_id,
      // Map to correct database field names - only include fields that exist in schema
      overall_time: formatTimeForDB(totalSeconds),
      swim_time: formData.swim_time ? formatTimeForDB(timeToSeconds(formData.swim_time)) : null,
      t1_time: formData.t1_time ? formatTimeForDB(timeToSeconds(formData.t1_time)) : null,
      bike_time: formData.bike_time ? formatTimeForDB(timeToSeconds(formData.bike_time)) : null,
      t2_time: formData.t2_time ? formatTimeForDB(timeToSeconds(formData.t2_time)) : null,
      run_time: formData.run_time ? formatTimeForDB(timeToSeconds(formData.run_time)) : null,
      overall_placement: parseInt(formData.overall_place) || null,
      age_group_placement: parseInt(formData.age_group_place) || null,
      bib_number: null, // Optional field in schema
      // Note: user_id will be added in parent component
      // Note: result_date, swim_pace, avg_speed, run_pace, notes are not in the database schema
    };

    onSubmit(resultData);
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
            <h2 className="text-xl font-bold text-text-primary font-mono tracking-wider">
              ADD RACE RESULT
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('select')}
              className={`flex-1 py-3 px-4 text-xs font-medium transition-all font-mono tracking-wider ${
                activeTab === 'select'
                  ? 'bg-accent-yellow text-terminal-bg'
                  : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
              }`}
              style={{ borderRadius: 0 }}
            >
              SELECT EXISTING RACE
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 text-xs font-medium transition-all font-mono tracking-wider ${
                activeTab === 'create'
                  ? 'bg-accent-yellow text-terminal-bg'
                  : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
              }`}
              style={{ borderRadius: 0 }}
            >
              CREATE NEW RACE
            </button>
          </div>


          {/* Tab Content */}
          {activeTab === 'select' && (
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
                  {updatedRaces.map((race) => (
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
                    <h4 className="text-discipline-swim font-semibold mb-3 flex items-center gap-2 font-mono text-xs tracking-wider">
                      🏊‍♂️ SWIM
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
                          placeholder="12:30 OR 1:12:30"
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
                    className="bg-terminal-panel border-2 border-accent-yellow/30 p-4"
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-text-primary font-semibold flex items-center gap-2 font-mono text-xs tracking-wider">
                        <span className="text-discipline-swim">🏊‍♂️</span>
                        <span>→</span>
                        <span className="text-discipline-bike">🚴‍♂️</span>
                        <span className="ml-2">T1 TRANSITION</span>
                      </h4>
                      <div className="text-xs text-text-secondary bg-terminal-panel border border-terminal-border px-2 py-1 font-mono"
                        style={{ borderRadius: 0 }}
                      >
                        TARGET: &lt;2:00
                      </div>
                    </div>
                    <input
                      type="text"
                      value={formData.t1_time}
                      onChange={(e) => handleTimeChange('t1_time', e.target.value)}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="2:15 (MM:SS)"
                    />
                    {formData.t1_time && timeToSeconds(formData.t1_time) > 120 && (
                      <p className="text-accent-yellow text-xs mt-2 flex items-center gap-1 font-mono">
                        ⚡ TIP: PRACTICE TRANSITIONS TO GET UNDER 2 MINUTES
                      </p>
                    )}
                    {formData.t1_time && timeToSeconds(formData.t1_time) <= 120 && (
                      <p className="text-discipline-run text-xs mt-2 flex items-center gap-1 font-mono">
                        ✓ GREAT TRANSITION TIME!
                      </p>
                    )}
                  </div>

                  {/* Bike */}
                  <div
                    className="bg-terminal-panel border-2 border-discipline-bike p-4"
                    style={{ borderRadius: 0 }}
                  >
                    <h4 className="text-discipline-bike font-semibold mb-3 flex items-center gap-2 font-mono text-xs tracking-wider">
                      🚴‍♂️ BIKE
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
                          placeholder="42:30 OR 1:10:00"
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
                    className="bg-terminal-panel border-2 border-accent-yellow/30 p-4"
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-text-primary font-semibold flex items-center gap-2 font-mono text-xs tracking-wider">
                        <span className="text-discipline-bike">🚴‍♂️</span>
                        <span>→</span>
                        <span className="text-discipline-run">🏃‍♂️</span>
                        <span className="ml-2">T2 TRANSITION</span>
                      </h4>
                      <div className="text-xs text-text-secondary bg-terminal-panel border border-terminal-border px-2 py-1 font-mono"
                        style={{ borderRadius: 0 }}
                      >
                        TARGET: &lt;1:30
                      </div>
                    </div>
                    <input
                      type="text"
                      value={formData.t2_time}
                      onChange={(e) => handleTimeChange('t2_time', e.target.value)}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="1:45 (MM:SS)"
                    />
                    {formData.t2_time && timeToSeconds(formData.t2_time) > 90 && (
                      <p className="text-accent-yellow text-xs mt-2 flex items-center gap-1 font-mono">
                        ⚡ TIP: QUICK HELMET REMOVAL AND SHOE CHANGE SAVES SECONDS
                      </p>
                    )}
                    {formData.t2_time && timeToSeconds(formData.t2_time) <= 90 && (
                      <p className="text-discipline-run text-xs mt-2 flex items-center gap-1 font-mono">
                        ✓ EXCELLENT TRANSITION TIME!
                      </p>
                    )}
                  </div>

                  {/* Run */}
                  <div
                    className="bg-terminal-panel border-2 border-discipline-run p-4"
                    style={{ borderRadius: 0 }}
                  >
                    <h4 className="text-discipline-run font-semibold mb-3 flex items-center gap-2 font-mono text-xs tracking-wider">
                      🏃‍♂️ RUN
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
                          placeholder="23:45 OR 1:23:45"
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
                      <h4 className="text-text-secondary font-medium mb-2 text-xs font-mono tracking-wider">
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
                    <h4 className="text-text-primary font-semibold mb-3 font-mono text-xs tracking-wider">
                      📋 REVIEW YOUR RESULT
                    </h4>
                    <div className="text-text-secondary space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><span className="text-text-primary font-medium">
                            RACE:
                          </span> {updatedRaces.find(r => r.id === formData.race_id)?.name || 'NOT SELECTED'}</p>
                          <p><span className="text-text-primary font-medium">
                            DATE:
                          </span> {formData.result_date || 'NOT SET'}</p>
                          <p><span className="text-text-primary font-medium">
                            TOTAL TIME:
                          </span> {formatTotalTime()}</p>
                        </div>
                        <div>
                          {formData.overall_place && <p><span className="text-text-primary font-medium">
                            OVERALL PLACE:
                          </span> #{formData.overall_place}</p>}
                          {formData.age_group_place && <p><span className="text-text-primary font-medium">
                            AGE GROUP PLACE:
                          </span> #{formData.age_group_place}</p>}
                          {formData.swim_pace && <p><span className="text-text-primary font-medium">
                            SWIM PACE:
                          </span> {formData.swim_pace}/100m</p>}
                          {formData.avg_speed && <p><span className="text-text-primary font-medium">
                            BIKE SPEED:
                          </span> {formData.avg_speed} mph</p>}
                          {formData.run_pace && <p><span className="text-text-primary font-medium">
                            RUN PACE:
                          </span> {formData.run_pace}/mile</p>}
                        </div>
                      </div>
                      {formData.notes && (
                        <div className="mt-3 pt-3 border-t border-terminal-border">
                          <p><span className="text-text-primary font-medium">
                            NOTES:
                          </span></p>
                          <p className="mt-1 text-text-secondary italic">
                            &quot;{formData.notes}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div
                    className="bg-terminal-panel border-2 border-terminal-border p-4"
                    style={{ borderRadius: 0 }}
                  >
                    <h4 className="text-text-primary font-semibold mb-3 flex items-center gap-2 font-mono text-xs tracking-wider">
                      📝 RACE NOTES
                    </h4>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow resize-vertical font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="ADD ANY NOTES ABOUT THIS RACE - HOW YOU FELT, WEATHER CONDITIONS, STRATEGY, ETC."
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
                className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                SAVE RACE RESULT
              </button>
            </div>
            </form>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <div
                className="bg-terminal-panel border-2 border-terminal-border p-6 text-center"
                style={{ borderRadius: 0 }}
              >
                <h3 className="text-sm font-bold text-text-primary mb-4 font-mono tracking-wider">
                  CREATE A NEW RACE
                </h3>
                <p className="text-text-secondary mb-6 text-xs font-mono">
                  CREATE YOUR OWN CUSTOM RACE TO ADD RESULTS FOR EVENTS THAT AREN&apos;T IN OUR DATABASE.
                </p>
                <button
                  onClick={() => setShowCreateRaceModal(true)}
                  disabled={isCreatingRace}
                  className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto font-mono tracking-wider"
                  style={{ borderRadius: 0 }}
                >
                  {isCreatingRace ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      CREATING RACE...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      CREATE NEW RACE
                    </>
                  )}
                </button>
              </div>

              {formData.race_id && (
                <div
                  className="bg-terminal-panel border-2 border-discipline-run p-4"
                  style={{ borderRadius: 0 }}
                >
                  <p className="text-discipline-run text-xs font-medium mb-2 font-mono">
                    ✓ RACE CREATED SUCCESSFULLY!
                  </p>
                  <p className="text-text-secondary text-xs font-mono">
                    YOUR NEW RACE HAS BEEN CREATED AND SELECTED. SWITCH TO THE &quot;SELECT EXISTING RACE&quot; TAB TO CONTINUE ADDING YOUR RESULT.
                  </p>
                  <button
                    onClick={() => setActiveTab('select')}
                    className="mt-3 bg-terminal-panel border-2 border-discipline-run text-discipline-run px-4 py-2 text-xs font-medium transition-colors hover:bg-discipline-run/10 font-mono tracking-wider"
                    style={{ borderRadius: 0 }}
                  >
                    CONTINUE TO ADD RESULT
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Race Modal */}
      {showCreateRaceModal && (
        <UserRaceFormModal
          mode="create"
          onClose={() => setShowCreateRaceModal(false)}
          onSubmit={handleCreateRace}
        />
      )}
    </div>
  );
};
