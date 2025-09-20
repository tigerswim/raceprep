import React, { useState, useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../src/store';
import { dbHelpers } from '../../src/services/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { AuthModal } from '../../src/components/AuthModal';
import {
  TbTarget,
  TbChartBar,
  TbSettings,
  TbTrophy,
  TbFlag,
  TbUser
} from 'react-icons/tb';

// Icon component mapping
const iconComponents = {
  TbTarget,
  TbChartBar,
  TbSettings,
  TbTrophy,
  TbFlag,
  TbUser
};

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  return IconComponent ? <IconComponent className={className} /> : <span>{iconName}</span>;
};

function ProfileScreenContent() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [raceStats, setRaceStats] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({
    goal_type: 'time_target',
    distance_type: 'sprint',
    target_value: '',
    target_date: ''
  });

  const profileSections = [
    { id: 'profile', label: 'Profile', icon: 'TbUser' },
    { id: 'goals', label: 'Goals', icon: 'TbTarget' },
    { id: 'stats', label: 'Statistics', icon: 'TbChartBar' },
    { id: 'settings', label: 'Settings', icon: 'TbSettings' }
  ];

  const calculateRaceStats = useCallback((raceResults: any[]) => {
    const totalRaces = raceResults.length;
    const completedRaces = raceResults.filter(r => r.overall_time);
    const sprintResults = completedRaces.filter(r => r.races?.courses?.distance_type === 'sprint');
    const olympicResults = completedRaces.filter(r => r.races?.courses?.distance_type === 'olympic');
    
    // Calculate best times
    const sprintBest = sprintResults.length > 0 
      ? Math.min(...sprintResults.map(r => parseInterval(r.overall_time)))
      : null;
    
    // Calculate podium finishes (top 3 in age group)
    const podiumFinishes = completedRaces.filter(r => r.age_group_placement && r.age_group_placement <= 3).length;
    
    // Calculate average finish percentage
    const validPlacements = completedRaces.filter(r => r.overall_placement && r.overall_placement > 0);
    const avgFinishPercentage = validPlacements.length > 0
      ? Math.round(validPlacements.reduce((acc, r) => acc + (r.overall_placement / 100), 0) / validPlacements.length)
      : 0;
    
    setRaceStats({
      totalRaces,
      podiumFinishes,
      sprintBest: sprintBest ? formatTime(sprintBest) : null,
      avgFinishPercentage
    });
  }, []);

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get profile, goals, and race results
      const [profileResult, goalsResult, raceResultsResult] = await Promise.all([
        dbHelpers.users.getCurrent(),
        dbHelpers.userGoals.getAll(),
        dbHelpers.raceResults.getAll()
      ]);

      // TODO: Fix user_settings RLS policies and re-enable this call
      // Temporarily disabled to prevent 406 errors
      const settingsResult = { data: null, error: 'Temporarily disabled' };

      if (profileResult.data) {
        setUserProfile(profileResult.data);
        setProfileForm(profileResult.data);
      }

      if (goalsResult.data) {
        setUserGoals(goalsResult.data);
      }

      if (settingsResult.data) {
        setUserSettings(settingsResult.data);
        setSettingsForm(settingsResult.data);
      } else {
        // Set default settings if none exist
        const defaultSettings = {
          distance_units: 'imperial',
          temperature_units: 'fahrenheit',
          notifications_race_reminders: true,
          notifications_training_updates: true,
          notifications_performance_insights: true,
          notifications_community_updates: false,
          years_racing: 0
        };
        setSettingsForm(defaultSettings);
      }

      if (raceResultsResult.data) {
        calculateRaceStats(raceResultsResult.data);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateRaceStats]);

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (!user) {
      // User not authenticated - show auth modal
      setShowAuthModal(true);
      setIsLoading(false);
    } else {
      // User authenticated - load their data
      setShowAuthModal(false);
      loadProfileData();
    }
  }, [user, loading, loadProfileData]);

  const parseInterval = (intervalString: string): number => {
    // Parse PostgreSQL interval format to seconds
    const parts = intervalString.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      const result = userProfile 
        ? await dbHelpers.users.update(profileForm)
        : await dbHelpers.users.create(profileForm);
      
      if (result.data) {
        setUserProfile(result.data);
        alert('Profile updated successfully!');
      } else {
        alert('Error saving profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setIsSaving(true);
    try {
      const result = await dbHelpers.userSettings.upsert(settingsForm);
      
      if (result.data) {
        setUserSettings(result.data);
        alert('Settings updated successfully!');
      } else {
        alert('Error saving settings: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const openGoalModal = (goal: any = null) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        goal_type: goal.goal_type,
        distance_type: goal.distance_type || 'sprint',
        target_value: goal.target_value,
        target_date: goal.target_date || ''
      });
    } else {
      setEditingGoal(null);
      setGoalForm({
        goal_type: 'time_target',
        distance_type: 'sprint',
        target_value: '',
        target_date: ''
      });
    }
    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    setGoalForm({
      goal_type: 'time_target',
      distance_type: 'sprint',
      target_value: '',
      target_date: ''
    });
  };

  const saveGoal = async () => {
    try {
      if (editingGoal) {
        const result = await dbHelpers.userGoals.update(editingGoal.id, goalForm);
        if (result.data) {
          setUserGoals(userGoals.map(g => g.id === editingGoal.id ? result.data : g));
          alert('Goal updated successfully!');
        }
      } else {
        const result = await dbHelpers.userGoals.create(goalForm);
        if (result.data) {
          setUserGoals([...userGoals, result.data]);
          alert('Goal created successfully!');
        }
      }
      closeGoalModal();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving goal');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await dbHelpers.userGoals.delete(goalId);
        setUserGoals(userGoals.filter(g => g.id !== goalId));
        alert('Goal deleted successfully!');
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting goal');
      }
    }
  };

  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    setUserProfile(null);
    setUserGoals([]);
    setUserSettings(null);
    setRaceStats(null);
    setProfileForm({});
    setSettingsForm({});
  };

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="bg-slate-900 relative overflow-auto flex items-center justify-center" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <>
        <div className="bg-slate-900 relative overflow-auto" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
            <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 shadow-xl text-center max-w-md">
              <TbTrophy className="w-16 h-16 mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to RacePrep</h2>
              <p className="text-white/70 mb-6">
                Sign in to access your triathlon profile, track goals, and manage race planning.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <Provider store={store}>
      <div className="bg-slate-900 relative overflow-auto" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
          <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 p-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
              <p className="text-lg text-white/70">
                {userProfile?.name 
                  ? `Welcome back, ${userProfile.name.split(' ')[0]}!`
                  : `Welcome, ${user.email}!`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                className="text-white/70 hover:text-white text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all"
                title="Sign Out"
              >
                Sign Out
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white text-xl font-bold">{getUserInitials()}</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-white text-lg">Loading profile...</div>
            </div>
          )}

          {/* Profile Sections */}
          <div className="flex flex-wrap gap-2 mb-8">
            {profileSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {renderIcon(section.icon, "w-5 h-5")}
                {section.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          {!isLoading && (
          <div className="grid gap-6">
            {activeSection === 'profile' && (
              <>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                        <input 
                          type="text" 
                          value={profileForm.name || ''}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          placeholder="Enter your full name"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                        <input 
                          type="email" 
                          value={profileForm.email || ''}
                          disabled
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 placeholder-white/30 cursor-not-allowed"
                        />
                        <p className="text-white/50 text-xs mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Age Group</label>
                        <select 
                          value={profileForm.age_group || ''}
                          onChange={(e) => setProfileForm({...profileForm, age_group: e.target.value})}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select age group</option>
                          <option value="M17 & Under">M17 & Under</option>
                          <option value="M18-24">M18-24</option>
                          <option value="M25-29">M25-29</option>
                          <option value="M30-34">M30-34</option>
                          <option value="M35-39">M35-39</option>
                          <option value="M40-44">M40-44</option>
                          <option value="M45-49">M45-49</option>
                          <option value="M50-54">M50-54</option>
                          <option value="M55-59">M55-59</option>
                          <option value="M60+">M60+</option>
                          <option value="F17 & Under">F17 & Under</option>
                          <option value="F18-24">F18-24</option>
                          <option value="F25-29">F25-29</option>
                          <option value="F30-34">F30-34</option>
                          <option value="F35-39">F35-39</option>
                          <option value="F40-44">F40-44</option>
                          <option value="F45-49">F45-49</option>
                          <option value="F50-54">F50-54</option>
                          <option value="F55-59">F55-59</option>
                          <option value="F60+">F60+</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Experience Level</label>
                        <select 
                          value={profileForm.experience_level || ''}
                          onChange={(e) => setProfileForm({...profileForm, experience_level: e.target.value})}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select experience level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
                        <input 
                          type="text" 
                          value={profileForm.location || ''}
                          onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                          placeholder="City, State"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">USAT ID (Optional)</label>
                        <input 
                          type="text" 
                          value={profileForm.usat_id || ''}
                          onChange={(e) => setProfileForm({...profileForm, usat_id: e.target.value})}
                          placeholder="Enter USAT ID"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={handleProfileSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => {
                        setProfileForm(userProfile || {});
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'goals' && (
              <>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">My Goals</h3>
                    <button 
                      onClick={() => openGoalModal()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    >
                      Add Goal
                    </button>
                  </div>
                  
                  {userGoals.length > 0 ? (
                    <div className="space-y-4">
                      {userGoals.map((goal) => (
                        <div key={goal.id} className="border border-white/10 rounded-xl p-4 bg-white/5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">
                                {goal.goal_type === 'time_target' ? 'Time Goal' : 
                                 goal.goal_type === 'race_count' ? 'Race Count Goal' : 'Transition Goal'}
                                {goal.distance_type && ` - ${goal.distance_type.charAt(0).toUpperCase() + goal.distance_type.slice(1)}`}
                              </h4>
                              <div className="text-white/70 text-sm">
                                Target: {goal.target_value}
                                {goal.target_date && ` by ${new Date(goal.target_date).toLocaleDateString()}`}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openGoalModal(goal)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {goal.current_value && (
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-white font-mono">{goal.target_value}</div>
                                <div className="text-white/70 text-xs">Target</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-blue-400 font-mono">{goal.current_value}</div>
                                <div className="text-white/70 text-xs">Current</div>
                              </div>
                            </div>
                          )}
                          
                          {goal.achieved && (
                            <div className="mt-3 text-center">
                              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                                ✅ Achieved!
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TbTarget className="w-8 h-8 mb-4 text-white/60" />
                      <div className="text-white/70 mb-2">No goals set yet</div>
                      <div className="text-white/50 text-sm">Create your first goal to start tracking progress!</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'stats' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">Performance Statistics</h3>
                {raceStats ? (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-bold text-blue-400 font-mono mb-2">{raceStats.totalRaces}</div>
                        <div className="text-white/70">Total Races</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-bold text-green-400 font-mono mb-2">{raceStats.podiumFinishes}</div>
                        <div className="text-white/70">Podium Finishes</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-bold text-orange-400 font-mono mb-2">{raceStats.sprintBest || '--:--:--'}</div>
                        <div className="text-white/70">Sprint PR</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-bold text-purple-400 font-mono mb-2">{raceStats.avgFinishPercentage}%</div>
                        <div className="text-white/70">Avg Finish %</div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-white font-semibold mb-4">Race History Summary</h4>
                      <div className="bg-white/5 rounded-xl p-6">
                        {raceStats.totalRaces > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-white/70">Total Races Completed</span>
                              <span className="text-white font-semibold">{raceStats.totalRaces}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Podium Finishes</span>
                              <span className="text-green-400 font-semibold">{raceStats.podiumFinishes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Podium Rate</span>
                              <span className="text-green-400 font-semibold">
                                {Math.round((raceStats.podiumFinishes / raceStats.totalRaces) * 100)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <TbFlag className="w-8 h-8 mb-4 text-white/60" />
                            <div className="text-white/70">No race results yet</div>
                            <div className="text-white/50 text-sm">Complete some races to see your stats!</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-white/60">Loading statistics...</div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-4">Units & Preferences</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-white">Distance Units</span>
                        <select 
                          value={settingsForm.distance_units || 'imperial'}
                          onChange={(e) => setSettingsForm({...settingsForm, distance_units: e.target.value})}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="imperial">Miles/Feet</option>
                          <option value="metric">Kilometers/Meters</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-white">Temperature Units</span>
                        <select 
                          value={settingsForm.temperature_units || 'fahrenheit'}
                          onChange={(e) => setSettingsForm({...settingsForm, temperature_units: e.target.value})}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="fahrenheit">Fahrenheit</option>
                          <option value="celsius">Celsius</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-white">Years Racing</span>
                        <input 
                          type="number" 
                          min="0"
                          max="50"
                          value={settingsForm.years_racing || 0}
                          onChange={(e) => setSettingsForm({...settingsForm, years_racing: parseInt(e.target.value) || 0})}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-4">Notifications</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'notifications_race_reminders', label: 'Race reminders' },
                        { key: 'notifications_training_updates', label: 'Training plan updates' },
                        { key: 'notifications_performance_insights', label: 'Performance insights' },
                        { key: 'notifications_community_updates', label: 'Community updates' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="text-white">{setting.label}</span>
                          <button 
                            onClick={() => setSettingsForm({...settingsForm, [setting.key]: !settingsForm[setting.key]})}
                            className={`w-12 h-6 rounded-full relative transition-colors ${
                              settingsForm[setting.key] ? 'bg-blue-500' : 'bg-white/20'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              settingsForm[setting.key] ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleSettingsSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button 
                      onClick={() => {
                        setSettingsForm(userSettings || {});
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl font-medium transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Goal Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-6">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Goal Type</label>
                    <select 
                      value={goalForm.goal_type}
                      onChange={(e) => setGoalForm({...goalForm, goal_type: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="time_target">Time Target</option>
                      <option value="race_count">Race Count</option>
                      <option value="transition_time">Transition Time</option>
                    </select>
                  </div>

                  {goalForm.goal_type === 'time_target' && (
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Distance Type</label>
                      <select 
                        value={goalForm.distance_type}
                        onChange={(e) => setGoalForm({...goalForm, distance_type: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="sprint">Sprint</option>
                        <option value="olympic">Olympic</option>
                        <option value="70.3">70.3</option>
                        <option value="ironman">Ironman</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Target Value</label>
                    <input 
                      type="text" 
                      value={goalForm.target_value}
                      onChange={(e) => setGoalForm({...goalForm, target_value: e.target.value})}
                      placeholder={
                        goalForm.goal_type === 'time_target' ? 'e.g., 1:30:00' :
                        goalForm.goal_type === 'race_count' ? 'e.g., 5' : 'e.g., 1:30'
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Target Date (Optional)</label>
                    <input 
                      type="date" 
                      value={goalForm.target_date}
                      onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={saveGoal}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                  <button 
                    onClick={closeGoalModal}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Provider>
  );
}

export default function ProfileScreen() {
  return (
    <Provider store={store}>
      <ProfileScreenContent />
    </Provider>
  );
}