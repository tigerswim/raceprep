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
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Edit Course</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Lake Lanier Olympic Course"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Lake Lanier, GA"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Distance Type *</label>
                  <select
                    value={formData.distance_type}
                    onChange={(e) => setFormData({ ...formData, distance_type: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="sprint">Sprint</option>
                    <option value="olympic">Olympic</option>
                    <option value="70.3">70.3</option>
                    <option value="ironman">Ironman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Swim Type</label>
                  <select
                    value={formData.swim_type || ''}
                    onChange={(e) => setFormData({ ...formData, swim_type: e.target.value as any || null })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="lake">Lake</option>
                    <option value="ocean">Ocean</option>
                    <option value="river">River</option>
                    <option value="pool">Pool</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Elevation & Difficulty */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Course Profile</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Bike Elevation Gain (ft)</label>
                  <input
                    type="number"
                    value={formData.bike_elevation_gain}
                    onChange={(e) => setFormData({ ...formData, bike_elevation_gain: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1200"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Run Elevation Gain (ft)</label>
                  <input
                    type="number"
                    value={formData.run_elevation_gain}
                    onChange={(e) => setFormData({ ...formData, run_elevation_gain: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="300"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Course Elevation (ft)</label>
                  <input
                    type="number"
                    value={formData.overall_elevation}
                    onChange={(e) => setFormData({ ...formData, overall_elevation: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Difficulty Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.difficulty_score}
                    onChange={(e) => setFormData({ ...formData, difficulty_score: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="7"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Wetsuit Legal</label>
                  <select
                    value={formData.wetsuit_legal === null ? '' : formData.wetsuit_legal.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ 
                        ...formData, 
                        wetsuit_legal: value === '' ? null : value === 'true' 
                      });
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unknown</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Course Features</h3>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Add Feature</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Rolling hills, Technical bike course, Beginner friendly"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-white/50 text-sm mt-1">Separate multiple features with commas</p>
              </div>

              {formData.features.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-white/80 text-sm font-medium">Current Features</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-orange-400 hover:text-orange-300"
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
              <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                placeholder="Describe the course layout, key challenges, and notable characteristics..."
                rows={4}
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Course Website</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.example.com/course-info"
              />
              <p className="text-white/50 text-sm mt-1">Link to the official course information or race website</p>
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
                disabled={!formData.name || !formData.location}
                className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};