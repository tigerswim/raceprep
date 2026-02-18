import { logger } from '../utils/logger';
import React, { useState, useEffect } from 'react';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserRaceFormModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  mode: 'create' | 'edit';
  existingRace?: any;
}

export const UserRaceFormModal: React.FC<UserRaceFormModalProps> = ({
  onClose,
  onSubmit,
  mode,
  existingRace
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [userSettings, setUserSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    distance_type: 'sprint',
    swim_distance: '',
    bike_distance: '',
    run_distance: '',
    difficulty_score: 5,
    description: '',
    website_url: ''
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
        logger.warn('Failed to load user settings, using imperial default:', error);
        setUserSettings({ distance_units: 'imperial' });
      }
    };

    loadUserSettings();
  }, [user]);

  // Get standard distances based on user's preferred units
  const getStandardDistances = () => {
    const isMetric = userSettings?.distance_units === 'metric';

    if (isMetric) {
      // Metric units (meters for swim, km for bike/run)
      return {
        sprint: { swim: 750, bike: 20, run: 5 },
        olympic: { swim: 1500, bike: 40, run: 10 },
        half: { swim: 1900, bike: 90, run: 21.1 },
        ironman: { swim: 3800, bike: 180, run: 42.2 },
        custom: { swim: '', bike: '', run: '' }
      };
    } else {
      // Imperial units (yards for swim, miles for bike/run)
      return {
        sprint: { swim: 820, bike: 12.4, run: 3.1 },
        olympic: { swim: 1640, bike: 24.8, run: 6.2 },
        half: { swim: 2080, bike: 56, run: 13.1 },
        ironman: { swim: 4156, bike: 112, run: 26.2 },
        custom: { swim: '', bike: '', run: '' }
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

  // Initialize form data when modal opens or existingRace changes
  useEffect(() => {
    if (mode === 'edit' && existingRace) {
      setFormData({
        name: existingRace.name || '',
        date: existingRace.date || '',
        location: existingRace.location || '',
        distance_type: existingRace.distance_type || 'sprint',
        swim_distance: existingRace.swim_distance?.toString() || '',
        bike_distance: existingRace.bike_distance?.toString() || '',
        run_distance: existingRace.run_distance?.toString() || '',
        difficulty_score: existingRace.difficulty_score || 5,
        description: existingRace.description || '',
        website_url: existingRace.website_url || ''
      });
    } else {
      // Set default values for create mode
      const defaultDistances = getStandardDistances().sprint;
      setFormData({
        name: '',
        date: '',
        location: '',
        distance_type: 'sprint',
        swim_distance: defaultDistances.swim.toString(),
        bike_distance: defaultDistances.bike.toString(),
        run_distance: defaultDistances.run.toString(),
        difficulty_score: 5,
        description: '',
        website_url: ''
      });
    }
  }, [mode, existingRace]);

  // Handle distance type change and auto-populate distances
  const handleDistanceTypeChange = (distanceType: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, distance_type: distanceType };

      if (distanceType !== 'custom') {
        const standardDistances = getStandardDistances();
        const defaults = standardDistances[distanceType as keyof typeof standardDistances] as any;
        newFormData.swim_distance = defaults.swim.toString();
        newFormData.bike_distance = defaults.bike.toString();
        newFormData.run_distance = defaults.run.toString();
      }

      return newFormData;
    });

    // Clear any distance-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.swim_distance;
      delete newErrors.bike_distance;
      delete newErrors.run_distance;
      return newErrors;
    });
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Race name is required';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Race name must be less than 200 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Race date is required';
    } else {
      const raceDate = new Date(formData.date);
      const today = new Date();
      const fiveYearsAgo = new Date();
      const tenYearsFromNow = new Date();
      fiveYearsAgo.setFullYear(today.getFullYear() - 5);
      tenYearsFromNow.setFullYear(today.getFullYear() + 10);

      if (isNaN(raceDate.getTime())) {
        newErrors.date = 'Invalid date format';
      } else if (raceDate < fiveYearsAgo) {
        newErrors.date = 'Race date cannot be more than 5 years in the past';
      } else if (raceDate > tenYearsFromNow) {
        newErrors.date = 'Race date cannot be more than 10 years in the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Race location is required';
    } else if (formData.location.trim().length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    // Custom distance validation
    if (formData.distance_type === 'custom') {
      const swimDistance = parseFloat(formData.swim_distance);
      const bikeDistance = parseFloat(formData.bike_distance);
      const runDistance = parseFloat(formData.run_distance);

      if (!formData.swim_distance || isNaN(swimDistance) || swimDistance <= 0) {
        newErrors.swim_distance = 'Valid swim distance is required for custom races';
      }
      if (!formData.bike_distance || isNaN(bikeDistance) || bikeDistance <= 0) {
        newErrors.bike_distance = 'Valid bike distance is required for custom races';
      }
      if (!formData.run_distance || isNaN(runDistance) || runDistance <= 0) {
        newErrors.run_distance = 'Valid run distance is required for custom races';
      }
    }

    // Optional fields validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.website_url && formData.website_url.trim() && !isValidUrl(formData.website_url.trim())) {
      newErrors.website_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        location: formData.location.trim(),
        swim_distance: formData.swim_distance ? parseFloat(formData.swim_distance) : null,
        bike_distance: formData.bike_distance ? parseFloat(formData.bike_distance) : null,
        run_distance: formData.run_distance ? parseFloat(formData.run_distance) : null,
        description: formData.description.trim() || null,
        website_url: formData.website_url.trim() || null
      };

      await onSubmit(submitData);
    } catch (error: any) {
      logger.error('Error submitting race form:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-terminal-panel border-2 border-terminal-border max-w-2xl w-full max-h-[90vh] overflow-auto"
        style={{ borderRadius: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary font-mono tracking-wider">
              {mode === 'create' ? 'CREATE NEW RACE' : 'EDIT RACE'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Race Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                RACE INFORMATION
              </h3>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  RACE NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="E.G., ATLANTA SPRINT TRIATHLON 2025"
                  required
                />
                {errors.name && <p className="text-red-400 text-xs mt-1 font-mono">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    RACE DATE *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    required
                  />
                  {errors.date && <p className="text-red-400 text-xs mt-1 font-mono">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    LOCATION *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="E.G., ATLANTA, GA"
                    required
                  />
                  {errors.location && <p className="text-red-400 text-xs mt-1 font-mono">{errors.location}</p>}
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  DISTANCE TYPE *
                </label>
                <select
                  value={formData.distance_type}
                  onChange={(e) => handleDistanceTypeChange(e.target.value)}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  required
                >
                  <option value="sprint">SPRINT</option>
                  <option value="olympic">OLYMPIC</option>
                  <option value="half">HALF IRONMAN (70.3)</option>
                  <option value="ironman">IRONMAN</option>
                  <option value="custom">CUSTOM</option>
                </select>
              </div>
            </div>

            {/* Distance Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                DISTANCE DETAILS
              </h3>

              {formData.distance_type === 'custom' && (
                <p className="text-accent-yellow text-xs mb-4 font-mono">
                  PLEASE SPECIFY CUSTOM DISTANCES FOR YOUR RACE
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className="bg-terminal-panel border-2 border-discipline-swim p-4"
                  style={{ borderRadius: 0 }}
                >
                  <label className="block text-discipline-swim font-semibold mb-2 flex items-center gap-2 text-xs font-mono tracking-wider">
                    <span>🏊‍♂️</span> SWIM DISTANCE
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.swim_distance}
                      onChange={(e) => handleInputChange('swim_distance', e.target.value)}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="750"
                      disabled={formData.distance_type !== 'custom'}
                    />
                    <p className="text-discipline-swim/70 text-xs font-mono">
                      {getDistanceUnits().swim}
                    </p>
                    {errors.swim_distance && <p className="text-red-400 text-xs font-mono">{errors.swim_distance}</p>}
                  </div>
                </div>

                <div
                  className="bg-terminal-panel border-2 border-discipline-bike p-4"
                  style={{ borderRadius: 0 }}
                >
                  <label className="block text-discipline-bike font-semibold mb-2 flex items-center gap-2 text-xs font-mono tracking-wider">
                    <span>🚴‍♂️</span> BIKE DISTANCE
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bike_distance}
                      onChange={(e) => handleInputChange('bike_distance', e.target.value)}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="20"
                      disabled={formData.distance_type !== 'custom'}
                    />
                    <p className="text-discipline-bike/70 text-xs font-mono">
                      {getDistanceUnits().bike}
                    </p>
                    {errors.bike_distance && <p className="text-red-400 text-xs font-mono">{errors.bike_distance}</p>}
                  </div>
                </div>

                <div
                  className="bg-terminal-panel border-2 border-discipline-run p-4"
                  style={{ borderRadius: 0 }}
                >
                  <label className="block text-discipline-run font-semibold mb-2 flex items-center gap-2 text-xs font-mono tracking-wider">
                    <span>🏃‍♂️</span> RUN DISTANCE
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.run_distance}
                      onChange={(e) => handleInputChange('run_distance', e.target.value)}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="5"
                      disabled={formData.distance_type !== 'custom'}
                    />
                    <p className="text-discipline-run/70 text-xs font-mono">
                      {getDistanceUnits().run}
                    </p>
                    {errors.run_distance && <p className="text-red-400 text-xs font-mono">{errors.run_distance}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                ADDITIONAL DETAILS
              </h3>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  DIFFICULTY (1-10 SCALE)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.difficulty_score}
                    onChange={(e) => handleInputChange('difficulty_score', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-text-secondary text-xs px-1 font-mono">
                    <span>BEGINNER</span>
                    <span className="text-accent-yellow font-medium">{formData.difficulty_score}/10</span>
                    <span>EXPERT</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow resize-vertical font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="OPTIONAL DESCRIPTION ABOUT THE RACE, COURSE DETAILS, ETC."
                  rows={3}
                  maxLength={1000}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1 font-mono">{errors.description}</p>}
                <p className="text-text-secondary text-xs mt-1 font-mono">
                  {formData.description.length}/1000 CHARACTERS
                </p>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  WEBSITE URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="HTTPS://EXAMPLE.COM/RACE-INFO"
                />
                {errors.website_url && <p className="text-red-400 text-xs mt-1 font-mono">{errors.website_url}</p>}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div
                className="bg-terminal-panel border-2 border-red-400/50 p-4"
                style={{ borderRadius: 0 }}
              >
                <p className="text-red-400 text-xs font-mono">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'create' ? 'CREATING...' : 'UPDATING...'}
                  </>
                ) : (
                  mode === 'create' ? 'CREATE RACE' : 'UPDATE RACE'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};
