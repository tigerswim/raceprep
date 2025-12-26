import React, { useState, useEffect } from 'react';

interface EditCourseModalProps {
  course: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSubmit }) => {

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    distance_type: 'sprint' as 'sprint' | 'olympic' | '70.3' | 'ironman',
    swim_type: 'lake' as 'lake' | 'ocean' | 'river' | 'pool' | null,
    bike_elevation_gain: '',
    run_elevation_gain: '',
    overall_elevation: '',
    difficulty_score: '',
    wetsuit_legal: null as boolean | null,
    description: '',
    website_url: '',
    features: [] as string[]
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        location: course.location || '',
        distance_type: course.distance_type || 'sprint',
        swim_type: course.swim_type || null,
        bike_elevation_gain: course.bike_elevation_gain?.toString() || '',
        run_elevation_gain: course.run_elevation_gain?.toString() || '',
        overall_elevation: course.overall_elevation?.toString() || '',
        difficulty_score: course.difficulty_score?.toString() || '',
        wetsuit_legal: course.wetsuit_legal,
        description: course.description || '',
        website_url: course.website_url || '',
        features: course.features || []
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const courseData = {
      name: formData.name,
      location: formData.location,
      distance_type: formData.distance_type,
      swim_type: formData.swim_type || null,
      bike_elevation_gain: formData.bike_elevation_gain ? parseInt(formData.bike_elevation_gain) : null,
      run_elevation_gain: formData.run_elevation_gain ? parseInt(formData.run_elevation_gain) : null,
      overall_elevation: formData.overall_elevation ? parseInt(formData.overall_elevation) : null,
      difficulty_score: formData.difficulty_score ? parseInt(formData.difficulty_score) : null,
      wetsuit_legal: formData.wetsuit_legal,
      description: formData.description || null,
      website_url: formData.website_url || null,
      features: formData.features.length > 0 ? formData.features : null
    };

    onSubmit(courseData);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      // Split by comma and clean up each feature
      const featuresToAdd = newFeature
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0)
        .filter(feature => !formData.features.includes(feature)); // Avoid duplicates
      
      setFormData({
        ...formData,
        features: [...formData.features, ...featuresToAdd]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
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
              EDIT COURSE
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                BASIC INFORMATION
              </h3>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  COURSE NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="e.g. Lake Lanier Olympic Course"
                  required
                />
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  LOCATION *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                  style={{ borderRadius: 0 }}
                  placeholder="e.g. Lake Lanier, GA"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    DISTANCE TYPE *
                  </label>
                  <select
                    value={formData.distance_type}
                    onChange={(e) => setFormData({ ...formData, distance_type: e.target.value as any })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono uppercase"
                    style={{ borderRadius: 0 }}
                    required
                  >
                    <option value="sprint">SPRINT</option>
                    <option value="olympic">OLYMPIC</option>
                    <option value="70.3">70.3</option>
                    <option value="ironman">IRONMAN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    SWIM TYPE
                  </label>
                  <select
                    value={formData.swim_type || ''}
                    onChange={(e) => setFormData({ ...formData, swim_type: e.target.value as any || null })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono uppercase"
                    style={{ borderRadius: 0 }}
                  >
                    <option value="">SELECT TYPE</option>
                    <option value="lake">LAKE</option>
                    <option value="ocean">OCEAN</option>
                    <option value="river">RIVER</option>
                    <option value="pool">POOL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Elevation & Difficulty */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                COURSE PROFILE
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    BIKE ELEV GAIN (FT)
                  </label>
                  <input
                    type="number"
                    value={formData.bike_elevation_gain}
                    onChange={(e) => setFormData({ ...formData, bike_elevation_gain: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="1200"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    RUN ELEV GAIN (FT)
                  </label>
                  <input
                    type="number"
                    value={formData.run_elevation_gain}
                    onChange={(e) => setFormData({ ...formData, run_elevation_gain: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="300"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    COURSE ELEV (FT)
                  </label>
                  <input
                    type="number"
                    value={formData.overall_elevation}
                    onChange={(e) => setFormData({ ...formData, overall_elevation: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="1500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    DIFFICULTY SCORE (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.difficulty_score}
                    onChange={(e) => setFormData({ ...formData, difficulty_score: e.target.value })}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="7"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    WETSUIT LEGAL
                  </label>
                  <select
                    value={formData.wetsuit_legal === null ? '' : formData.wetsuit_legal.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        wetsuit_legal: value === '' ? null : value === 'true'
                      });
                    }}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono uppercase"
                    style={{ borderRadius: 0 }}
                  >
                    <option value="">UNKNOWN</option>
                    <option value="true">YES</option>
                    <option value="false">NO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                COURSE FEATURES
              </h3>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                  ADD FEATURE
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="e.g. Rolling hills, Technical bike course, Beginner friendly"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="bg-terminal-panel border-2 border-discipline-swim text-discipline-swim px-4 py-3 font-medium hover:bg-discipline-swim/10 transition-colors font-mono tracking-wider"
                    style={{ borderRadius: 0 }}
                  >
                    ADD
                  </button>
                </div>
                <p className="text-text-secondary text-xs mt-1 font-mono">
                  SEPARATE MULTIPLE FEATURES WITH COMMAS
                </p>
              </div>

              {formData.features.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-text-secondary text-xs font-medium font-mono tracking-wider uppercase">
                    CURRENT FEATURES
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-terminal-panel border-2 border-discipline-bike text-discipline-bike px-3 py-1 text-xs font-medium flex items-center gap-2 font-mono tracking-wider uppercase"
                        style={{ borderRadius: 0 }}
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-discipline-bike hover:text-accent-yellow"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                DESCRIPTION
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow resize-vertical font-mono"
                style={{ borderRadius: 0 }}
                placeholder="Describe the course layout, key challenges, and notable characteristics..."
                rows={4}
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                COURSE WEBSITE
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                style={{ borderRadius: 0 }}
                placeholder="https://www.example.com/course-info"
              />
              <p className="text-text-secondary text-xs mt-1 font-mono">
                LINK TO OFFICIAL COURSE INFO OR RACE WEBSITE
              </p>
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
                disabled={!formData.name || !formData.location}
                className="bg-terminal-panel border-2 border-accent-yellow text-accent-yellow px-6 py-3 font-medium hover:bg-accent-yellow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                UPDATE COURSE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};