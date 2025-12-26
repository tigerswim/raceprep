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
      <div className="bg-terminal-panel border-2 border-terminal-border max-w-4xl w-full max-h-[90vh] overflow-auto" style={{ borderRadius: 0 }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono tracking-wider">
                {course.name}
              </h2>
              <p className="text-lg text-text-primary mb-2 font-mono">
                {course.location}
              </p>
              <div className="flex gap-3 mb-4">
                <span className="bg-terminal-panel border-2 border-discipline-bike text-discipline-bike px-3 py-1 text-xs font-medium font-mono tracking-wider uppercase" style={{ borderRadius: 0 }}>
                  {course.distance_type}
                </span>
                {course.difficulty_score && (
                  <span className="bg-terminal-panel border-2 border-accent-yellow text-accent-yellow px-3 py-1 text-xs font-medium font-mono tracking-wider uppercase" style={{ borderRadius: 0 }}>
                    DIFFICULTY: {course.difficulty_score}/10
                  </span>
                )}
                {course.wetsuit_legal !== null && (
                  <span
                    className={`bg-terminal-panel border-2 px-3 py-1 text-xs font-medium font-mono tracking-wider uppercase ${
                      course.wetsuit_legal
                        ? 'border-discipline-run text-discipline-run'
                        : 'border-red-400 text-red-400'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    WETSUIT {course.wetsuit_legal ? 'LEGAL' : 'ILLEGAL'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          {/* Description */}
          {course.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3 font-mono tracking-wider">
                COURSE DESCRIPTION
              </h3>
              <p className="text-text-primary leading-relaxed font-mono text-sm">
                {course.description}
              </p>
            </div>
          )}

          {/* Course Profile */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-terminal-panel border-2 border-terminal-border p-4" style={{ borderRadius: 0 }}>
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                COURSE PROFILE
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    SWIM TYPE:
                  </span>
                  <span className="text-accent-yellow font-medium font-mono uppercase">
                    {course.swim_type || 'OPEN WATER'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    BIKE ELEVATION GAIN:
                  </span>
                  <span className="text-accent-yellow font-medium font-mono">
                    {course.bike_elevation_gain ? `+${course.bike_elevation_gain}ft` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    RUN ELEVATION GAIN:
                  </span>
                  <span className="text-accent-yellow font-medium font-mono">
                    {course.run_elevation_gain ? `+${course.run_elevation_gain}ft` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-terminal-border pt-3">
                  <span className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                    TOTAL ELEVATION GAIN:
                  </span>
                  <span className="text-accent-yellow font-bold font-mono">
                    {course.overall_elevation ? `+${course.overall_elevation}ft` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-terminal-panel border-2 border-terminal-border p-4" style={{ borderRadius: 0 }}>
              <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
                COURSE FEATURES
              </h3>
              {formatFeatures(course.features).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formatFeatures(course.features).map((feature, index) => (
                    <span
                      key={index}
                      className="bg-terminal-panel border-2 border-discipline-swim text-discipline-swim px-3 py-1 text-xs font-medium font-mono tracking-wider uppercase"
                      style={{ borderRadius: 0 }}
                    >
                      {feature.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-xs font-mono">
                  NO SPECIFIC FEATURES LISTED
                </p>
              )}
            </div>
          </div>

          {/* Course Statistics */}
          <div className="bg-terminal-panel border-2 border-terminal-border p-4 mb-6" style={{ borderRadius: 0 }}>
            <h3 className="text-sm font-semibold text-text-primary mb-4 font-mono tracking-wider">
              COURSE STATISTICS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-1 font-mono">
                  {course.distance_type === 'sprint' ? '750m/20k/5k' :
                   course.distance_type === 'olympic' ? '1.5k/40k/10k' :
                   course.distance_type === '70.3' ? '1.9k/90k/21k' :
                   course.distance_type === 'ironman' ? '3.8k/180k/42k' :
                   'CUSTOM'}
                </div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  DISTANCE
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-1 font-mono">
                  {course.difficulty_score || 'N/A'}
                </div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  DIFFICULTY
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-1 font-mono">
                  {course.overall_elevation ? `+${course.overall_elevation}` : 'N/A'}
                </div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  ELEVATION (FT)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-1 font-mono uppercase">
                  {course.swim_type ? course.swim_type.charAt(0).toUpperCase() + course.swim_type.slice(1) : 'OPEN'}
                </div>
                <div className="text-text-secondary text-xs font-mono tracking-wider uppercase">
                  WATER TYPE
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider"
              style={{ borderRadius: 0 }}
            >
              CLOSE
            </button>
            <div className="flex gap-3">
              {course.website_url && (
                <button
                  onClick={() => window.open(course.website_url, '_blank')}
                  className="bg-terminal-panel border-2 border-text-secondary text-text-secondary px-6 py-3 font-medium hover:bg-text-secondary/10 transition-colors flex items-center gap-2 font-mono tracking-wider"
                  style={{ borderRadius: 0 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  VISIT WEBSITE
                </button>
              )}
              <button
                className="bg-terminal-panel border-2 border-discipline-swim text-discipline-swim px-6 py-3 font-medium hover:bg-discipline-swim/10 transition-colors font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                RACE PREDICTION
              </button>
              <button
                className="bg-terminal-panel border-2 border-discipline-run text-discipline-run px-6 py-3 font-medium hover:bg-discipline-run/10 transition-colors font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                ADD TO PLAN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
