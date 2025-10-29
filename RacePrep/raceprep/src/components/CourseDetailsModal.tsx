import React from 'react';

interface CourseDetailsModalProps {
  course: any;
  onClose: () => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, onClose }) => {
  if (!course) return null;

  const formatFeatures = (features: string[] | null) => {
    if (!features) return [];
    return Array.isArray(features) ? features : [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{course.name}</h2>
              <p className="text-xl text-white/70 mb-2">{course.location}</p>
              <div className="flex gap-3 mb-4">
                <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {course.distance_type}
                </span>
                {course.difficulty_score && (
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-medium">
                    Difficulty: {course.difficulty_score}/10
                  </span>
                )}
                {course.wetsuit_legal !== null && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.wetsuit_legal 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    Wetsuit {course.wetsuit_legal ? 'Legal' : 'Illegal'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Description */}
          {course.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Course Description</h3>
              <p className="text-white/80 leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Course Profile */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Course Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Swim Type:</span>
                  <span className="text-white font-medium capitalize">{course.swim_type || 'Open Water'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Bike Elevation Gain:</span>
                  <span className="text-white font-medium">
                    {course.bike_elevation_gain ? `+${course.bike_elevation_gain}ft` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Run Elevation Gain:</span>
                  <span className="text-white font-medium">
                    {course.run_elevation_gain ? `+${course.run_elevation_gain}ft` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-white/60">Total Elevation Gain:</span>
                  <span className="text-white font-bold">
                    {course.overall_elevation ? `+${course.overall_elevation}ft` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Course Features</h3>
              {formatFeatures(course.features).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formatFeatures(course.features).map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {feature.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">No specific features listed</p>
              )}
            </div>
          </div>

          {/* Course Statistics */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Course Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {course.distance_type === 'sprint' ? '750m/20k/5k' :
                   course.distance_type === 'olympic' ? '1.5k/40k/10k' :
                   course.distance_type === '70.3' ? '1.9k/90k/21k' :
                   course.distance_type === 'ironman' ? '3.8k/180k/42k' : 
                   'Custom'}
                </div>
                <div className="text-white/60 text-sm">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {course.difficulty_score || 'N/A'}
                </div>
                <div className="text-white/60 text-sm">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {course.overall_elevation ? `+${course.overall_elevation}` : 'N/A'}
                </div>
                <div className="text-white/60 text-sm">Elevation (ft)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {course.swim_type ? course.swim_type.charAt(0).toUpperCase() + course.swim_type.slice(1) : 'Open'}
                </div>
                <div className="text-white/60 text-sm">Water Type</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
            <div className="flex gap-3">
              {course.website_url && (
                <button 
                  onClick={() => window.open(course.website_url, '_blank')}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </button>
              )}
              <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-xl font-medium transition-colors">
                Race Prediction
              </button>
              <button className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-6 py-3 rounded-xl font-medium transition-colors">
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};