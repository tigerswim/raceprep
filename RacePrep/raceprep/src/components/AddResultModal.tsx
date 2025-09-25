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
      console.error('Error creating race:', error);
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
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Add Race Result</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('select')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'select'
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Select Existing Race
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Create New Race
            </button>
          </div>


          {/* Tab Content */}
          {activeTab === 'select' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Race Information */}
              <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Race Information</h3>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Race</label>
                <select
                  value={formData.race_id}
                  onChange={(e) => handleRaceChange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a race</option>
                  {updatedRaces.map((race) => (
                    <option key={race.id} value={race.id}>
                      {race.name} - {race.date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Result Date</label>
                <input
                  type="date"
                  value={formData.result_date}
                  onChange={(e) => setFormData({ ...formData, result_date: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Overall Place</label>
                  <input
                    type="number"
                    value={formData.overall_place}
                    onChange={(e) => setFormData({ ...formData, overall_place: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 42"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Age Group Place</label>
                  <input
                    type="number"
                    value={formData.age_group_place}
                    onChange={(e) => setFormData({ ...formData, age_group_place: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 8"
                  />
                </div>
              </div>
            </div>

            {/* Split Times */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Split Times</h3>
                
                <div className="grid gap-6">
                  {/* Swim */}
                  <div className="bg-blue-500/10 rounded-xl p-4">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                      🏊‍♂️ Swim
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Time (MM:SS or HH:MM:SS)</label>
                        <input
                          type="text"
                          value={formData.swim_time}
                          onChange={(e) => handleTimeChange('swim_time', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12:30 or 1:12:30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Pace per 100m</label>
                        <input
                          type="text"
                          value={formData.swim_pace}
                          onChange={(e) => setFormData({ ...formData, swim_pace: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1:40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* T1 */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white/80 font-semibold mb-3">T1: Swim → Bike</h4>
                    <input
                      type="text"
                      value={formData.t1_time}
                      onChange={(e) => handleTimeChange('t1_time', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2:15"
                    />
                  </div>

                  {/* Bike */}
                  <div className="bg-orange-500/10 rounded-xl p-4">
                    <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                      🚴‍♂️ Bike
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Time (MM:SS or HH:MM:SS)</label>
                        <input
                          type="text"
                          value={formData.bike_time}
                          onChange={(e) => handleTimeChange('bike_time', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="42:30 or 1:10:00"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Avg Speed (mph)</label>
                        <input
                          type="text"
                          value={formData.avg_speed}
                          onChange={(e) => setFormData({ ...formData, avg_speed: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="22.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* T2 */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white/80 font-semibold mb-3">T2: Bike → Run</h4>
                    <input
                      type="text"
                      value={formData.t2_time}
                      onChange={(e) => handleTimeChange('t2_time', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1:45"
                    />
                  </div>

                  {/* Run */}
                  <div className="bg-green-500/10 rounded-xl p-4">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                      🏃‍♂️ Run
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Time (MM:SS or HH:MM:SS)</label>
                        <input
                          type="text"
                          value={formData.run_time}
                          onChange={(e) => handleTimeChange('run_time', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="23:45 or 1:23:45"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Pace per mile</label>
                        <input
                          type="text"
                          value={formData.run_pace}
                          onChange={(e) => setFormData({ ...formData, run_pace: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="7:30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Time Display */}
                  {(formData.swim_time || formData.bike_time || formData.run_time) && (
                    <div className="bg-white/10 rounded-xl p-4 text-center mb-6">
                      <h4 className="text-white/80 font-medium mb-2">Calculated Total Time</h4>
                      <div className="text-2xl font-bold text-white font-mono">{formatTotalTime()}</div>
                    </div>
                  )}

                  {/* Review Section */}
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-semibold mb-3">📋 Review Your Result</h4>
                    <div className="text-white/70 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><span className="text-white/90 font-medium">Race:</span> {updatedRaces.find(r => r.id === formData.race_id)?.name || 'Not selected'}</p>
                          <p><span className="text-white/90 font-medium">Date:</span> {formData.result_date || 'Not set'}</p>
                          <p><span className="text-white/90 font-medium">Total Time:</span> {formatTotalTime()}</p>
                        </div>
                        <div>
                          {formData.overall_place && <p><span className="text-white/90 font-medium">Overall Place:</span> #{formData.overall_place}</p>}
                          {formData.age_group_place && <p><span className="text-white/90 font-medium">Age Group Place:</span> #{formData.age_group_place}</p>}
                          {formData.swim_pace && <p><span className="text-white/90 font-medium">Swim Pace:</span> {formData.swim_pace}/100m</p>}
                          {formData.avg_speed && <p><span className="text-white/90 font-medium">Bike Speed:</span> {formData.avg_speed} mph</p>}
                          {formData.run_pace && <p><span className="text-white/90 font-medium">Run Pace:</span> {formData.run_pace}/mile</p>}
                        </div>
                      </div>
                      {formData.notes && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p><span className="text-white/90 font-medium">Notes:</span></p>
                          <p className="mt-1 text-white/60 italic">&quot;{formData.notes}&quot;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-purple-500/10 rounded-xl p-4">
                    <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                      📝 Race Notes
                    </h4>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
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
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!formData.race_id || !formData.result_date}
                className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Race Result
              </button>
            </div>
            </form>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-4">Create a New Race</h3>
                <p className="text-white/70 mb-6">
                  Create your own custom race to add results for events that aren't in our database.
                </p>
                <button
                  onClick={() => setShowCreateRaceModal(true)}
                  disabled={isCreatingRace}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isCreatingRace ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Creating Race...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Race
                    </>
                  )}
                </button>
              </div>

              {formData.race_id && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 text-sm font-medium mb-2">✓ Race Created Successfully!</p>
                  <p className="text-white/70 text-sm">
                    Your new race has been created and selected. Switch to the "Select Existing Race" tab to continue adding your result.
                  </p>
                  <button
                    onClick={() => setActiveTab('select')}
                    className="mt-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Continue to Add Result
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