import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Thermometer,
  Trophy,
  Plus,
  Activity,
  Target,
  Zap,
  Waves,
  Mountain,
  Timer,
  Star,
  Bell,
  BarChart3,
  BarChart2
} from 'lucide-react';

const TriTrackHomepage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [isMobile, setIsMobile] = useState(true);

  const getColorClasses = (color, type) => {
    const colorMap = {
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-400', gradient: 'bg-gradient-to-r from-blue-400 to-blue-500' },
      orange: { bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-400', gradient: 'bg-gradient-to-r from-orange-400 to-orange-500' },
      green: { bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-400', gradient: 'bg-gradient-to-r from-green-400 to-green-500' },
      cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-400/30', text: 'text-cyan-400', gradient: 'bg-gradient-to-r from-cyan-400 to-cyan-500' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-400', gradient: 'bg-gradient-to-r from-purple-400 to-purple-500' }
    };
    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  const MobileVersion = () => (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      {activeTab === 'planning' && (
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Race Planning</h1>
                <p className="text-sm text-purple-300">Strategy & preparation tools</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg">
              <Plus className="w-4 h-4 inline mr-2" />
              New Plan
            </button>
          </div>

          {/* Current Race Focus */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 p-5 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Peachtree Olympic</h2>
              <div className="flex items-center space-x-2 text-blue-300">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">12 days to go</span>
              </div>
            </div>
            <p className="text-white/70 mb-4">Atlanta, GA • October 15, 2025 • Olympic Distance</p>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="4"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray="175.93" strokeDashoffset="35.19"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">80%</span>
                  </div>
                </div>
                <p className="text-xs text-white/60">Training</p>
              </div>
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="4"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray="175.93" strokeDashoffset="70.37"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">60%</span>
                  </div>
                </div>
                <p className="text-xs text-white/60">Nutrition</p>
              </div>
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="4"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeDasharray="175.93" strokeDashoffset="52.78"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">70%</span>
                  </div>
                </div>
                <p className="text-xs text-white/60">Equipment</p>
              </div>
            </div>

            <button className="w-full bg-white/20 backdrop-blur-lg text-white py-3 rounded-xl font-medium border border-white/30">
              View Complete Race Plan
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Race Strategy</h3>
                  <p className="text-xs text-white/60">Pacing & tactics</p>
                </div>
              </div>
              <p className="text-sm text-white/70 mb-3">Optimize your race day execution based on course analysis</p>
              <button className="w-full bg-orange-500/20 border border-orange-400/30 text-orange-300 py-2 rounded-lg text-sm font-medium">
                Build Strategy
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Nutrition Plan</h3>
                  <p className="text-xs text-white/60">Fueling strategy</p>
                </div>
              </div>
              <p className="text-sm text-white/70 mb-3">Plan your race day nutrition and hydration strategy</p>
              <button className="w-full bg-green-500/20 border border-green-400/30 text-green-300 py-2 rounded-lg text-sm font-medium">
                Plan Nutrition
              </button>
            </div>
          </div>

          {/* Nutrition Planning Detail */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Race Day Nutrition</h3>
            
            {/* Nutrition Timeline */}
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Pre-Race (2-3 hours before)</h4>
                  <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded">Planned</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-white/60">Carbs</p>
                    <p className="text-white font-mono">80g</p>
                  </div>
                  <div>
                    <p className="text-white/60">Caffeine</p>
                    <p className="text-white font-mono">100mg</p>
                  </div>
                  <div>
                    <p className="text-white/60">Fluid</p>
                    <p className="text-white font-mono">500ml</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 mt-2">Oatmeal with banana + coffee</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">During Race</h4>
                  <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded">In Progress</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Bike Segment</span>
                    <span className="text-sm text-white">2 gels + 1 bottle sports drink</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Run Segment</span>
                    <span className="text-sm text-white">1 gel + aid station fluids</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mt-3 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-white/60">Total Carbs</p>
                    <p className="text-white font-mono">65g</p>
                  </div>
                  <div>
                    <p className="text-white/60">Caffeine</p>
                    <p className="text-white font-mono">50mg</p>
                  </div>
                  <div>
                    <p className="text-white/60">Sodium</p>
                    <p className="text-white font-mono">700mg</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-green-500/20 backdrop-blur-lg border border-green-400/30 text-green-300 py-2 rounded-lg font-medium">
              Edit Nutrition Plan
            </button>
          </div>

          {/* Transition Packing List */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Transition Packing List</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* T1 List */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Waves className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-medium">T1 (Swim to Bike)</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { item: 'Bike helmet', checked: true },
                    { item: 'Cycling shoes', checked: true },
                    { item: 'Sunglasses', checked: false },
                    { item: 'Race number belt', checked: true },
                    { item: 'Towel', checked: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        item.checked ? 'bg-green-500 border-green-500' : 'border-white/30'
                      }`}>
                        {item.checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`text-sm ${item.checked ? 'text-white' : 'text-white/60'}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* T2 List */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <h4 className="text-white font-medium">T2 (Bike to Run)</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { item: 'Running shoes', checked: true },
                    { item: 'Hat/visor', checked: true },
                    { item: 'Energy gels', checked: false },
                    { item: 'Salt tablets', checked: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        item.checked ? 'bg-green-500 border-green-500' : 'border-white/30'
                      }`}>
                        {item.checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`text-sm ${item.checked ? 'text-white' : 'text-white/60'}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 text-blue-300 py-2 rounded-lg font-medium">
              Customize Packing List
            </button>
          </div>

          {/* Performance Predictions */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-cyan-400/30 p-5 shadow-xl mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-cyan-500/30 backdrop-blur-lg rounded-xl border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Race Prediction</h3>
                <p className="text-cyan-100 mb-3">
                  Based on your training and course analysis, predicted finish time: <span className="font-bold">2:42:30 - 2:47:15</span>
                </p>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-white/60">Swim</p>
                    <p className="text-white font-mono">28:45</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">T1</p>
                    <p className="text-white font-mono">2:00</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">Bike</p>
                    <p className="text-white font-mono">1:24:30</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">T2</p>
                    <p className="text-white font-mono">1:45</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60">Run</p>
                    <p className="text-white font-mono">45:30</p>
                  </div>
                </div>
                <button className="mt-3 bg-white/20 backdrop-blur-lg px-4 py-2 rounded-lg text-white font-medium border border-white/30">
                  View What-If Scenarios
                </button>
              </div>
            </div>
          </div>

          {/* Recent Plans */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Recent Race Plans</h2>
            <div className="space-y-3">
              {[
                { race: 'Tugaloo Sprint', date: 'Sep 6, 2025', status: 'Completed', result: 'PR!' },
                { race: 'Lake Lanier Olympic', date: 'Aug 15, 2025', status: 'Completed', result: 'Good' },
                { race: 'Atlanta Sprint', date: 'Jul 22, 2025', status: 'Completed', result: 'Average' }
              ].map((plan, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{plan.race}</h4>
                    <p className="text-sm text-white/60">{plan.date} • {plan.status}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      plan.result === 'PR!' ? 'bg-green-500/20 text-green-300' :
                      plan.result === 'Good' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {plan.result}
                    </span>
                    <button className="text-blue-300 hover:text-blue-200 transition-colors">
                      <Target className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-2xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Course Database</h1>
                <p className="text-sm text-green-300">Find and analyze triathlon courses</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Course
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Search courses by name or location..."
                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
                <button className="bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 text-blue-300 px-4 py-2 rounded-lg font-medium">
                  Search
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button className="px-3 py-1 rounded bg-green-500/30 text-white text-sm">All</button>
                  <button className="px-3 py-1 text-white/60 text-sm">Sprint</button>
                  <button className="px-3 py-1 text-white/60 text-sm">Olympic</button>
                  <button className="px-3 py-1 text-white/60 text-sm">70.3</button>
                </div>
                <div className="text-sm text-white/60">•</div>
                <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm">
                  <option>All Locations</option>
                  <option>Georgia</option>
                  <option>Florida</option>
                </select>
              </div>
            </div>
          </div>

          {/* Featured Courses */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Featured Courses</h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Tugaloo Sprint Triathlon',
                  location: 'Lake Hartwell, GA',
                  distance: 'Sprint',
                  difficulty: 'Moderate',
                  elevation: '+340ft',
                  swimType: 'Lake',
                  temperature: '74°F avg',
                  features: ['Wetsuit Legal', 'Hilly Bike', 'Scenic'],
                  rating: 4.6,
                  reviews: 89,
                  nextRace: 'Sep 2026'
                },
                {
                  name: 'Jekyll Island Triathlon',
                  location: 'Jekyll Island, GA',
                  distance: 'Olympic',
                  difficulty: 'Easy',
                  elevation: '+125ft',
                  swimType: 'Ocean',
                  temperature: '78°F avg',
                  features: ['Beach Start', 'Flat Course', 'Scenic'],
                  rating: 4.8,
                  reviews: 203,
                  nextRace: 'Apr 2026'
                }
              ].map((course, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{course.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          course.difficulty === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                          'bg-red-500/20 text-red-300 border border-red-400/30'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-white/60 mb-2">
                        <span>{course.location}</span>
                        <span>•</span>
                        <span>{course.distance}</span>
                        <span>•</span>
                        <span>Next: {course.nextRace}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-bold">{course.rating}</span>
                      </div>
                      <p className="text-xs text-white/60">{course.reviews} reviews</p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-3 text-center">
                      <Mountain className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                      <p className="text-xs text-white/60">Elevation</p>
                      <p className="text-sm font-bold text-white">{course.elevation}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-3 text-center">
                      <Waves className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-white/60">Swim</p>
                      <p className="text-sm font-bold text-white">{course.swimType}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-3 text-center">
                      <Thermometer className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <p className="text-xs text-white/60">Weather</p>
                      <p className="text-sm font-bold text-white">{course.temperature}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-3 text-center">
                      <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs text-white/60">Distance</p>
                      <p className="text-sm font-bold text-white">{course.distance}</p>
                    </div>
                  </div>

                  {/* Course Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {course.features.map((feature, featureIndex) => (
                        <span key={featureIndex} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs border border-blue-400/30">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-3 border-t border-white/10">
                    <button className="flex-1 bg-green-500/20 backdrop-blur-lg border border-green-400/30 text-green-300 py-2 rounded-lg text-sm font-medium">
                      View Details
                    </button>
                    <button className="flex-1 bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 text-blue-300 py-2 rounded-lg text-sm font-medium">
                      Race Prediction
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Intelligence */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-purple-400/30 p-5 shadow-xl mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500/30 backdrop-blur-lg rounded-xl border border-purple-400/40 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Course Intelligence</h3>
                <p className="text-purple-100 mb-3 leading-relaxed">
                  Based on your race history, Jekyll Island would be optimal for a PR attempt. 
                  Your flat course performance is 8% faster than hilly courses.
                </p>
                <button className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-lg text-white font-medium border border-white/30">
                  Get Recommendations
                </button>
              </div>
            </div>
          </div>

          {/* Nearby Courses */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Near You (Atlanta, GA)</h2>
            <div className="space-y-3">
              {[
                { name: 'Lake Lanier Olympic', distance: '45 min drive', date: 'Aug 2026', difficulty: 'Moderate' },
                { name: 'Callaway Gardens Tri', distance: '1.2 hr drive', date: 'May 2026', difficulty: 'Challenging' },
                { name: 'Pine Mountain Sprint', distance: '1.5 hr drive', date: 'Jun 2026', difficulty: 'Easy' }
              ].map((nearby, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{nearby.name}</h4>
                    <p className="text-sm text-white/60">{nearby.distance} • {nearby.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    nearby.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                    nearby.difficulty === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {nearby.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'races' && (
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Race History</h1>
                <p className="text-sm text-blue-300">12 races completed this season</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Race
            </button>
          </div>
          <div className="text-center text-white/60 mt-20">
            <p>Race history view - click Courses tab to see course database</p>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TriTrack Pro</h1>
                <p className="text-sm text-blue-300">Performance Analytics Platform</p>
              </div>
            </div>
          </div>
          <div className="text-center text-white/60 mt-20">
            <p>Dashboard view - click Courses tab to see course database</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-2">
          <div className="flex items-center justify-around">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'races', icon: Trophy, label: 'Races' },
              { id: 'courses', icon: MapPin, label: 'Courses' },
              { id: 'planning', icon: Target, label: 'Planning' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-br from-blue-500/30 to-orange-500/30 text-white shadow-lg backdrop-blur-lg border border-white/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopVersion = () => (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Desktop Version</h1>
        <p className="text-white/60">Desktop layout coming soon...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Toggle Button */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setIsMobile(true)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isMobile 
                  ? 'bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Mobile
            </button>
            <button
              onClick={() => setIsMobile(false)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                !isMobile 
                  ? 'bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Desktop
            </button>
          </div>
        </div>
      </div>

      {isMobile ? <MobileVersion /> : <DesktopVersion />}
    </div>
  );
};

export default TriTrackHomepage;