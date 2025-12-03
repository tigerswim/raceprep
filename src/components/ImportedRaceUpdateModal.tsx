import React, { useState, useEffect } from 'react';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTerminalModeToggle } from '../hooks/useTerminalModeToggle';
import { getTerminalModeState } from '../utils/featureFlags';

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

  // Terminal mode
  useTerminalModeToggle();
  const [useTerminal, setUseTerminal] = useState(() => {
    const override = getTerminalModeState();
    if (override !== false) return override;
    return true;
  });

  // Listen for terminal mode changes
  useEffect(() => {
    const handleTerminalModeChange = () => {
      setUseTerminal(getTerminalModeState());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("terminalModeChanged", handleTerminalModeChange);
      return () => {
        window.removeEventListener("terminalModeChanged", handleTerminalModeChange);
      };
    }
  }, []);
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

  // Initialize form with race data and existing user preferences
  useEffect(() => {
    if (race) {
      // Enhanced race detection logic - match the working logic from races.tsx exactly
      // A race is user-created if:
      // 1. It has source === 'user_created' (set when loading user races)
      // 2. It lacks both external identifiers (externalRaceId and registration_url)
      // 3. It has a registration_url that equals '#' (default for user races)
      // 4. It came from the RunSignup discovery but was saved without external IDs

      const hasExternalId = !!race.externalRaceId || !!race.race_id;
      const hasExternalUrl = race.registration_url && race.registration_url !== '#' && race.registration_url !== 'https://example.com/register';
      const isMarkedAsUserCreated = race.source === 'user_created';

      // A race is user-created if it's explicitly marked OR lacks external identifiers
      const isUserCreatedRace = isMarkedAsUserCreated || (!hasExternalId && !hasExternalUrl);

      const defaultDistanceType = isUserCreatedRace ? 'custom' : 'sprint';
      const userDistanceType = race.distance_type || defaultDistanceType;
      const mappedDistanceType = mapDistanceType(userDistanceType);

      // CRITICAL FIX: Handle different field names for user-created vs imported races
      // User-created races use: swim_distance, bike_distance, run_distance
      // Imported races use: user_swim_distance, user_bike_distance, user_run_distance
      const swimDist = race.user_swim_distance || race.swim_distance;
      const bikeDist = race.user_bike_distance || race.bike_distance;
      const runDist = race.user_run_distance || race.run_distance;

      const initialFormData = {
        distance_type: mappedDistanceType,
        status: race.status || 'interested',
        swim_distance: swimDist?.toString() || '',
        bike_distance: bikeDist?.toString() || '',
        run_distance: runDist?.toString() || '',
        custom_distances: !!(swimDist || bikeDist || runDist),
        notes: race.notes || ''
      };

      console.log('🔍 ENHANCED MODAL DETECTION - VERSION 3.0');
      console.log('DEBUG: Distance field detection:', {
        user_swim_distance: race.user_swim_distance,
        swim_distance: race.swim_distance,
        selected_swim: swimDist,
        user_bike_distance: race.user_bike_distance,
        bike_distance: race.bike_distance,
        selected_bike: bikeDist,
        user_run_distance: race.user_run_distance,
        run_distance: race.run_distance,
        selected_run: runDist,
        custom_distances_detected: !!(swimDist || bikeDist || runDist)
      });
      console.log('DEBUG: Modal initialization - race data:', race);
      console.log('DEBUG: Enhanced race detection details:', {
        raceId: race.id,
        raceName: race.name,
        raceSource: race.source,
        hasExternalRaceId: !!race.externalRaceId,
        hasRaceId: !!race.race_id,
        hasExternalId: hasExternalId,
        registrationUrl: race.registration_url,
        hasValidExternalUrl: hasExternalUrl,
        isMarkedAsUserCreated: isMarkedAsUserCreated,
        finalDetectionResult: isUserCreatedRace,
        defaultDistanceType: defaultDistanceType
      });
      console.log('DEBUG: Modal initialization - form data:', initialFormData);

      setFormData(initialFormData);

      // Set default distances based on race type, but only if no custom distances exist
      // CRITICAL FIX: Use the same field detection logic as above
      if (!swimDist && !bikeDist && !runDist) {
        console.log('🔧 No custom distances found, applying defaults for type:', mappedDistanceType);
        updateDistancesForType(mappedDistanceType);
      } else {
        console.log('🎯 Custom distances found, preserving them:', { swimDist, bikeDist, runDist });
      }
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
    console.log('DEBUG: Toggle custom distances clicked, current state:', formData.custom_distances);
    setFormData(prev => {
      const newState = {
        ...prev,
        custom_distances: !prev.custom_distances
      };
      console.log('DEBUG: Toggle custom distances new state:', newState.custom_distances);
      return newState;
    });
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
    console.log('🚀 NEW MODAL SUBMIT FUNCTION LOADED - VERSION 2.0');
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Ensure distance_type is always a valid database value
      const validDistanceType = mapDistanceType(formData.distance_type);

      // Use the same enhanced detection logic as initialization
      const hasExternalId = !!race.externalRaceId || !!race.race_id;
      const hasExternalUrl = race.registration_url && race.registration_url !== '#' && race.registration_url !== 'https://example.com/register';
      const isMarkedAsUserCreated = race.source === 'user_created';
      const isUserCreatedRace = isMarkedAsUserCreated || (!hasExternalId && !hasExternalUrl);

      console.log('🚀 ENHANCED MODAL SUBMIT - VERSION 3.0');
      console.log('DEBUG: Form submission started');
      console.log('DEBUG: Form data being submitted:', formData);
      console.log('DEBUG: Valid distance type:', validDistanceType);
      console.log('DEBUG: Enhanced race type detection:', {
        raceId: race.id,
        raceName: race.name,
        source: race.source,
        hasExternalId: hasExternalId,
        hasExternalUrl: hasExternalUrl,
        isMarkedAsUserCreated: isMarkedAsUserCreated,
        finalDetectionResult: isUserCreatedRace
      });

      let result;

      if (isUserCreatedRace) {
        // For user-created races, start with basic fields including distance_type
        const basicData = {
          name: race.name,
          date: race.date,
          location: race.location,
          status: formData.status,
          distance_type: validDistanceType // Ensure distance_type is always included
        };

        result = await dbHelpers.userRaces.update(race.id, basicData);

        // Now try to add all other fields in one update
        if (!result.error) {
          const extendedData = {
            ...basicData,
            ...(formData.notes.trim() && { notes: formData.notes.trim() }),
            ...(formData.custom_distances && {
              swim_distance: parseFloat(formData.swim_distance || '0'),
              bike_distance: parseFloat(formData.bike_distance || '0'),
              run_distance: parseFloat(formData.run_distance || '0')
            })
          };

          const extendedResult = await dbHelpers.userRaces.update(race.id, extendedData);

          if (!extendedResult.error) {
            result = extendedResult; // Use the extended result if successful
          } else {
            console.warn('Extended fields update failed:', extendedResult.error);
            // Keep the basic result since it succeeded
          }
        }
      } else {
        // For imported races, use the userPlannedRaces helper
        const updateData: any = {
          status: formData.status,
          distance_type: validDistanceType,
          notes: formData.notes.trim() || null
        };

        // Handle distance preferences
        if (formData.custom_distances) {
          // User wants custom distances - save their specified values
          updateData.user_swim_distance = parseFloat(formData.swim_distance);
          updateData.user_bike_distance = parseFloat(formData.bike_distance);
          updateData.user_run_distance = parseFloat(formData.run_distance);
        } else {
          // User wants standard distances - clear any previous custom distance overrides
          updateData.user_swim_distance = null;
          updateData.user_bike_distance = null;
          updateData.user_run_distance = null;
        }

        console.log('🔧 DISTANCE UPDATE: Updating imported race with data:', updateData);
        console.log('🔧 DISTANCE UPDATE: Race ID:', race.id);
        console.log('🔧 DISTANCE UPDATE: validDistanceType:', validDistanceType);
        result = await dbHelpers.userPlannedRaces.update(race.id, updateData);
        console.log('🔧 DISTANCE UPDATE: Update result:', result);
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
          console.log('Calling onUpdate to refresh UI...');

          // Close modal immediately to show the change
          onClose();

          // Delay the onUpdate call to allow local state updates to settle
          setTimeout(() => {
            console.log('🕐 Delayed onUpdate call for fallback update');
            onUpdate();
          }, 500);
          return;
        }
      }

      console.log('Update succeeded, calling onUpdate to refresh UI...');
      console.log('Final result data before refresh:', result.data);

      // Close modal immediately to show the change
      onClose();

      // Delay the onUpdate call to allow local state updates to settle
      setTimeout(() => {
        console.log('🕐 Delayed onUpdate call to preserve status changes');
        onUpdate();
      }, 500);
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
        <div
          className={useTerminal ?
            "bg-terminal-panel border-2 border-terminal-border p-6" :
            "bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          }
          style={useTerminal ? { borderRadius: 0 } : undefined}
        >
          <div className={useTerminal ?
            "text-text-primary text-center font-mono" :
            "text-white text-center"
          }>
            {useTerminal ? 'LOADING...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={useTerminal ?
          "bg-terminal-panel border-2 border-terminal-border max-w-2xl w-full max-h-[90vh] overflow-auto" :
          "bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-auto"
        }
        style={useTerminal ? { borderRadius: 0 } : undefined}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={useTerminal ?
              "text-xl font-bold text-text-primary font-mono tracking-wider" :
              "text-2xl font-bold text-white"
            }>
              {useTerminal ? 'UPDATE RACE DETAILS' : 'Update Race Details'}
            </h2>
            <button
              onClick={onClose}
              className={useTerminal ?
                "text-text-secondary hover:text-text-primary text-2xl font-mono" :
                "text-white/70 hover:text-white text-2xl"
              }
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
                  <label className={useTerminal ?
                    "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                    "block text-white/80 text-sm font-medium mb-2"
                  }>
                    {useTerminal ? 'DISTANCE I\'M COMPETING IN *' : 'Distance I\'m Competing In *'}
                  </label>
                  <select
                    value={formData.distance_type}
                    onChange={(e) => handleDistanceTypeChange(e.target.value)}
                    className={useTerminal ?
                      "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono" :
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                    required
                  >
                    <option value="sprint">{useTerminal ? 'SPRINT' : 'Sprint'}</option>
                    <option value="olympic">{useTerminal ? 'OLYMPIC' : 'Olympic'}</option>
                    <option value="half">{useTerminal ? 'HALF IRONMAN (70.3)' : 'Half Ironman (70.3)'}</option>
                    <option value="ironman">{useTerminal ? 'IRONMAN' : 'Ironman'}</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className={useTerminal ?
                    "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                    "block text-white/80 text-sm font-medium mb-2"
                  }>
                    {useTerminal ? 'STATUS *' : 'Status *'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={useTerminal ?
                      "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono" :
                      "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                    required
                  >
                    <option value="interested">{useTerminal ? 'INTERESTED' : 'Interested'}</option>
                    <option value="registered">{useTerminal ? 'REGISTERED' : 'Registered'}</option>
                    <option value="completed">{useTerminal ? 'COMPLETED' : 'Completed'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Distance Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Distance Details</h3>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium transition-colors ${!formData.custom_distances ? 'text-white' : 'text-white/50'}`}>
                    Standard
                  </span>
                  <button
                    type="button"
                    onClick={toggleCustomDistances}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formData.custom_distances ? 'bg-orange-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        formData.custom_distances ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium transition-colors ${formData.custom_distances ? 'text-white' : 'text-white/50'}`}>
                    Custom
                  </span>
                </div>
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
                className={useTerminal ?
                  "bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 font-mono tracking-wider" :
                  "bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {useTerminal ? 'CANCEL' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={useTerminal ?
                  "bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-mono tracking-wider" :
                  "bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {useTerminal ? 'UPDATING...' : 'Updating...'}
                  </>
                ) : (
                  useTerminal ? 'UPDATE RACE' : 'Update Race'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};