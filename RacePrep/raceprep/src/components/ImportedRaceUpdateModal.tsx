import React, { useState, useEffect } from 'react';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ImportedRaceUpdateModalProps {
  race: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const ImportedRaceUpdateModal: React.FC<ImportedRaceUpdateModalProps> = ({
  race,
  onClose,
  onUpdate
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [userSettings, setUserSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    distance_type: 'sprint',
    status: 'interested' as 'interested' | 'registered' | 'completed',
    swim_distance: '',
    bike_distance: '',
    run_distance: '',
    custom_distances: false,
    notes: ''
  });

  // Load user settings for distance units
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;

      try {
        const { data: settings, error } = await dbHelpers.userSettings.get();
        if (!error && settings) {
          setUserSettings(settings);
        } else {
          // Default to imperial if no settings found
          setUserSettings({ distance_units: 'imperial' });
        }
      } catch (error) {
        console.warn('Failed to load user settings, using imperial default:', error);
        setUserSettings({ distance_units: 'imperial' });
      }
    };

    loadUserSettings();
  }, [user]);

  // Map external distance types to database-compatible values
  const mapDistanceType = (distanceType: string): string => {
    switch (distanceType.toLowerCase()) {
      case '70.3':
      case 'half ironman':
      case 'half':
        return 'half';
      case 'ironman':
      case 'full ironman':
        return 'ironman';
      case 'olympic':
      case 'international':
        return 'olympic';
      case 'sprint':
        return 'sprint';
      default:
        return 'sprint'; // Default fallback
    }
  };

  // Initialize form with race data
  useEffect(() => {
    if (race) {
      const mappedDistanceType = mapDistanceType(race.distance_type || 'sprint');

      setFormData({
        distance_type: mappedDistanceType,
        status: race.status || 'interested',
        swim_distance: '',
        bike_distance: '',
        run_distance: '',
        custom_distances: false,
        notes: ''
      });

      // Set default distances based on race type
      updateDistancesForType(mappedDistanceType);
    }
  }, [race]);

  // Get standard distances based on user's preferred units
  const getStandardDistances = () => {
    const isMetric = userSettings?.distance_units === 'metric';

    if (isMetric) {
      // Metric units (meters for swim, km for bike/run)
      return {
        sprint: { swim: 750, bike: 20, run: 5 },
        olympic: { swim: 1500, bike: 40, run: 10 },
        half: { swim: 1900, bike: 90, run: 21.1 },
        ironman: { swim: 3800, bike: 180, run: 42.2 }
      };
    } else {
      // Imperial units (yards for swim, miles for bike/run)
      return {
        sprint: { swim: 820, bike: 12.4, run: 3.1 },
        olympic: { swim: 1640, bike: 24.8, run: 6.2 },
        half: { swim: 2080, bike: 56, run: 13.1 },
        ironman: { swim: 4156, bike: 112, run: 26.2 }
      };
    }
  };

  // Get distance unit labels
  const getDistanceUnits = () => {
    const isMetric = userSettings?.distance_units === 'metric';
    return {
      swim: isMetric ? 'meters' : 'yards',
      bike: isMetric ? 'km' : 'miles',
      run: isMetric ? 'km' : 'miles'
    };
  };

  // Update distances when type changes
  const updateDistancesForType = (distanceType: string) => {
    const standardDistances = getStandardDistances();
    const defaults = standardDistances[distanceType as keyof typeof standardDistances];

    if (defaults) {
      setFormData(prev => ({
        ...prev,
        distance_type: distanceType,
        swim_distance: defaults.swim.toString(),
        bike_distance: defaults.bike.toString(),
        run_distance: defaults.run.toString(),
        custom_distances: false
      }));
    }
  };

  const handleDistanceTypeChange = (distanceType: string) => {
    updateDistancesForType(distanceType);
    // Clear distance-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.swim_distance;
      delete newErrors.bike_distance;
      delete newErrors.run_distance;
      return newErrors;
    });
  };

  const toggleCustomDistances = () => {
    setFormData(prev => ({
      ...prev,
      custom_distances: !prev.custom_distances
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (formData.custom_distances) {
      const swimDistance = parseFloat(formData.swim_distance);
      const bikeDistance = parseFloat(formData.bike_distance);
      const runDistance = parseFloat(formData.run_distance);

      if (!formData.swim_distance || isNaN(swimDistance) || swimDistance <= 0) {
        newErrors.swim_distance = 'Valid swim distance is required';
      }
      if (!formData.bike_distance || isNaN(bikeDistance) || bikeDistance <= 0) {
        newErrors.bike_distance = 'Valid bike distance is required';
      }
      if (!formData.run_distance || isNaN(runDistance) || runDistance <= 0) {
        newErrors.run_distance = 'Valid run distance is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Ensure distance_type is always a valid database value
      const validDistanceType = mapDistanceType(formData.distance_type);

      // Detect if this is a user-created race or an imported race
      const isUserCreatedRace = race.source === 'user_created' || race.source === 'User Created' || !race.source;

      console.log('Race type detection:', {
        raceId: race.id,
        source: race.source,
        isUserCreatedRace
      }); // Debug log

      let result;

      if (isUserCreatedRace) {
        // For user-created races, use the userRaces helper
        const updateData = {
          status: formData.status,
          distance_type: validDistanceType,
          ...(formData.custom_distances && {
            swim_distance: parseFloat(formData.swim_distance),
            bike_distance: parseFloat(formData.bike_distance),
            run_distance: parseFloat(formData.run_distance)
          }),
          notes: formData.notes.trim() || null
        };

        console.log('Updating user-created race with data:', updateData); // Debug log
        result = await dbHelpers.userRaces.update(race.id, updateData);
      } else {
        // For imported races, use the userPlannedRaces helper
        const updateData = {
          status: formData.status,
          distance_type: validDistanceType,
          ...(formData.custom_distances && {
            user_swim_distance: parseFloat(formData.swim_distance),
            user_bike_distance: parseFloat(formData.bike_distance),
            user_run_distance: parseFloat(formData.run_distance)
          }),
          notes: formData.notes.trim() || null
        };

        console.log('Updating imported race with data:', updateData); // Debug log
        result = await dbHelpers.userPlannedRaces.update(race.id, updateData);
      }

      console.log('Database update result:', result); // Debug log

      if (result.error) {
        console.error('Database update error details:', result.error);

        // Try a fallback status-only update if the full update failed
        console.log('Attempting status-only fallback update...');

        let fallbackResult;
        if (isUserCreatedRace) {
          fallbackResult = await dbHelpers.userRaces.updateStatus(race.id, formData.status);
        } else {
          fallbackResult = await dbHelpers.userPlannedRaces.updateStatus(race.id, formData.status);
        }

        if (fallbackResult.error) {
          throw new Error(typeof result.error === 'string' ? result.error : result.error.message || 'Failed to update race.');
        } else {
          console.log('Status-only update succeeded');
          alert('Race status updated successfully! Other settings may require database updates.');
          onUpdate();
          onClose();
          return;
        }
      }

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating race:', error);
      setErrors({ submit: error.message || 'Failed to update race. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!userSettings) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Update Race Details</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Race Information */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{race.name}</h3>
                <p className="text-white/70 text-sm">{race.location}</p>
                <p className="text-blue-400 text-sm">{new Date(race.date).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Distance Type Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Distance I'm Competing In *
                  </label>
                  <select
                    value={formData.distance_type}
                    onChange={(e) => handleDistanceTypeChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="sprint">Sprint</option>
                    <option value="olympic">Olympic</option>
                    <option value="half">Half Ironman (70.3)</option>
                    <option value="ironman">Ironman</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="interested">Interested</option>
                    <option value="registered">Registered</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Distance Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Distance Details</h3>
                <button
                  type="button"
                  onClick={toggleCustomDistances}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    formData.custom_distances
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {formData.custom_distances ? 'Use Custom' : 'Use Standard'}
                </button>
              </div>

              {!formData.custom_distances && (
                <div className="bg-blue-500/10 rounded-xl p-4">
                  <p className="text-blue-400 text-sm mb-2">Standard distances for {formData.distance_type}:</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">Swim:</span>
                      <div className="text-white font-medium">{formData.swim_distance} {getDistanceUnits().swim}</div>
                    </div>
                    <div>
                      <span className="text-white/70">Bike:</span>
                      <div className="text-white font-medium">{formData.bike_distance} {getDistanceUnits().bike}</div>
                    </div>
                    <div>
                      <span className="text-white/70">Run:</span>
                      <div className="text-white font-medium">{formData.run_distance} {getDistanceUnits().run}</div>
                    </div>
                  </div>
                </div>
              )}

              {formData.custom_distances && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/10 rounded-xl p-4">
                    <label className="block text-blue-400 font-semibold mb-2 flex items-center gap-2">
                      <span>🏊‍♂️</span> Swim Distance
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.swim_distance}
                        onChange={(e) => handleInputChange('swim_distance', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="750"
                      />
                      <p className="text-blue-400/70 text-xs">{getDistanceUnits().swim}</p>
                      {errors.swim_distance && <p className="text-red-400 text-sm">{errors.swim_distance}</p>}
                    </div>
                  </div>

                  <div className="bg-orange-500/10 rounded-xl p-4">
                    <label className="block text-orange-400 font-semibold mb-2 flex items-center gap-2">
                      <span>🚴‍♂️</span> Bike Distance
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.bike_distance}
                        onChange={(e) => handleInputChange('bike_distance', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="20"
                      />
                      <p className="text-orange-400/70 text-xs">{getDistanceUnits().bike}</p>
                      {errors.bike_distance && <p className="text-red-400 text-sm">{errors.bike_distance}</p>}
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-xl p-4">
                    <label className="block text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <span>🏃‍♂️</span> Run Distance
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.run_distance}
                        onChange={(e) => handleInputChange('run_distance', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="5"
                      />
                      <p className="text-green-400/70 text-xs">{getDistanceUnits().run}</p>
                      {errors.run_distance && <p className="text-red-400 text-sm">{errors.run_distance}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Personal Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
                placeholder="Goals, training notes, or other personal reminders..."
                rows={3}
                maxLength={500}
              />
              <p className="text-white/50 text-xs mt-1">{formData.notes.length}/500 characters</p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Race'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};