import React, { useState, useEffect, useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "../../src/store";
import { dbHelpers } from "../../src/services/supabase";
import { userDataService } from "../../src/services/userDataService";
import { useAuth } from "../../src/contexts/AuthContext";
import { AuthModal } from "../../src/components/AuthModal";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
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

  // Terminal design is always enabled (constant, not a variable)

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
        className="bg-terminal-bg relative overflow-auto flex items-center justify-center"
        style={{ minHeight: "100dvh" }}
      >
        <div className="text-text-primary text-lg font-mono tracking-wider">LOADING...</div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <>
        <div
          className="bg-terminal-bg relative overflow-auto"
          style={{ minHeight: "100dvh" }}
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
            <div
              className="bg-terminal-panel border-2 border-terminal-border p-12 shadow-xl text-center max-w-md"
              style={{ borderRadius: 0 }}
            >
              <TbTrophy className="w-16 h-16 mb-4 text-accent-yellow" />
              <h2 className="text-2xl font-bold text-text-primary mb-4 font-mono tracking-wider">
                WELCOME TO RACEPREP
              </h2>
              <p className="text-text-secondary mb-6 font-mono">
                Sign in to access your triathlon profile, track goals, and
                manage race planning.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all duration-300 font-mono tracking-wider"
                style={{ borderRadius: 0 }}
              >
                GET STARTED
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
        className="bg-terminal-bg relative overflow-auto"
        style={{ minHeight: "100dvh" }}
      >
        <div className="relative z-10 p-6 pb-24">
          {/* Header */}
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-text-primary text-lg font-mono tracking-wider">LOADING PROFILE...</div>
            </div>
          )}

          {/* Profile Sections */}
          <div className="flex flex-wrap gap-2 mb-8">
            {profileSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-3 font-medium transition-all duration-300 flex items-center gap-2 font-mono text-sm ${
                  activeSection === section.id
                    ? "bg-terminal-panel text-accent-yellow border-2 border-accent-yellow"
                    : "bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary"
                }`}
                style={{ borderRadius: 0 }}
              >
                {renderIcon(section.icon, "w-5 h-5")}
                {section.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Section Content */}
          {!isLoading && (
            <div className="grid gap-6">
              {activeSection === "profile" && (
                <>
                  <div
                    className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                    style={{ borderRadius: 0 }}
                  >
                    <h3 className="text-lg font-bold text-text-primary mb-6 font-mono tracking-wider">
                      PERSONAL INFORMATION
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider">
                            FULL NAME
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
                            placeholder="ENTER YOUR FULL NAME"
                            className="w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-primary font-mono placeholder-text-secondary focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider">
                            EMAIL
                          </label>
                          <input
                            type="email"
                            value={profileForm.email || ""}
                            disabled
                            className="w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-secondary font-mono cursor-not-allowed"
                            style={{ borderRadius: 0 }}
                          />
                          <p className="text-text-secondary text-xs mt-1 font-mono">
                            EMAIL CANNOT BE CHANGED
                          </p>
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider">
                            AGE GROUP
                          </label>
                          <select
                            value={profileForm.age_group || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                age_group: e.target.value,
                              })
                            }
                            className="w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          >
                            <option value="" className="bg-terminal-bg">SELECT AGE GROUP</option>
                            <option value="M17 & Under" className="bg-terminal-bg">M17 & UNDER</option>
                            <option value="M18-24" className="bg-terminal-bg">M18-24</option>
                            <option value="M25-29" className="bg-terminal-bg">M25-29</option>
                            <option value="M30-34" className="bg-terminal-bg">M30-34</option>
                            <option value="M35-39" className="bg-terminal-bg">M35-39</option>
                            <option value="M40-44" className="bg-terminal-bg">M40-44</option>
                            <option value="M45-49" className="bg-terminal-bg">M45-49</option>
                            <option value="M50-54" className="bg-terminal-bg">M50-54</option>
                            <option value="M55-59" className="bg-terminal-bg">M55-59</option>
                            <option value="M60+" className="bg-terminal-bg">M60+</option>
                            <option value="F17 & Under" className="bg-terminal-bg">F17 & UNDER</option>
                            <option value="F18-24" className="bg-terminal-bg">F18-24</option>
                            <option value="F25-29" className="bg-terminal-bg">F25-29</option>
                            <option value="F30-34" className="bg-terminal-bg">F30-34</option>
                            <option value="F35-39" className="bg-terminal-bg">F35-39</option>
                            <option value="F40-44" className="bg-terminal-bg">F40-44</option>
                            <option value="F45-49" className="bg-terminal-bg">F45-49</option>
                            <option value="F50-54" className="bg-terminal-bg">F50-54</option>
                            <option value="F55-59" className="bg-terminal-bg">F55-59</option>
                            <option value="F60+" className="bg-terminal-bg">F60+</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider">
                            EXPERIENCE LEVEL
                          </label>
                          <select
                            value={profileForm.experience_level || ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                experience_level: e.target.value,
                              })
                            }
                            className="w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          >
                            <option value="" className="bg-terminal-bg">SELECT EXPERIENCE LEVEL</option>
                            <option value="beginner" className="bg-terminal-bg">BEGINNER</option>
                            <option value="intermediate" className="bg-terminal-bg">INTERMEDIATE</option>
                            <option value="advanced" className="bg-terminal-bg">ADVANCED</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider">
                            LOCATION
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
                            placeholder="CITY, STATE"
                            className="w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-primary font-mono placeholder-text-secondary focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm font-mono font-bold mb-2 tracking-wider">
                            USAT ID (OPTIONAL)
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
                            placeholder="ENTER USAT ID"
                            className="w-full bg-terminal-bg border-2 border-terminal-border px-4 py-3 text-text-primary font-mono placeholder-text-secondary focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleProfileSave}
                        disabled={isSaving}
                        className="bg-accent-yellow text-terminal-bg px-6 py-3 font-mono font-bold tracking-wider hover:bg-accent-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderRadius: 0 }}
                      >
                        {isSaving ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                      <button
                        onClick={() => {
                          setProfileForm(userProfile || {});
                        }}
                        className="bg-transparent border-2 border-terminal-border text-text-secondary px-6 py-3 font-mono font-bold tracking-wider hover:border-accent-yellow hover:text-text-primary transition-colors"
                        style={{ borderRadius: 0 }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "goals" && (
                <>
                  <div
                    className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-text-primary font-mono tracking-wider">
                        MY GOALS
                      </h3>
                      <button
                        onClick={() => openGoalModal()}
                        className="bg-accent-yellow text-terminal-bg px-4 py-2 font-mono font-bold tracking-wider hover:bg-accent-yellow/90 transition-colors"
                        style={{ borderRadius: 0 }}
                      >
                        ADD GOAL
                      </button>
                    </div>

                    {userGoals.length > 0 ? (
                      <div className="space-y-4">
                        {userGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="border-2 border-terminal-border p-4 bg-terminal-bg"
                            style={{ borderRadius: 0 }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="text-text-primary font-semibold mb-1 font-mono tracking-wider">
                                  {goal.goal_type === "time_target"
                                    ? "TIME GOAL"
                                    : goal.goal_type === "race_count"
                                      ? "RACE COUNT GOAL"
                                      : "TRANSITION GOAL"}
                                  {goal.distance_type &&
                                    ` - ${goal.distance_type.toUpperCase()}`}
                                </h4>
                                <div className="text-text-secondary text-sm font-mono">
                                  TARGET: {goal.target_value}
                                  {goal.target_date &&
                                    ` BY ${new Date(goal.target_date).toLocaleDateString()}`}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openGoalModal(goal)}
                                  className="text-accent-yellow hover:text-accent-yellow/80 text-sm font-mono tracking-wider"
                                >
                                  EDIT
                                </button>
                                <button
                                  onClick={() => deleteGoal(goal)}
                                  className="text-discipline-bike hover:text-discipline-bike/80 text-sm font-mono tracking-wider"
                                >
                                  DELETE
                                </button>
                              </div>
                            </div>

                            {goal.current_value && (
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-text-primary font-mono">
                                    {goal.target_value}
                                  </div>
                                  <div className="text-text-secondary text-xs font-mono tracking-wider">
                                    TARGET
                                  </div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-accent-yellow font-mono">
                                    {goal.current_value}
                                  </div>
                                  <div className="text-text-secondary text-xs font-mono tracking-wider">
                                    CURRENT
                                  </div>
                                </div>
                              </div>
                            )}

                            {goal.achieved && (
                              <div className="mt-3 text-center">
                                <span className="bg-accent-yellow/20 text-accent-yellow px-3 py-1 text-sm font-mono tracking-wider border-2 border-accent-yellow" style={{ borderRadius: 0 }}>
                                  ACHIEVED
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <TbTarget className="w-8 h-8 mb-4 text-text-secondary mx-auto" />
                        <div className="text-text-secondary mb-2 font-mono tracking-wider">
                          NO GOALS SET YET
                        </div>
                        <div className="text-text-secondary text-sm font-mono">
                          CREATE YOUR FIRST GOAL TO START TRACKING PROGRESS
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSection === "stats" && (
                <div
                  className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                  style={{ borderRadius: 0 }}
                >
                  <h3 className="text-lg font-bold text-text-primary mb-6 font-mono tracking-wider">
                    PERFORMANCE STATISTICS
                  </h3>
                  {raceStats ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <div className="text-3xl font-bold text-discipline-swim font-mono mb-2">
                            {raceStats.totalRaces}
                          </div>
                          <div className="text-text-secondary font-mono tracking-wider">TOTAL RACES</div>
                        </div>
                        <div className="text-center p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <div className="text-3xl font-bold text-accent-yellow font-mono mb-2">
                            {raceStats.podiumFinishes}
                          </div>
                          <div className="text-text-secondary font-mono tracking-wider">PODIUM FINISHES</div>
                        </div>
                        <div className="text-center p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <div className="text-3xl font-bold text-discipline-bike font-mono mb-2">
                            {raceStats.sprintBest || "--:--:--"}
                          </div>
                          <div className="text-text-secondary font-mono tracking-wider">SPRINT PR</div>
                        </div>
                        <div className="text-center p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <div className="text-3xl font-bold text-discipline-run font-mono mb-2">
                            {raceStats.avgFinishPercentage}%
                          </div>
                          <div className="text-text-secondary font-mono tracking-wider">AVG FINISH %</div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-text-primary font-semibold mb-4 font-mono tracking-wider">
                          RACE HISTORY SUMMARY
                        </h4>
                        <div className="bg-terminal-bg border-2 border-terminal-border p-6" style={{ borderRadius: 0 }}>
                          {raceStats.totalRaces > 0 ? (
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-text-secondary font-mono tracking-wider">
                                  TOTAL RACES COMPLETED
                                </span>
                                <span className="text-text-primary font-semibold font-mono">
                                  {raceStats.totalRaces}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary font-mono tracking-wider">
                                  PODIUM FINISHES
                                </span>
                                <span className="text-accent-yellow font-semibold font-mono">
                                  {raceStats.podiumFinishes}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary font-mono tracking-wider">
                                  PODIUM RATE
                                </span>
                                <span className="text-accent-yellow font-semibold font-mono">
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
                              <TbFlag className="w-8 h-8 mb-4 text-text-secondary mx-auto" />
                              <div className="text-text-secondary font-mono tracking-wider">
                                NO RACE RESULTS YET
                              </div>
                              <div className="text-text-secondary text-sm font-mono">
                                COMPLETE SOME RACES TO SEE YOUR STATS
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-text-secondary font-mono tracking-wider">LOADING STATISTICS...</div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "settings" && (
                <div
                  className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                  style={{ borderRadius: 0 }}
                >
                  <h3 className="text-lg font-bold text-text-primary mb-6 font-mono tracking-wider">
                    SETTINGS
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-text-primary font-semibold mb-4 font-mono tracking-wider">
                        UNITS & PREFERENCES
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <span className="text-text-primary font-mono tracking-wider">DISTANCE UNITS</span>
                          <select
                            value={settingsForm.distance_units || "imperial"}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                distance_units: e.target.value,
                              })
                            }
                            className="bg-terminal-bg border-2 border-terminal-border px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          >
                            <option value="imperial" className="bg-terminal-bg">MILES/FEET</option>
                            <option value="metric" className="bg-terminal-bg">KILOMETERS/METERS</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <span className="text-text-primary font-mono tracking-wider">TEMPERATURE UNITS</span>
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
                            className="bg-terminal-bg border-2 border-terminal-border px-3 py-2 text-text-primary font-mono focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          >
                            <option value="fahrenheit" className="bg-terminal-bg">FAHRENHEIT</option>
                            <option value="celsius" className="bg-terminal-bg">CELSIUS</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-terminal-bg border-2 border-terminal-border" style={{ borderRadius: 0 }}>
                          <span className="text-text-primary font-mono tracking-wider">YEARS RACING</span>
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
                            className="bg-terminal-bg border-2 border-terminal-border px-3 py-2 text-text-primary font-mono w-20 text-center focus:outline-none focus:border-accent-yellow"
                            style={{ borderRadius: 0 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-text-primary font-semibold mb-4 font-mono tracking-wider">
                        NOTIFICATIONS
                      </h4>
                      <div className="space-y-4">
                        {[
                          {
                            key: "notifications_race_reminders",
                            label: "RACE REMINDERS",
                          },
                          {
                            key: "notifications_training_updates",
                            label: "TRAINING PLAN UPDATES",
                          },
                          {
                            key: "notifications_performance_insights",
                            label: "PERFORMANCE INSIGHTS",
                          },
                          {
                            key: "notifications_community_updates",
                            label: "COMMUNITY UPDATES",
                          },
                        ].map((setting) => (
                          <div
                            key={setting.key}
                            className="flex items-center justify-between p-4 bg-terminal-bg border-2 border-terminal-border"
                            style={{ borderRadius: 0 }}
                          >
                            <span className="text-text-primary font-mono tracking-wider">{setting.label}</span>
                            <button
                              onClick={() =>
                                setSettingsForm({
                                  ...settingsForm,
                                  [setting.key]: !settingsForm[setting.key],
                                })
                              }
                              className={`w-12 h-6 relative transition-colors border-2 ${
                                settingsForm[setting.key]
                                  ? "bg-accent-yellow border-accent-yellow"
                                  : "bg-terminal-bg border-terminal-border"
                              }`}
                              style={{ borderRadius: 0 }}
                            >
                              <div
                                className={`w-4 h-4 bg-terminal-bg absolute top-0.5 transition-transform border border-terminal-border ${
                                  settingsForm[setting.key]
                                    ? "translate-x-6"
                                    : "translate-x-0.5"
                                }`}
                                style={{ borderRadius: 0 }}
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
                        className="bg-accent-yellow text-terminal-bg px-6 py-3 font-mono font-bold tracking-wider hover:bg-accent-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderRadius: 0 }}
                      >
                        {isSaving ? "SAVING..." : "SAVE SETTINGS"}
                      </button>
                      <button
                        onClick={() => {
                          setSettingsForm(userSettings || {});
                        }}
                        className="bg-transparent border-2 border-terminal-border text-text-secondary px-6 py-3 font-mono font-bold tracking-wider hover:border-accent-yellow hover:text-text-primary transition-colors"
                        style={{ borderRadius: 0 }}
                      >
                        CANCEL
                      </button>
                    </div>

                    <div className="pt-6 border-t-2 border-terminal-border">
                      <h4 className="text-text-primary font-semibold mb-4 font-mono tracking-wider">
                        DATA PRIVACY
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-terminal-bg border-2 border-terminal-border p-4" style={{ borderRadius: 0 }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <TbDownload className="w-5 h-5 text-discipline-swim" />
                              <div>
                                <div className="text-text-primary font-medium font-mono tracking-wider">
                                  EXPORT YOUR DATA
                                </div>
                                <div className="text-text-secondary text-sm font-mono">
                                  DOWNLOAD ALL YOUR TRAINING, RACE, AND PROFILE DATA
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDataExport("json")}
                              disabled={dataOperationInProgress}
                              className="bg-discipline-swim/20 hover:bg-discipline-swim/30 text-discipline-swim border-2 border-discipline-swim px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                              style={{ borderRadius: 0 }}
                            >
                              {dataOperationInProgress
                                ? "EXPORTING..."
                                : "JSON"}
                            </button>
                            <button
                              onClick={() => handleDataExport("csv")}
                              disabled={dataOperationInProgress}
                              className="bg-discipline-swim/20 hover:bg-discipline-swim/30 text-discipline-swim border-2 border-discipline-swim px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                              style={{ borderRadius: 0 }}
                            >
                              {dataOperationInProgress ? "EXPORTING..." : "CSV"}
                            </button>
                            <button
                              onClick={() => handleDataExport("both")}
                              disabled={dataOperationInProgress}
                              className="bg-discipline-swim/20 hover:bg-discipline-swim/30 text-discipline-swim border-2 border-discipline-swim px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                              style={{ borderRadius: 0 }}
                            >
                              {dataOperationInProgress
                                ? "EXPORTING..."
                                : "BOTH"}
                            </button>
                          </div>
                        </div>

                        <div className="bg-terminal-bg border-2 border-terminal-border p-4" style={{ borderRadius: 0 }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <TbShield className="w-5 h-5 text-discipline-bike" />
                              <div>
                                <div className="text-text-primary font-medium font-mono tracking-wider">
                                  DATA DELETION REQUEST
                                </div>
                                <div className="text-text-secondary text-sm font-mono">
                                  SCHEDULE DELETION OF ALL YOUR DATA (48-HOUR NOTICE)
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDeletionConfirm(true)}
                            disabled={dataOperationInProgress}
                            className="bg-discipline-bike/20 hover:bg-discipline-bike/30 text-discipline-bike border-2 border-discipline-bike px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                            style={{ borderRadius: 0 }}
                          >
                            REQUEST DELETION
                          </button>
                        </div>

                        <div className="bg-discipline-run/10 border-2 border-discipline-run p-4" style={{ borderRadius: 0 }}>
                          <div className="flex items-center gap-3 mb-3">
                            <TbTrash className="w-5 h-5 text-discipline-run" />
                            <div>
                              <div className="text-discipline-run font-medium font-mono tracking-wider">
                                IMMEDIATE DATA DELETION
                              </div>
                              <div className="text-discipline-run/70 text-sm font-mono">
                                PERMANENTLY DELETE ALL DATA IMMEDIATELY (IRREVERSIBLE)
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleImmediateDataDeletion}
                            disabled={dataOperationInProgress}
                            className="bg-discipline-run/20 hover:bg-discipline-run/30 text-discipline-run border-2 border-discipline-run px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                            style={{ borderRadius: 0 }}
                          >
                            {dataOperationInProgress
                              ? "DELETING..."
                              : "DELETE ALL DATA NOW"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t-2 border-terminal-border">
                      <button
                        onClick={handleSignOut}
                        className="bg-discipline-run/20 hover:bg-discipline-run/30 text-discipline-run border-2 border-discipline-run px-6 py-3 font-medium transition-colors font-mono tracking-wider"
                        style={{ borderRadius: 0 }}
                      >
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data Deletion Confirmation Modal */}
          {showDeletionConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div
                className="bg-terminal-panel border-2 border-accent-yellow p-6 w-full max-w-md"
                style={{ borderRadius: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <TbShield className="w-6 h-6 text-accent-yellow" />
                  <h3 className="text-xl font-bold text-text-primary font-mono tracking-wider uppercase">
                    SCHEDULE DATA DELETION
                  </h3>
                </div>

                <div className="space-y-4 text-text-primary font-mono">
                  <p>
                    THIS WILL SCHEDULE THE PERMANENT DELETION OF ALL YOUR DATA WITHIN 48 HOURS, INCLUDING:
                  </p>
                  <ul className="space-y-1 text-sm text-text-secondary ml-4 tracking-wide">
                    <li>• TRAINING SESSIONS AND STRAVA DATA</li>
                    <li>• RACE RESULTS AND PLANNED RACES</li>
                    <li>• USER GOALS AND PREFERENCES</li>
                    <li>• PROFILE INFORMATION AND SETTINGS</li>
                  </ul>
                  <div
                    className="bg-accent-yellow/10 border-2 border-accent-yellow p-3"
                    style={{ borderRadius: 0 }}
                  >
                    <div className="text-accent-yellow text-sm font-medium mb-1 tracking-wider uppercase">
                      IMPORTANT NOTES:
                    </div>
                    <ul className="text-text-secondary text-xs space-y-1 tracking-wide">
                      <li>• THIS COMPLIES WITH STRAVA API DATA DELETION REQUIREMENTS</li>
                      <li>• YOU WILL RECEIVE A CONFIRMATION EMAIL</li>
                      <li>• YOU CAN CONTACT SUPPORT TO CANCEL BEFORE DELETION</li>
                      <li>• THIS ACTION CANNOT BE UNDONE ONCE EXECUTED</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleDataDeletionRequest}
                    disabled={dataOperationInProgress}
                    className="flex-1 bg-accent-yellow/20 hover:bg-accent-yellow/30 text-accent-yellow border-2 border-accent-yellow py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider uppercase"
                    style={{ borderRadius: 0 }}
                  >
                    {dataOperationInProgress ? "SCHEDULING..." : "SCHEDULE DELETION"}
                  </button>
                  <button
                    onClick={() => setShowDeletionConfirm(false)}
                    disabled={dataOperationInProgress}
                    className="flex-1 bg-terminal-panel text-text-secondary border-2 border-terminal-border py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider uppercase"
                    style={{ borderRadius: 0 }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Goal Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                className="bg-terminal-panel border-2 border-terminal-border p-6 w-full max-w-md"
                style={{ borderRadius: 0 }}
              >
                <h3 className="text-lg font-bold text-text-primary mb-6 font-mono tracking-wider">
                  {editingGoal ? "EDIT GOAL" : "CREATE NEW GOAL"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                      GOAL TYPE
                    </label>
                    <select
                      value={goalForm.goal_type}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, goal_type: e.target.value })
                      }
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                    >
                      <option value="time_target">TIME TARGET</option>
                      <option value="race_count">RACE COUNT</option>
                      <option value="transition_time">TRANSITION TIME</option>
                    </select>
                  </div>

                  {goalForm.goal_type === "time_target" && (
                    <div>
                      <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                        DISTANCE TYPE
                      </label>
                      <select
                        value={goalForm.distance_type}
                        onChange={(e) =>
                          setGoalForm({
                            ...goalForm,
                            distance_type: e.target.value,
                          })
                        }
                        className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                        style={{ borderRadius: 0 }}
                      >
                        <option value="sprint">SPRINT</option>
                        <option value="olympic">OLYMPIC</option>
                        <option value="70.3">70.3</option>
                        <option value="ironman">IRONMAN</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                      TARGET VALUE
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
                          ? "E.G., 1:30:00"
                          : goalForm.goal_type === "race_count"
                            ? "E.G., 5"
                            : "E.G., 1:30"
                      }
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                      TARGET DATE (OPTIONAL)
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
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveGoal}
                    className="flex-1 bg-accent-yellow text-terminal-bg py-3 font-medium hover:bg-accent-yellow/90 transition-all font-mono tracking-wider"
                    style={{ borderRadius: 0 }}
                  >
                    {editingGoal ? "UPDATE GOAL" : "CREATE GOAL"}
                  </button>
                  <button
                    onClick={closeGoalModal}
                    className="flex-1 bg-terminal-panel text-text-secondary border-2 border-terminal-border py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider"
                    style={{ borderRadius: 0 }}
                  >
                    CANCEL
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
