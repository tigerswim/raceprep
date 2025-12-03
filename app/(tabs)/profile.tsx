import React, { useState, useEffect, useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "../../src/store";
import { dbHelpers } from "../../src/services/supabase";
import { userDataService } from "../../src/services/userDataService";
import { useAuth } from "../../src/contexts/AuthContext";
import { AuthModal } from "../../src/components/AuthModal";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { useTerminalModeToggle } from "../../src/hooks/useTerminalModeToggle";
import { getTerminalModeState } from "../../src/utils/featureFlags";
import {
  TbTarget,
  TbChartBar,
  TbSettings,
  TbTrophy,
  TbFlag,
  TbUser,
  TbDownload,
  TbTrash,
  TbShield,
} from "react-icons/tb";

// Icon component mapping
const iconComponents = {
  TbTarget,
  TbChartBar,
  TbSettings,
  TbTrophy,
  TbFlag,
  TbUser,
  TbDownload,
  TbTrash,
  TbShield,
};

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  return IconComponent ? (
    <IconComponent className={className} />
  ) : (
    <span>{iconName}</span>
  );
};

function ProfileScreenContent() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Terminal mode
  useTerminalModeToggle();
  const [useTerminal, setUseTerminal] = useState(() => {
    const override = getTerminalModeState();
    if (override !== false) return override;
    return true; // Terminal mode is enabled in featureFlags.ts
  });

  // Listen for terminal mode changes
  useEffect(() => {
    const handleTerminalModeChange = () => {
      setUseTerminal(getTerminalModeState());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("terminalModeChanged", handleTerminalModeChange);
      return () => {
        window.removeEventListener(
          "terminalModeChanged",
          handleTerminalModeChange,
        );
      };
    }
  }, []);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [raceStats, setRaceStats] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({
    goal_type: "time_target",
    distance_type: "sprint",
    target_value: "",
    target_date: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<any>(null);
  const [dataOperationInProgress, setDataOperationInProgress] = useState(false);
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);

  const profileSections = [
    { id: "profile", label: "Profile", icon: "TbUser" },
    { id: "goals", label: "Goals", icon: "TbTarget" },
    { id: "stats", label: "Statistics", icon: "TbChartBar" },
    { id: "settings", label: "Settings", icon: "TbSettings" },
  ];

  const calculateRaceStats = useCallback((raceResults: any[]) => {
    const totalRaces = raceResults.length;
    const completedRaces = raceResults.filter((r) => r.overall_time);
    const sprintResults = completedRaces.filter(
      (r) => r.races?.courses?.distance_type === "sprint",
    );
    const olympicResults = completedRaces.filter(
      (r) => r.races?.courses?.distance_type === "olympic",
    );

    // Calculate best times
    const sprintBest =
      sprintResults.length > 0
        ? Math.min(...sprintResults.map((r) => parseInterval(r.overall_time)))
        : null;

    // Calculate podium finishes (top 3 in age group)
    const podiumFinishes = completedRaces.filter(
      (r) => r.age_group_placement && r.age_group_placement <= 3,
    ).length;

    // Calculate average finish percentage
    const validPlacements = completedRaces.filter(
      (r) => r.overall_placement && r.overall_placement > 0,
    );
    const avgFinishPercentage =
      validPlacements.length > 0
        ? Math.round(
            validPlacements.reduce(
              (acc, r) => acc + r.overall_placement / 100,
              0,
            ) / validPlacements.length,
          )
        : 0;

    setRaceStats({
      totalRaces,
      podiumFinishes,
      sprintBest: sprintBest ? formatTime(sprintBest) : null,
      avgFinishPercentage,
    });
  }, []);

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get profile, goals, and race results
      const [profileResult, goalsResult, raceResultsResult] = await Promise.all(
        [
          dbHelpers.users.getCurrent(),
          dbHelpers.userGoals.getAll(),
          dbHelpers.raceResults.getAll(),
        ],
      );

      // TODO: Fix user_settings RLS policies and re-enable this call
      // Temporarily disabled to prevent 406 errors
      const settingsResult = { data: null, error: "Temporarily disabled" };

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
          distance_units: "imperial",
          temperature_units: "fahrenheit",
          notifications_race_reminders: true,
          notifications_training_updates: true,
          notifications_performance_insights: true,
          notifications_community_updates: false,
          years_racing: 0,
        };
        setSettingsForm(defaultSettings);
      }

      if (raceResultsResult.data) {
        calculateRaceStats(raceResultsResult.data);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
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
    const parts = intervalString.split(":");
    if (parts.length === 3) {
      return (
        parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
      );
    }
    return 0;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      const result = userProfile
        ? await dbHelpers.users.update(profileForm)
        : await dbHelpers.users.create(profileForm);

      if (result.data) {
        setUserProfile(result.data);
        alert("Profile updated successfully!");
      } else {
        alert("Error saving profile: " + result.error);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile");
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
        alert("Settings updated successfully!");
      } else {
        alert("Error saving settings: " + result.error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const openGoalModal = (goal: any = null) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        goal_type: goal.goal_type,
        distance_type: goal.distance_type || "sprint",
        target_value: goal.target_value,
        target_date: goal.target_date || "",
      });
    } else {
      setEditingGoal(null);
      setGoalForm({
        goal_type: "time_target",
        distance_type: "sprint",
        target_value: "",
        target_date: "",
      });
    }
    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    setGoalForm({
      goal_type: "time_target",
      distance_type: "sprint",
      target_value: "",
      target_date: "",
    });
  };

  const saveGoal = async () => {
    try {
      if (editingGoal) {
        const result = await dbHelpers.userGoals.update(
          editingGoal.id,
          goalForm,
        );
        if (result.data) {
          setUserGoals(
            userGoals.map((g) => (g.id === editingGoal.id ? result.data : g)),
          );
          alert("Goal updated successfully!");
        }
      } else {
        const result = await dbHelpers.userGoals.create(goalForm);
        if (result.data) {
          setUserGoals([...userGoals, result.data]);
          alert("Goal created successfully!");
        }
      }
      closeGoalModal();
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Error saving goal");
    }
  };

  const deleteGoal = async (goal: any) => {
    setGoalToDelete(goal);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      await dbHelpers.userGoals.delete(goalToDelete.id);
      setUserGoals(userGoals.filter((g) => g.id !== goalToDelete.id));
      setShowDeleteConfirm(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Error deleting goal");
    }
  };

  const cancelDeleteGoal = () => {
    setShowDeleteConfirm(false);
    setGoalToDelete(null);
  };

  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return "U";
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

  const handleDataExport = async (format: "json" | "csv" | "both" = "json") => {
    setDataOperationInProgress(true);
    try {
      const result = await userDataService.exportAllUserData(format);

      if (result.error) {
        alert("Error exporting data: " + result.error);
        return;
      }

      if (format === "json") {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `raceprep-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        // Create zip file with multiple CSV files
        const csvData = result.data;
        Object.keys(csvData).forEach((tableName) => {
          const blob = new Blob([csvData[tableName]], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${tableName}-${new Date().toISOString().split("T")[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } else {
        // Both formats
        const jsonBlob = new Blob([JSON.stringify(result.data.json, null, 2)], {
          type: "application/json",
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement("a");
        jsonA.href = jsonUrl;
        jsonA.download = `raceprep-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(jsonA);
        jsonA.click();
        document.body.removeChild(jsonA);
        URL.revokeObjectURL(jsonUrl);

        Object.keys(result.data.csv).forEach((tableName) => {
          const blob = new Blob([result.data.csv[tableName]], {
            type: "text/csv",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${tableName}-${new Date().toISOString().split("T")[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }

      alert("Data export completed successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data. Please try again.");
    } finally {
      setDataOperationInProgress(false);
    }
  };

  const handleDataDeletionRequest = async () => {
    setDataOperationInProgress(true);
    try {
      const result = await userDataService.requestDataDeletion();

      if (result.error) {
        alert("Error requesting data deletion: " + result.error);
        return;
      }

      alert(
        `Data deletion scheduled successfully!\n\n${result.data.message}\n\nRequest ID: ${result.data.request_id}`,
      );
      setShowDeletionConfirm(false);
    } catch (error) {
      console.error("Error requesting data deletion:", error);
      alert("Error requesting data deletion. Please try again.");
    } finally {
      setDataOperationInProgress(false);
    }
  };

  const handleImmediateDataDeletion = async () => {
    if (
      !confirm(
        "WARNING: This will immediately and permanently delete ALL your data including:\n\n• Training sessions from Strava\n• Race results and goals\n• User preferences and settings\n• All associated account data\n\nThis action CANNOT be undone. Are you absolutely sure?",
      )
    ) {
      return;
    }

    setDataOperationInProgress(true);
    try {
      const result = await userDataService.executeDataDeletion();

      if (result.error) {
        alert("Error deleting data: " + result.error);
        return;
      }

      alert(
        `Data deletion completed!\n\n${result.data.message}\n\nSummary: ${result.data.summary.successful_deletions} of ${result.data.summary.total_tables} data categories processed successfully.`,
      );

      // Sign out the user after deletion
      await handleSignOut();
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Error deleting data. Please try again.");
    } finally {
      setDataOperationInProgress(false);
      setShowDeletionConfirm(false);
    }
  };

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div
        className="bg-slate-900 relative overflow-auto flex items-center justify-center"
        style={{ minHeight: "100vh", minHeight: "100dvh" }}
      >
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <>
        <div
          className={
            useTerminal
              ? "bg-terminal-bg relative overflow-auto"
              : "bg-slate-900 relative overflow-auto"
          }
          style={{ minHeight: "100vh", minHeight: "100dvh" }}
        >
          {/* Background Effects */}
          {!useTerminal && (
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
              <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
            <div
              className={
                useTerminal
                  ? "bg-terminal-panel border-2 border-terminal-border p-12 shadow-xl text-center max-w-md"
                  : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 shadow-xl text-center max-w-md"
              }
              style={useTerminal ? { borderRadius: 0 } : undefined}
            >
              <TbTrophy
                className={
                  useTerminal
                    ? "w-16 h-16 mb-4 text-accent-yellow"
                    : "w-16 h-16 mb-4 text-yellow-400"
                }
              />
              <h2
                className={
                  useTerminal
                    ? "text-2xl font-bold text-text-primary mb-4 font-mono tracking-wider"
                    : "text-2xl font-bold text-white mb-4"
                }
              >
                {useTerminal ? "WELCOME TO RACEPREP" : "Welcome to RacePrep"}
              </h2>
              <p
                className={
                  useTerminal
                    ? "text-text-secondary mb-6 font-mono"
                    : "text-white/70 mb-6"
                }
              >
                Sign in to access your triathlon profile, track goals, and
                manage race planning.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className={
                  useTerminal
                    ? "bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all duration-300 font-mono tracking-wider"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {useTerminal ? "GET STARTED" : "Get Started"}
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
      <div
        className={
          useTerminal
            ? "bg-terminal-bg relative overflow-auto"
            : "bg-slate-900 relative overflow-auto"
        }
        style={{ minHeight: "100vh", minHeight: "100dvh" }}
      >
        {/* Background Effects */}
        {!useTerminal && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
            <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
        )}

        <div className="relative z-10 p-6 pb-24">
          {/* Header */}
          {useTerminal && (
            <div className="flex items-center justify-between mb-8 border-b-2 border-terminal-border pb-4">
              <div>
                <h1 className="text-xl font-bold text-text-primary mb-2 font-mono tracking-wider">
                  PROFILE
                </h1>
                <p className="text-sm text-text-secondary font-mono">
                  {userProfile?.name
                    ? `WELCOME BACK, ${userProfile.name.split(" ")[0].toUpperCase()}!`
                    : `WELCOME, ${user.email.toUpperCase()}!`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSignOut}
                  className="text-text-secondary hover:text-text-primary text-xs font-medium bg-terminal-panel hover:bg-terminal-border px-3 py-2 transition-all font-mono tracking-wider border-2 border-terminal-border"
                  style={{ borderRadius: 0 }}
                  title="Sign Out"
                >
                  SIGN OUT
                </button>
                <div
                  className="w-12 h-12 bg-accent-yellow flex items-center justify-center shadow-xl border-2 border-accent-yellow"
                  style={{ borderRadius: 0 }}
                >
                  <span className="text-terminal-bg text-lg font-bold font-mono">
                    {getUserInitials()}
                  </span>
                </div>
              </div>
            </div>
          )}
          {!useTerminal && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                <p className="text-lg text-white/70">
                  {userProfile?.name
                    ? `Welcome back, ${userProfile.name.split(" ")[0]}!`
                    : `Welcome, ${user.email}!`}
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
                  <span className="text-white text-xl font-bold">
                    {getUserInitials()}
                  </span>
                </div>
              </div>
            </div>
          )}

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
                className={
                  useTerminal
                    ? `px-4 py-3 font-medium transition-all duration-300 flex items-center gap-2 font-mono text-sm ${
                        activeSection === section.id
                          ? "bg-terminal-panel text-accent-yellow border-2 border-accent-yellow"
                          : "bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary"
                      }`
                    : `px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                      }`
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {renderIcon(section.icon, "w-5 h-5")}
                {useTerminal ? section.label.toUpperCase() : section.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          {!isLoading && (
            <div className="grid gap-6">
              {activeSection === "profile" && (
                <>
                  <div
                    className={
                      useTerminal
                        ? "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                        : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                  >
                    <h3
                      className={
                        useTerminal
                          ? "text-lg font-bold text-text-primary mb-6 font-mono tracking-wider"
                          : "text-xl font-bold text-white mb-6"
                      }
                    >
                      {useTerminal
                        ? "PERSONAL INFORMATION"
                        : "Personal Information"}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className={useTerminal ? "block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider" : "block text-white/80 text-sm font-medium mb-2"}>
                            {useTerminal ? "FULL NAME" : "Full Name"}
                          </label>
                          <input
                            type="text"
                            value={profileForm.name || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                name: e.target.value,
                              })
                            }
                            placeholder={useTerminal ? "ENTER YOUR FULL NAME" : "Enter your full name"}
                            className={
                              useTerminal
                                ? "w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-primary font-mono placeholder-text-secondary focus:outline-none focus:border-accent-yellow"
                                : "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profileForm.email || ""}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 placeholder-white/30 cursor-not-allowed"
                          />
                          <p className="text-white/50 text-xs mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Age Group
                          </label>
                          <select
                            value={profileForm.age_group || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                age_group: e.target.value,
                              })
                            }
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
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Experience Level
                          </label>
                          <select
                            value={profileForm.experience_level || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                experience_level: e.target.value,
                              })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select experience level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={profileForm.location || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                location: e.target.value,
                              })
                            }
                            placeholder="City, State"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            USAT ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={profileForm.usat_id || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                usat_id: e.target.value,
                              })
                            }
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
                        {isSaving ? "Saving..." : "Save Changes"}
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

              {activeSection === "goals" && (
                <>
                  <div
                    className={
                      useTerminal
                        ? "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                        : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3
                        className={
                          useTerminal
                            ? "text-lg font-bold text-text-primary font-mono tracking-wider"
                            : "text-xl font-bold text-white"
                        }
                      >
                        {useTerminal ? "MY GOALS" : "My Goals"}
                      </h3>
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
                          <div
                            key={goal.id}
                            className="border border-white/10 rounded-xl p-4 bg-white/5"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">
                                  {goal.goal_type === "time_target"
                                    ? "Time Goal"
                                    : goal.goal_type === "race_count"
                                      ? "Race Count Goal"
                                      : "Transition Goal"}
                                  {goal.distance_type &&
                                    ` - ${goal.distance_type.charAt(0).toUpperCase() + goal.distance_type.slice(1)}`}
                                </h4>
                                <div className="text-white/70 text-sm">
                                  Target: {goal.target_value}
                                  {goal.target_date &&
                                    ` by ${new Date(goal.target_date).toLocaleDateString()}`}
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
                                  onClick={() => deleteGoal(goal)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {goal.current_value && (
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-white font-mono">
                                    {goal.target_value}
                                  </div>
                                  <div className="text-white/70 text-xs">
                                    Target
                                  </div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-blue-400 font-mono">
                                    {goal.current_value}
                                  </div>
                                  <div className="text-white/70 text-xs">
                                    Current
                                  </div>
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
                        <div className="text-white/70 mb-2">
                          No goals set yet
                        </div>
                        <div className="text-white/50 text-sm">
                          Create your first goal to start tracking progress!
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSection === "stats" && (
                <div
                  className={
                    useTerminal
                      ? "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                      : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                  }
                  style={useTerminal ? { borderRadius: 0 } : undefined}
                >
                  <h3
                    className={
                      useTerminal
                        ? "text-lg font-bold text-text-primary mb-6 font-mono tracking-wider"
                        : "text-xl font-bold text-white mb-6"
                    }
                  >
                    {useTerminal
                      ? "PERFORMANCE STATISTICS"
                      : "Performance Statistics"}
                  </h3>
                  {raceStats ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <div className="text-3xl font-bold text-blue-400 font-mono mb-2">
                            {raceStats.totalRaces}
                          </div>
                          <div className="text-white/70">Total Races</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <div className="text-3xl font-bold text-green-400 font-mono mb-2">
                            {raceStats.podiumFinishes}
                          </div>
                          <div className="text-white/70">Podium Finishes</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <div className="text-3xl font-bold text-orange-400 font-mono mb-2">
                            {raceStats.sprintBest || "--:--:--"}
                          </div>
                          <div className="text-white/70">Sprint PR</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-xl">
                          <div className="text-3xl font-bold text-purple-400 font-mono mb-2">
                            {raceStats.avgFinishPercentage}%
                          </div>
                          <div className="text-white/70">Avg Finish %</div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-white font-semibold mb-4">
                          Race History Summary
                        </h4>
                        <div className="bg-white/5 rounded-xl p-6">
                          {raceStats.totalRaces > 0 ? (
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-white/70">
                                  Total Races Completed
                                </span>
                                <span className="text-white font-semibold">
                                  {raceStats.totalRaces}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">
                                  Podium Finishes
                                </span>
                                <span className="text-green-400 font-semibold">
                                  {raceStats.podiumFinishes}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">
                                  Podium Rate
                                </span>
                                <span className="text-green-400 font-semibold">
                                  {Math.round(
                                    (raceStats.podiumFinishes /
                                      raceStats.totalRaces) *
                                      100,
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <TbFlag className="w-8 h-8 mb-4 text-white/60" />
                              <div className="text-white/70">
                                No race results yet
                              </div>
                              <div className="text-white/50 text-sm">
                                Complete some races to see your stats!
                              </div>
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

              {activeSection === "settings" && (
                <div
                  className={
                    useTerminal
                      ? "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                      : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                  }
                  style={useTerminal ? { borderRadius: 0 } : undefined}
                >
                  <h3
                    className={
                      useTerminal
                        ? "text-lg font-bold text-text-primary mb-6 font-mono tracking-wider"
                        : "text-xl font-bold text-white mb-6"
                    }
                  >
                    {useTerminal ? "SETTINGS" : "Settings"}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4">
                        Units & Preferences
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="text-white">Distance Units</span>
                          <select
                            value={settingsForm.distance_units || "imperial"}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                distance_units: e.target.value,
                              })
                            }
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="imperial">Miles/Feet</option>
                            <option value="metric">Kilometers/Meters</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <span className="text-white">Temperature Units</span>
                          <select
                            value={
                              settingsForm.temperature_units || "fahrenheit"
                            }
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                temperature_units: e.target.value,
                              })
                            }
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
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                years_racing: parseInt(e.target.value) || 0,
                              })
                            }
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-4">
                        Notifications
                      </h4>
                      <div className="space-y-4">
                        {[
                          {
                            key: "notifications_race_reminders",
                            label: "Race reminders",
                          },
                          {
                            key: "notifications_training_updates",
                            label: "Training plan updates",
                          },
                          {
                            key: "notifications_performance_insights",
                            label: "Performance insights",
                          },
                          {
                            key: "notifications_community_updates",
                            label: "Community updates",
                          },
                        ].map((setting) => (
                          <div
                            key={setting.key}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                          >
                            <span className="text-white">{setting.label}</span>
                            <button
                              onClick={() =>
                                setSettingsForm({
                                  ...settingsForm,
                                  [setting.key]: !settingsForm[setting.key],
                                })
                              }
                              className={`w-12 h-6 rounded-full relative transition-colors ${
                                settingsForm[setting.key]
                                  ? "bg-blue-500"
                                  : "bg-white/20"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                                  settingsForm[setting.key]
                                    ? "translate-x-6"
                                    : "translate-x-0.5"
                                }`}
                              ></div>
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
                        {isSaving ? "Saving..." : "Save Settings"}
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
                      <h4 className="text-white font-semibold mb-4">
                        Data Privacy
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <TbDownload className="w-5 h-5 text-blue-400" />
                              <div>
                                <div className="text-white font-medium">
                                  Export Your Data
                                </div>
                                <div className="text-white/60 text-sm">
                                  Download all your training, race, and profile
                                  data
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDataExport("json")}
                              disabled={dataOperationInProgress}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {dataOperationInProgress
                                ? "Exporting..."
                                : "JSON"}
                            </button>
                            <button
                              onClick={() => handleDataExport("csv")}
                              disabled={dataOperationInProgress}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {dataOperationInProgress ? "Exporting..." : "CSV"}
                            </button>
                            <button
                              onClick={() => handleDataExport("both")}
                              disabled={dataOperationInProgress}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {dataOperationInProgress
                                ? "Exporting..."
                                : "Both"}
                            </button>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <TbShield className="w-5 h-5 text-orange-400" />
                              <div>
                                <div className="text-white font-medium">
                                  Data Deletion Request
                                </div>
                                <div className="text-white/60 text-sm">
                                  Schedule deletion of all your data (48-hour
                                  notice)
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDeletionConfirm(true)}
                            disabled={dataOperationInProgress}
                            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Request Deletion
                          </button>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <TbTrash className="w-5 h-5 text-red-400" />
                            <div>
                              <div className="text-red-300 font-medium">
                                Immediate Data Deletion
                              </div>
                              <div className="text-red-200/70 text-sm">
                                Permanently delete all data immediately
                                (irreversible)
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleImmediateDataDeletion}
                            disabled={dataOperationInProgress}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {dataOperationInProgress
                              ? "Deleting..."
                              : "Delete All Data Now"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <button
                        onClick={handleSignOut}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Deletion Confirmation Modal */}
          {showDeletionConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl border border-red-500/20 p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <TbShield className="w-6 h-6 text-orange-400" />
                  <h3 className="text-xl font-bold text-white">
                    Schedule Data Deletion
                  </h3>
                </div>

                <div className="space-y-4 text-white/80">
                  <p>
                    This will schedule the permanent deletion of all your data
                    within 48 hours, including:
                  </p>
                  <ul className="space-y-1 text-sm text-white/70 ml-4">
                    <li>• Training sessions and Strava data</li>
                    <li>• Race results and planned races</li>
                    <li>• User goals and preferences</li>
                    <li>• Profile information and settings</li>
                  </ul>
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
                    <div className="text-orange-300 text-sm font-medium mb-1">
                      Important Notes:
                    </div>
                    <ul className="text-orange-200/80 text-xs space-y-1">
                      <li>
                        • This complies with Strava API data deletion
                        requirements
                      </li>
                      <li>• You will receive a confirmation email</li>
                      <li>
                        • You can contact support to cancel before deletion
                      </li>
                      <li>• This action cannot be undone once executed</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleDataDeletionRequest}
                    disabled={dataOperationInProgress}
                    className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dataOperationInProgress
                      ? "Scheduling..."
                      : "Schedule Deletion"}
                  </button>
                  <button
                    onClick={() => setShowDeletionConfirm(false)}
                    disabled={dataOperationInProgress}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Goal Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                className={useTerminal ?
                  "bg-terminal-panel border-2 border-terminal-border p-6 w-full max-w-md" :
                  "bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                <h3 className={useTerminal ?
                  "text-lg font-bold text-text-primary mb-6 font-mono tracking-wider" :
                  "text-xl font-bold text-white mb-6"
                }>
                  {useTerminal ?
                    (editingGoal ? "EDIT GOAL" : "CREATE NEW GOAL") :
                    (editingGoal ? "Edit Goal" : "Create New Goal")
                  }
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={useTerminal ?
                      "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                      "block text-white/80 text-sm font-medium mb-2"
                    }>
                      {useTerminal ? 'GOAL TYPE' : 'Goal Type'}
                    </label>
                    <select
                      value={goalForm.goal_type}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, goal_type: e.target.value })
                      }
                      className={useTerminal ?
                        "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono" :
                        "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      }
                      style={useTerminal ? { borderRadius: 0 } : undefined}
                    >
                      <option value="time_target">{useTerminal ? 'TIME TARGET' : 'Time Target'}</option>
                      <option value="race_count">{useTerminal ? 'RACE COUNT' : 'Race Count'}</option>
                      <option value="transition_time">{useTerminal ? 'TRANSITION TIME' : 'Transition Time'}</option>
                    </select>
                  </div>

                  {goalForm.goal_type === "time_target" && (
                    <div>
                      <label className={useTerminal ?
                        "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                        "block text-white/80 text-sm font-medium mb-2"
                      }>
                        {useTerminal ? 'DISTANCE TYPE' : 'Distance Type'}
                      </label>
                      <select
                        value={goalForm.distance_type}
                        onChange={(e) =>
                          setGoalForm({
                            ...goalForm,
                            distance_type: e.target.value,
                          })
                        }
                        className={useTerminal ?
                          "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono" :
                          "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        }
                        style={useTerminal ? { borderRadius: 0 } : undefined}
                      >
                        <option value="sprint">{useTerminal ? 'SPRINT' : 'Sprint'}</option>
                        <option value="olympic">{useTerminal ? 'OLYMPIC' : 'Olympic'}</option>
                        <option value="70.3">{useTerminal ? '70.3' : '70.3'}</option>
                        <option value="ironman">{useTerminal ? 'IRONMAN' : 'Ironman'}</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={useTerminal ?
                      "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                      "block text-white/80 text-sm font-medium mb-2"
                    }>
                      {useTerminal ? 'TARGET VALUE' : 'Target Value'}
                    </label>
                    <input
                      type="text"
                      value={goalForm.target_value}
                      onChange={(e) =>
                        setGoalForm({
                          ...goalForm,
                          target_value: e.target.value,
                        })
                      }
                      placeholder={
                        goalForm.goal_type === "time_target"
                          ? (useTerminal ? "E.G., 1:30:00" : "e.g., 1:30:00")
                          : goalForm.goal_type === "race_count"
                            ? (useTerminal ? "E.G., 5" : "e.g., 5")
                            : (useTerminal ? "E.G., 1:30" : "e.g., 1:30")
                      }
                      className={useTerminal ?
                        "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono" :
                        "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      }
                      style={useTerminal ? { borderRadius: 0 } : undefined}
                    />
                  </div>

                  <div>
                    <label className={useTerminal ?
                      "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                      "block text-white/80 text-sm font-medium mb-2"
                    }>
                      {useTerminal ? 'TARGET DATE (OPTIONAL)' : 'Target Date (Optional)'}
                    </label>
                    <input
                      type="date"
                      value={goalForm.target_date}
                      onChange={(e) =>
                        setGoalForm({
                          ...goalForm,
                          target_date: e.target.value,
                        })
                      }
                      className={useTerminal ?
                        "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono" :
                        "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      }
                      style={useTerminal ? { borderRadius: 0 } : undefined}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveGoal}
                    className={useTerminal ?
                      "flex-1 bg-accent-yellow text-terminal-bg py-3 font-medium hover:bg-accent-yellow/90 transition-all font-mono tracking-wider" :
                      "flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                  >
                    {useTerminal ?
                      (editingGoal ? "UPDATE GOAL" : "CREATE GOAL") :
                      (editingGoal ? "Update Goal" : "Create Goal")
                    }
                  </button>
                  <button
                    onClick={closeGoalModal}
                    className={useTerminal ?
                      "flex-1 bg-terminal-panel text-text-secondary border-2 border-terminal-border py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider" :
                      "flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                  >
                    {useTerminal ? 'CANCEL' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Goal Confirmation */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Delete Goal"
            message="Are you sure you want to delete this goal? This action cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={confirmDeleteGoal}
            onCancel={cancelDeleteGoal}
            variant="danger"
          />
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
