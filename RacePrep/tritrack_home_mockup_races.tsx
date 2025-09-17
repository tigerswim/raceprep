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
  const [activeTab, setActiveTab] = useState('races');
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

  const RacesView = () => (
    <div className="relative z-10 p-6">
      {/* Header */}
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

      {/* Season Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <Trophy className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white font-mono">3</p>
          <p className="text-xs text-white/60">Personal Records</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white font-mono">-4:32</p>
          <p className="text-xs text-white/60">Avg Improvement</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white font-mono">3:58</p>
          <p className="text-xs text-white/60">Avg Transitions</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
          <button className="px-4 py-2 rounded-lg bg-blue-500/30 text-white text-sm font-medium">All</button>
          <button className="px-4 py-2 rounded-lg text-white/60 text-sm font-medium">Sprint</button>
          <button className="px-4 py-2 rounded-lg text-white/60 text-sm font-medium">Olympic</button>
          <button className="px-4 py-2 rounded-lg text-white/60 text-sm font-medium">70.3</button>
        </div>
        <div className="flex-1"></div>
        <button className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2">
          <BarChart2 className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Race List */}
      <div className="space-y-4">
        {[
          {
            name: 'Tugaloo Sprint Triathlon',
            date: 'Sep 6, 2025',
            location: 'Lake Hartwell, GA',
            distance: 'Sprint',
            time: '1:18:42',
            status: 'PR',
            splits: { swim: '8:45', t1: '2:18', bike: '42:33', t2: '1:45', run: '23:21' },
            placement: '23/156',
            weather: '74°F, Sunny'
          },
          {
            name: 'Peach State Olympic',
            date: 'Aug 15, 2025',
            location: 'Lake Lanier, GA',
            distance: 'Olympic',
            time: '2:47:15',
            status: 'Good',
            splits: { swim: '28:32', t1: '3:45', bike: '1:22:18', t2: '2:10', run: '50:30' },
            placement: '45/203',
            weather: '82°F, Hot'
          },
          {
            name: 'Atlanta Sprint Championship',
            date: 'Jul 22, 2025',
            location: 'Piedmont Park, GA',
            distance: 'Sprint',
            time: '1:21:05',
            status: 'Average',
            splits: { swim: '9:12', t1: '2:45', bike: '44:18', t2: '1:52', run: '22:58' },
            placement: '67/189',
            weather: '78°F, Cloudy'
          },
          {
            name: 'Cherokee County Tri',
            date: 'Jun 18, 2025',
            location: 'Lake Allatoona, GA',
            distance: 'Sprint',
            time: '1:22:30',
            status: 'PR',
            splits: { swim: '8:58', t1: '2:35', bike: '45:12', t2: '2:05', run: '23:40' },
            placement: '34/142',
            weather: '72°F, Perfect'
          },
          {
            name: 'Callaway Gardens Olympic',
            date: 'May 14, 2025',
            location: 'Pine Mountain, GA',
            distance: 'Olympic',
            time: '2:52:18',
            status: 'Tough',
            splits: { swim: '30:15', t1: '4:12', bike: '1:28:45', t2: '2:35', run: '46:31' },
            placement: '89/167',
            weather: '85°F, Windy'
          }
        ].map((race, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl">
            {/* Race Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{race.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    race.status === 'PR' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                    race.status === 'Good' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                    race.status === 'Tough' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                  }`}>
                    {race.status === 'PR' ? '🏆 PR' : race.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>{race.date}</span>
                  <span>•</span>
                  <span>{race.location}</span>
                  <span>•</span>
                  <span>{race.distance}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white font-mono">{race.time}</p>
                <p className="text-sm text-white/60">{race.placement}</p>
              </div>
            </div>

            {/* Race Splits */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {[
                { phase: 'Swim', time: race.splits.swim, icon: Waves, color: 'blue' },
                { phase: 'T1', time: race.splits.t1, icon: Clock, color: 'orange' },
                { phase: 'Bike', time: race.splits.bike, icon: Mountain, color: 'green' },
                { phase: 'T2', time: race.splits.t2, icon: Clock, color: 'cyan' },
                { phase: 'Run', time: race.splits.run, icon: Activity, color: 'purple' }
              ].map((split, splitIndex) => (
                <div key={splitIndex} className="text-center">
                  <div className={`w-8 h-8 ${getColorClasses(split.color, 'bg')} backdrop-blur-lg rounded-lg border ${getColorClasses(split.color, 'border')} flex items-center justify-center mx-auto mb-2`}>
                    <split.icon className={`w-4 h-4 ${getColorClasses(split.color, 'text')}`} />
                  </div>
                  <p className="text-xs text-white/60 mb-1">{split.phase}</p>
                  <p className="text-sm font-bold text-white font-mono">{split.time}</p>
                </div>
              ))}
            </div>

            {/* Race Details */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <span>{race.weather}</span>
              </div>
              <button className="bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all duration-300">
                View Analysis
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 text-center">
        <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
          Load More Races
        </button>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="relative z-10 p-6">
      {/* Header */}
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

      {/* Dashboard content would go here */}
      <div className="text-center text-white/60 mt-20">
        <p>Dashboard view - click Races tab to see race history</p>
      </div>
    </div>
  );

  const MobileVersion = () => (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      {activeTab === 'races' ? <RacesView /> : <DashboardView />}

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