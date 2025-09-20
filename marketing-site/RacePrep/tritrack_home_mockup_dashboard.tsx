import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Thermometer,
  Trophy,
  Plus,
  ChevronRight,
  Activity,
  Target,
  Zap,
  Waves,
  Mountain,
  Wind,
  Timer,
  Star,
  ArrowUp,
  Bell,
  Settings,
  BarChart3,
  BarChart2,
  Award
} from 'lucide-react';

const TriTrackHomepage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(true);

  const getColorClasses = (color, type) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-400/30',
        text: 'text-blue-400',
        gradient: 'bg-gradient-to-r from-blue-400 to-blue-500'
      },
      orange: {
        bg: 'bg-orange-500/20',
        border: 'border-orange-400/30',
        text: 'text-orange-400',
        gradient: 'bg-gradient-to-r from-orange-400 to-orange-500'
      },
      green: {
        bg: 'bg-green-500/20',
        border: 'border-green-400/30',
        text: 'text-green-400',
        gradient: 'bg-gradient-to-r from-green-400 to-green-500'
      },
      cyan: {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-400/30',
        text: 'text-cyan-400',
        gradient: 'bg-gradient-to-r from-cyan-400 to-cyan-500'
      },
      purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-400/30',
        text: 'text-purple-400',
        gradient: 'bg-gradient-to-r from-purple-400 to-purple-500'
      }
    };
    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  const MobileVersion = () => (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Dramatic background effects like Madar */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-orange-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header with floating elements */}
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
          <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Season Progress */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Season</p>
                <p className="text-sm text-blue-300">Progress</p>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-white font-mono">75%</span>
              <span className="text-lg text-white/70 mb-1">complete</span>
            </div>
            <div className="mt-3 bg-blue-500/20 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-1 rounded-full transition-all duration-1000"
                style={{ width: '75%' }}
              ></div>
            </div>
            <p className="text-xs text-white/50 mt-2">9 of 12 races</p>
          </div>

          {/* Personal Best */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Sprint PB</p>
                <p className="text-sm text-orange-300">Best Time</p>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-white font-mono">1:18:42</span>
            </div>
            <div className="mt-3 bg-orange-500/20 rounded-full h-1">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-1 rounded-full w-full"></div>
            </div>
            <p className="text-xs text-white/50 mt-2">Recent PR!</p>
          </div>

          {/* Improvement Trend */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Improvement</p>
                <p className="text-sm text-green-300">This Season</p>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-white font-mono">-4:32</span>
            </div>
            <p className="text-xs text-white/50 mt-2">Average sprint time</p>
          </div>

          {/* Transition Score */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Transitions</p>
                <p className="text-sm text-cyan-300">Efficiency</p>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-white font-mono">78%</span>
            </div>
            <div className="mt-3 bg-cyan-500/20 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-1 rounded-full transition-all duration-1000"
                style={{ width: '78%' }}
              ></div>
            </div>
            <p className="text-xs text-orange-300 mt-2">Room for improvement</p>
          </div>
        </div>

        {/* Latest Race Analysis */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">Latest Race Analysis</h2>
              <div className="bg-green-500/20 backdrop-blur-lg rounded-full px-4 py-2 border border-green-400/30">
                <span className="text-sm font-medium text-green-300">Personal Record</span>
              </div>
            </div>
            <p className="text-white/60">Tugaloo Sprint Triathlon • Lake Hartwell, GA • Sep 6</p>
          </div>

          {/* Performance Breakdown */}
          <div className="space-y-4">
            {[
              { phase: 'Swim', time: '8:45', progress: 88, icon: Waves, color: 'blue', analysis: 'Strong performance' },
              { phase: 'T1', time: '2:18', progress: 65, icon: Clock, color: 'orange', analysis: '15s slower than avg' },
              { phase: 'Bike', time: '42:33', progress: 95, icon: Mountain, color: 'green', analysis: 'Excellent pacing' },
              { phase: 'T2', time: '1:45', progress: 80, icon: Clock, color: 'cyan', analysis: 'Good efficiency' },
              { phase: 'Run', time: '23:21', progress: 87, icon: Activity, color: 'purple', analysis: 'Consistent split' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${getColorClasses(item.color, 'bg')} backdrop-blur-lg rounded-xl border ${getColorClasses(item.color, 'border')} flex items-center justify-center`}>
                  <item.icon className={`w-6 h-6 ${getColorClasses(item.color, 'text')}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{item.phase}</span>
                    <span className="text-white/90 font-mono font-bold">{item.time}</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-1">
                    <div 
                      className={`${getColorClasses(item.color, 'gradient')} h-2 rounded-full transition-all duration-2000`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-white/50">{item.analysis}</span>
                    <span className="text-xs text-white/50">{item.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Overall Time: 1:18:42</p>
                <p className="text-green-300 text-sm">Personal Record by 2:15</p>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
                Deep Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Performance Intelligence */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-orange-400/30 p-6 shadow-2xl mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-orange-500/30 backdrop-blur-lg rounded-2xl border border-orange-400/40 flex items-center justify-center flex-shrink-0">
              <Target className="w-7 h-7 text-orange-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Performance Intelligence</h3>
              <p className="text-orange-100 mb-4 leading-relaxed">
                T1 transition analysis reveals 15-second optimization opportunity. Focus on wetsuit removal technique to reach age group average of 2:03.
              </p>
              <button className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-xl text-white font-medium border border-white/30 hover:bg-white/30 transition-all duration-300">
                View Training Tips
              </button>
            </div>
          </div>
        </div>

        {/* Next Race Preview */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Next Challenge</h2>
              <div className="flex items-center space-x-2 text-blue-300">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">12 days</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">Peachtree Olympic</h3>
            <p className="text-white/60">Atlanta, GA • October 15, 2025</p>
          </div>

          {/* Course Information */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
              <Thermometer className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-white/60 mb-1">Expected</p>
              <p className="text-lg font-bold text-white">72°F</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
              <Mountain className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-white/60 mb-1">Elevation</p>
              <p className="text-lg font-bold text-white">+850ft</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
              <Target className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-xs text-white/60 mb-1">Target</p>
              <p className="text-lg font-bold text-white">2:45:00</p>
            </div>
          </div>

          {/* Race Prediction */}
          <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl border border-blue-400/30 p-4 mb-4">
            <h4 className="text-white font-semibold mb-2">Race Prediction</h4>
            <p className="text-blue-200 text-sm">Based on course difficulty and recent performance, predicted finish time: 2:42:30 - 2:47:15</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 text-blue-300 py-3 rounded-xl font-medium hover:bg-blue-500/30 transition-all duration-300">
              Race Strategy
            </button>
            <button className="bg-orange-500/20 backdrop-blur-lg border border-orange-400/30 text-orange-300 py-3 rounded-xl font-medium hover:bg-orange-500/30 transition-all duration-300">
              Nutrition Plan
            </button>
          </div>
        </div>
      </div>

      {/* Floating Navigation */}
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