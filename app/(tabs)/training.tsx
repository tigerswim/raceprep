import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { AuthGuard } from "../../src/components/AuthGuard";
import { dbHelpers } from "../../src/services/supabase";
import { useAuth } from "../../src/contexts/AuthContext";
import { api } from "../../src/store/api";
import { useTerminalModeToggle } from "../../src/hooks/useTerminalModeToggle";
import { getTerminalModeState } from "../../src/utils/featureFlags";
import { TrainingPlanSelectionScreen } from "../../src/screens/Training/TrainingPlanSelectionScreen";
import {
  TbSwimming,
  TbBike,
  TbRun,
  TbChartBar,
  TbEdit,
  TbCalendar,
  TbBook,
  TbTrendingUp,
  TbSearch,
  TbBolt,
  TbStar,
  TbClock,
  TbBattery,
  TbMountain,
  TbHeart,
  TbRuler,
  TbTrash,
  TbThumbUp,
  TbTarget,
  TbMoodSmile,
  TbFlame,
  TbHome,
  TbMapPin,
  TbCalendarEvent,
} from "react-icons/tb";

// Icon component mapping
const iconComponents = {
  TbSwimming,
  TbBike,
  TbRun,
  TbChartBar,
  TbEdit,
  TbCalendar,
  TbBook,
  TbTrendingUp,
  TbSearch,
  TbBolt,
  TbStar,
  TbClock,
  TbBattery,
  TbMountain,
  TbHeart,
  TbRuler,
  TbTrash,
  TbThumbUp,
  TbTarget,
  TbMoodSmile,
  TbFlame,
  TbHome,
  TbMapPin,
  TbCalendarEvent,
};

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  return IconComponent ? (
    <IconComponent className={className} />
  ) : (
    <span>{iconName}</span>
  );
};

interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  duration_minutes: number;
  location: string;
  city: string;
  state: string;
  registration_url: string;
}

interface TrainingArticle {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  disciplines: string[];
  skill_level: string;
  reading_time_minutes: number;
  published_at: string;
  url: string;
  image_url: string;
}

interface WorkoutLog {
  id: string;
  date: string;
  start_time?: string; // Full ISO timestamp from Strava
  discipline: "swim" | "bike" | "run" | "brick";
  duration_minutes: number;
  distance?: number;
  distance_unit: "miles" | "km";
  intensity: "easy" | "moderate" | "hard" | "race_pace";
  notes: string;
  feeling_rating: number; // 1-10
  strava_activity_id?: string;
  // Enhanced Strava fields
  average_speed?: number; // m/s
  total_elevation_gain?: number; // meters
  average_heartrate?: number; // bpm
  max_heartrate?: number; // bpm
  average_watts?: number; // watts (cycling)
  trainer?: boolean; // indoor trainer
  sport_type?: string; // VirtualRun, TrailRun, etc.
  suffer_score?: number; // Strava training stress
  elapsed_time?: number; // total elapsed time
  average_cadence?: number; // steps/min or rpm
  start_latlng?: [number, number]; // coordinates
  kudos_count?: number; // social engagement
}

// Helper functions for enhanced metrics
function calculatePace(speed: number, discipline: string): string {
  if (discipline === "run" && speed > 0) {
    // Convert m/s to min/mile
    const paceInMinutesPerMile = 26.8224 / speed;
    const minutes = Math.floor(paceInMinutesPerMile);
    const seconds = Math.round((paceInMinutesPerMile - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}/mi`;
  }
  return `${(speed * 2.237).toFixed(1)} mph`;
}

function getIntensityFromHeartRate(avgHR: number, maxHR?: number): string {
  if (!avgHR) return "moderate";
  const estMaxHR = maxHR || 220 - 30; // Rough estimate if we don't have max HR
  const percentage = (avgHR / estMaxHR) * 100;

  if (percentage < 65) return "easy";
  if (percentage < 75) return "moderate";
  if (percentage < 85) return "hard";
  return "race_pace";
}

function getHeartRateZone(avgHR: number, maxHR?: number): string {
  if (!avgHR) return "Unknown";
  const estMaxHR = maxHR || 190; // Rough estimate for adults
  const percentage = (avgHR / estMaxHR) * 100;

  if (percentage < 60) return "Zone 1 (Recovery)";
  if (percentage < 70) return "Zone 2 (Aerobic)";
  if (percentage < 80) return "Zone 3 (Tempo)";
  if (percentage < 90) return "Zone 4 (Threshold)";
  return "Zone 5 (VO2 Max)";
}

function calculatePerformanceScore(workout: WorkoutLog): number {
  // Quality Score Calculation (0-100):
  // Base score: 50 points
  // Distance points: 0-30 (swim: 2km max, bike: 40km max, run: 10km max)
  // Duration points: 0-20 (1 hour = max points)
  let score = 50; // base score

  // Distance component (0-30 points)
  const distance = workout.distance ? workout.distance * 1609.34 : 0; // Convert miles to meters
  if (workout.discipline === "swim") {
    score += Math.min(30, (distance / 2000) * 30); // 2km swim = max points
  } else if (workout.discipline === "bike") {
    score += Math.min(30, (distance / 40000) * 30); // 40km bike = max points
  } else {
    // run
    score += Math.min(30, (distance / 10000) * 30); // 10km run = max points
  }

  // Duration component (0-20 points)
  const duration = workout.duration_minutes * 60; // Convert to seconds
  score += Math.min(20, (duration / 3600) * 20); // 1 hour = max points

  return Math.round(Math.min(100, score));
}

function getPerformanceColor(score: number): string {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function formatPaceForCard(
  averageSpeed: number,
  type: "swim" | "bike" | "run",
): string {
  if (!averageSpeed || averageSpeed === 0) return "";

  if (type === "swim") {
    // For swimming, show pace per 100m in seconds
    const per100m = 100 / averageSpeed; // seconds per 100m
    const minutes = Math.floor(per100m / 60);
    const seconds = Math.round(per100m % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}/100m`;
  } else if (type === "run") {
    // For running, show pace per km in min:sec
    const perKm = 1000 / averageSpeed; // seconds per km
    const minutes = Math.floor(perKm / 60);
    const seconds = Math.round(perKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
  } else {
    // For cycling, show speed in km/h
    const kmh = averageSpeed * 3.6;
    return `${kmh.toFixed(1)}km/h`;
  }
}

// Helper function to filter workouts
function getFilteredWorkouts(
  workouts: WorkoutLog[],
  activityFilter: string,
  dateFilter: string,
): WorkoutLog[] {
  let filtered = [...workouts];

  // Filter by activity type
  if (activityFilter !== "all") {
    filtered = filtered.filter(
      (workout) => workout.discipline === activityFilter,
    );
  }

  // Filter by date
  if (dateFilter !== "all") {
    const now = new Date();
    let cutoffDate: Date;

    if (dateFilter === "week") {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "month") {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      cutoffDate = new Date(0); // All time
    }

    filtered = filtered.filter(
      (workout) => new Date(workout.date) >= cutoffDate,
    );
  }

  return filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

const TrainingScreenContent = React.memo(function TrainingScreenContent() {
  const { user } = useAuth();
  const router = useRouter();

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

  const [activeTab, setActiveTab] = useState("overview");
  const [trainingEvents, setTrainingEvents] = useState<TrainingEvent[]>([]);
  const [trainingArticles, setTrainingArticles] = useState<TrainingArticle[]>(
    [],
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaAccessToken, setStravaAccessToken] = useState<string | null>(
    null,
  );
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(
    null,
  );
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [hasError] = useState(false);
  const [workoutsDisplayCount, setWorkoutsDisplayCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Enhanced workout analytics (unused state variables removed)

  // Filtering and navigation state
  const [activityFilter, setActivityFilter] = useState<
    "all" | "swim" | "bike" | "run"
  >("all");
  const [dateFilter, setDateFilter] = useState<"week" | "month" | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Computed filtered workouts - memoized to prevent unnecessary re-calculations
  const filteredWorkouts = useMemo(() => {
    return getFilteredWorkouts(workoutLogs, activityFilter, dateFilter);
  }, [workoutLogs, activityFilter, dateFilter]);

  const [weeklyStats, setWeeklyStats] = useState({
    swim: { distance: 0, sessions: 0, time: 0 },
    bike: { distance: 0, sessions: 0, time: 0 },
    run: { distance: 0, sessions: 0, time: 0 },
  });

  // Initialize Strava mutation hook (not currently used)
  api.useConnectStravaMutation();

  // Workout form state
  const [newWorkout, setNewWorkout] = useState({
    date: new Date().toISOString().split("T")[0],
    discipline: "run" as "swim" | "bike" | "run" | "brick",
    duration_minutes: "",
    distance: "",
    distance_unit: "miles" as "miles" | "km",
    intensity: "moderate" as "easy" | "moderate" | "hard" | "race_pace",
    notes: "",
    feeling_rating: 7,
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: "TbChartBar" },
    { id: "plans", label: "Training Plans", icon: "TbCalendarEvent" },
    { id: "workouts", label: "Log Workout", icon: "TbEdit" },
    { id: "events", label: "Training Events", icon: "TbCalendar" },
    { id: "articles", label: "Training Tips", icon: "TbBook" },
    { id: "analytics", label: "Analytics", icon: "TbTrendingUp" },
  ];

  // Reset display count when filters change
  useEffect(() => {
    setWorkoutsDisplayCount(10);
  }, [activityFilter, dateFilter]);

  const loadStravaData = useCallback(async () => {
    try {
      if (!user) {
        setStravaConnected(false);
        return;
      }

      // Debug user object (removed for production)

      if (!user.id) {
        console.error("[STRAVA] User ID is missing");
        setStravaConnected(false);
        return;
      }

      // Check if user has valid Strava tokens
      const { data: userData, error: userError } =
        await dbHelpers.users.getProfile(user.id);

      if (userError || !userData) {
        console.error("Error loading user profile:", userError);
        setStravaConnected(false);
        return;
      }

      // Check if user has Strava access token and it's not expired
      const hasValidStravaToken =
        userData.strava_access_token &&
        userData.strava_token_expires_at &&
        new Date(userData.strava_token_expires_at) > new Date();

      if (hasValidStravaToken) {
        setStravaConnected(true);
        setStravaAccessToken(userData.strava_access_token);
        await loadStravaStats("connected");
      } else {
        // Token is missing or expired, show connect button
        setStravaConnected(false);
        setStravaAccessToken(null);
      }
    } catch (error) {
      console.error("Error loading Strava data:", error);
      setStravaConnected(false);
    }
  }, [user]);

  const loadStravaStats = async (accessToken: string) => {
    try {
      // Get weekly stats from Supabase (would be populated by Strava sync)
      const statsResult = await dbHelpers.trainingSessions.getWeeklyStats();
      if (statsResult.data && !statsResult.error) {
        setWeeklyStats(statsResult.data);
      }
    } catch (error) {
      console.error("Error loading weekly stats:", error);
    }
  };

  const handleStravaConnect = useCallback(() => {
    if (!user?.id) {
      alert("Please ensure you are logged in before connecting Strava.");
      return;
    }

    // Store user info in sessionStorage before redirect to preserve auth state
    sessionStorage.setItem("strava_auth_user_id", user.id);
    sessionStorage.setItem("strava_auth_timestamp", Date.now().toString());

    // Redirect to Strava OAuth
    const clientId = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/strava-callback`;
    const scope = "read,activity:read_all";
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;

    // Storing user ID in sessionStorage before Strava redirect (debug log removed)
    window.location.href = stravaAuthUrl;
  }, [user?.id]);

  const handleStravaDisconnect = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Strava? This will remove all synced training data.",
      )
    ) {
      return;
    }

    if (!user?.id) {
      alert("User not authenticated. Please refresh the page and try again.");
      return;
    }

    try {
      setIsLoading(true);

      // Clear Strava tokens from user profile
      const { error: updateError } = await dbHelpers.users.updateProfile(
        user.id,
        {
          strava_access_token: null,
          strava_refresh_token: null,
          strava_token_expires_at: null,
          strava_user_id: null,
        },
      );

      if (updateError) {
        console.error("Error updating user profile:", updateError);
        alert("Failed to disconnect Strava. Please try again.");
        return;
      }

      // Clear all Strava training sessions from database
      const { error: deleteError } =
        await dbHelpers.trainingSessions.deleteAll();

      if (deleteError) {
        console.error("Error deleting training sessions:", deleteError);
        // Continue even if deletion fails, since tokens are cleared
      }

      // Reset local state
      setStravaConnected(false);
      setStravaAccessToken(null);
      setWorkoutLogs([]);

      // Clear deleted activities list from localStorage
      localStorage.removeItem("deletedStravaActivities");

      alert(
        "Strava has been disconnected successfully. You can reconnect at any time.",
      );
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      alert("Failed to disconnect Strava. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const handleStravaSync = useCallback(async () => {
    if (!stravaAccessToken) return;

    try {
      setIsLoading(true);

      // Get recent activities from Strava using the API base URL
      const apiBaseUrl =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
      const activitiesResponse = await fetch(
        `${apiBaseUrl}/strava/activities?access_token=${stravaAccessToken}&per_page=50`,
      );
      const activities = await activitiesResponse.json();

      // Transform and sync to database
      if (activities && activities.length > 0) {
        // Get list of deleted activities to skip
        const deletedActivities = JSON.parse(
          localStorage.getItem("deletedStravaActivities") || "[]",
        );

        // Transform Strava activity format to match training_sessions table (same as in strava-callback)
        const transformedActivities = activities
          .filter((activity: any) => activity.id) // Ensure activity has an ID
          .filter(
            (activity: any) =>
              !deletedActivities.includes(activity.id?.toString()),
          ) // Skip deleted activities
          .map((activity: any) => {
            // Debug: Log removed for production

            // Use the correct field name from Strava API (either 'type' or 'sport_type')
            const stravaType = activity.type || activity.sport_type || "";
            const typeStr = stravaType.toLowerCase();

            // Processing activity (debug log removed)

            // Map Strava activity types to our database schema (swim/bike/run only)
            // Note: Server already converts 'Ride' -> 'bike', 'Run' -> 'run', 'Swim' -> 'swim'
            let mappedType;
            if (typeStr === "swim") {
              // Mapped to swim
              mappedType = "swim";
            } else if (
              typeStr === "bike" ||
              typeStr === "ride" ||
              typeStr === "virtualride" ||
              typeStr === "ebikeride" ||
              typeStr === "mountainbikeride"
            ) {
              // Mapped to bike
              mappedType = "bike";
            } else if (typeStr === "run" || typeStr === "virtualrun") {
              // Mapped to run
              mappedType = "run";
            } else {
              // For any other activity types not supported in our schema, skip them
              // Unmapped Strava activity type - skipping
              return null;
            }

            return {
              strava_activity_id: activity.id?.toString(),
              date: activity.date, // Server already provides the correct date field
              type: mappedType,
              distance: activity.distance || null, // meters
              moving_time: activity.moving_time || null, // seconds
              name: activity.name || null, // activity title
              // Enhanced performance fields
              average_speed: activity.average_speed || null, // m/s
              total_elevation_gain: activity.total_elevation_gain || null, // meters
              average_heartrate: activity.average_heartrate || null, // bpm
              max_heartrate: activity.max_heartrate || null, // bpm
              average_watts: activity.average_watts || null, // watts (cycling)
              trainer: activity.trainer || false, // indoor trainer
              sport_type: activity.sport_type || null, // VirtualRun, TrailRun, etc.
              suffer_score: activity.suffer_score || null, // Strava training stress
              elapsed_time: activity.elapsed_time || null, // total elapsed time
              average_cadence: activity.average_cadence || null, // steps/min or rpm
              start_latlng: activity.start_latlng || null, // [lat, lng] coordinates
              kudos_count: activity.kudos_count || 0, // social engagement
            };
          })
          .filter((activity: any) => activity !== null); // Remove null entries for unsupported types

        await dbHelpers.trainingSessions.bulkUpsert(transformedActivities);

        // Reload the UI data to show new activities
        await loadTrainingData();

        alert(
          `Successfully synced ${transformedActivities.length} Strava activities!`,
        );
      } else {
        alert("No new activities found to sync.");
      }
    } catch (error) {
      console.error("Error syncing Strava:", error);
      alert("Failed to sync Strava activities");
    } finally {
      setIsLoading(false);
    }
  }, [stravaAccessToken]);

  const handleWorkoutClick = useCallback((workout: WorkoutLog) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  }, []);

  const loadTrainingData = useCallback(async () => {
    if (!user) {
      setTrainingEvents([]);
      setTrainingArticles([]);
      setWorkoutLogs([]);
      return;
    }

    try {
      setIsLoading(true);

      // Temporarily disable database calls until tables are created
      // TODO: Re-enable when training_articles and training_events tables exist
      /*
      const [eventsResult, articlesResult] = await Promise.all([
        dbHelpers.trainingEvents.getAll(),
        dbHelpers.trainingArticles.getRecent()
      ]);

      if (!eventsResult.error && eventsResult.data) {
        setTrainingEvents(eventsResult.data);
      }

      if (!articlesResult.error && articlesResult.data) {
        setTrainingArticles(articlesResult.data);
      }
      */

      // Use mock data for now
      setTrainingEvents([]);
      setTrainingArticles([]);

      // Load real training sessions from database with retry logic
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          // Loading sessions attempt (debug log removed)

          const sessionsResult = await dbHelpers.trainingSessions.getAll();

          // Sessions result (debug log removed)

          if (sessionsResult.error) {
            console.error(
              "[TRAINING_TAB] Database error:",
              sessionsResult.error,
            );

            // If it's a table not found error, break the retry loop
            if (
              sessionsResult.error.code === "PGRST106" ||
              sessionsResult.error.message?.includes("does not exist")
            ) {
              console.warn(
                "[TRAINING_TAB] Table does not exist - stopping retries",
              );
              break;
            }

            // Retry for other errors
            if (retryCount < maxRetries - 1) {
              // Retrying in 1 second (debug log removed)
              await new Promise((resolve) => setTimeout(resolve, 1000));
              retryCount++;
              continue;
            }
          }

          if (sessionsResult.data && !sessionsResult.error) {
            // Processing sessions (debug log removed)

            // Transform database sessions to match WorkoutLog interface
            const transformedWorkouts: WorkoutLog[] = sessionsResult.data.map(
              (session: any) => {
                // Transforming session (debug log removed)

                return {
                  id: session.id,
                  date: session.date,
                  discipline: session.type, // swim/bike/run
                  duration_minutes: Math.round((session.moving_time || 0) / 60), // Convert seconds to minutes
                  distance: session.distance
                    ? parseFloat((session.distance * 0.000621371).toFixed(2))
                    : undefined, // Convert meters to miles
                  distance_unit: "miles" as "miles" | "km",
                  intensity: (session.average_heartrate
                    ? getIntensityFromHeartRate(
                        session.average_heartrate,
                        session.max_heartrate,
                      )
                    : "moderate") as "easy" | "moderate" | "hard" | "race_pace",
                  notes:
                    session.name ||
                    `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} workout`, // Use activity name or generic description
                  feeling_rating: 7, // Default since we don't have this from Strava
                  strava_activity_id: session.strava_activity_id,
                  // Enhanced Strava fields
                  average_speed: session.average_speed, // m/s
                  total_elevation_gain: session.total_elevation_gain, // meters
                  average_heartrate: session.average_heartrate, // bpm
                  max_heartrate: session.max_heartrate, // bpm
                  average_watts: session.average_watts, // watts (cycling)
                  trainer: session.trainer || false, // indoor trainer
                  sport_type: session.sport_type, // VirtualRun, TrailRun, etc.
                  suffer_score: session.suffer_score, // Strava training stress
                  elapsed_time: session.elapsed_time, // total elapsed time
                  average_cadence: session.average_cadence, // steps/min or rpm
                  start_latlng: session.start_latlng, // coordinates
                  kudos_count: session.kudos_count || 0, // social engagement
                };
              },
            );

            // Transformed workouts (debug log removed)

            setWorkoutLogs(transformedWorkouts);
            break; // Success, exit retry loop
          } else {
            // No training sessions found or error (debug log removed)
            setWorkoutLogs([]); // Empty array if no data
            break; // No point in retrying for empty data
          }
        } catch (error) {
          console.error(
            "[TRAINING_TAB] Error loading training sessions (attempt",
            retryCount + 1,
            "):",
            error,
          );

          if (retryCount < maxRetries - 1) {
            // Retrying in 1 second (debug log removed)
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            console.error("[TRAINING_TAB] All retry attempts failed");
            setWorkoutLogs([]); // Empty array on error
          }

          retryCount++;
        }
      }
    } catch (error) {
      console.error("Error loading training data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleDeleteActivity = useCallback(
    async (workoutId: string, stravaActivityId?: string) => {
      if (!confirm("Are you sure you want to delete this activity?")) {
        return;
      }

      try {
        // Delete from database using session ID
        const result = await dbHelpers.trainingSessions.delete(workoutId);

        if (result.error) {
          console.error("Error deleting activity:", result.error);
          alert("Failed to delete activity");
          return;
        }

        // Store deleted Strava activity ID to prevent re-downloading
        if (stravaActivityId) {
          const deletedActivities = JSON.parse(
            localStorage.getItem("deletedStravaActivities") || "[]",
          );
          if (!deletedActivities.includes(stravaActivityId)) {
            deletedActivities.push(stravaActivityId);
            localStorage.setItem(
              "deletedStravaActivities",
              JSON.stringify(deletedActivities),
            );
          }
        }

        // Reload training data to refresh the UI
        await loadTrainingData();

        alert("Activity deleted successfully");
      } catch (error) {
        console.error("Error deleting activity:", error);
        alert("Failed to delete activity");
      }
    },
    [loadTrainingData],
  );

  // Main data loading effect - moved after function declarations to fix initialization order
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadData = async () => {
      if (!isMounted) return;

      try {
        await Promise.all([loadTrainingData(), loadStravaData()]);
      } catch (error) {
        if (!abortController.signal.aborted && isMounted) {
          console.error("[TRAINING] Error loading data:", error);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [loadTrainingData, loadStravaData]); // Include stable function dependencies

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Training Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TbSwimming className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">
                This Week
              </p>
              <p className="text-sm text-blue-300">Swimming</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stravaConnected
              ? `${(weeklyStats.swim.distance / 1609.34).toFixed(1)} miles`
              : "3.2 miles"}
          </div>
          <p className="text-xs text-white/50">
            {stravaConnected
              ? `${weeklyStats.swim.sessions} sessions`
              : "4 sessions"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <TbBike className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">
                This Week
              </p>
              <p className="text-sm text-orange-300">Cycling</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stravaConnected
              ? `${(weeklyStats.bike.distance / 1609.34).toFixed(0)} miles`
              : "85 miles"}
          </div>
          <p className="text-xs text-white/50">
            {stravaConnected
              ? `${weeklyStats.bike.sessions} sessions`
              : "3 sessions"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TbRun className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">
                This Week
              </p>
              <p className="text-sm text-green-300">Running</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stravaConnected
              ? `${(weeklyStats.run.distance / 1609.34).toFixed(0)} miles`
              : "22 miles"}
          </div>
          <p className="text-xs text-white/50">
            {stravaConnected
              ? `${weeklyStats.run.sessions} sessions`
              : "5 sessions"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TbBolt className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">
                Training
              </p>
              <p className="text-sm text-purple-300">Load</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">485</div>
          <p className="text-xs text-green-300">Optimal range</p>
        </div>
      </div>

      {/* Strava Connection Status */}
      {!stravaConnected && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl border border-orange-400/20 p-4 md:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                Connect Strava
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                Import your training activities automatically from Strava to get
                real-time stats and progress tracking.
              </p>
            </div>
            <button
              onClick={handleStravaConnect}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base flex-shrink-0"
            >
              <span>🔗</span>
              Connect Strava
            </button>
          </div>
        </div>
      )}

      {/* Strava Sync Button */}
      {stravaConnected && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-green-400/20 p-4 md:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                Strava Connected ✅
              </h3>
              <p className="text-white/70 text-sm">
                Your training data is synced from Strava. Click refresh to get
                the latest activities.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleStravaSync}
                disabled={!stravaAccessToken || isLoading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? "Syncing..." : "Refresh"}
              </button>
              <button
                onClick={handleStravaDisconnect}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm border border-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Workouts</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                showFilters
                  ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <span>🔍</span>
              Filters
              {(activityFilter !== "all" || dateFilter !== "all") && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {(activityFilter !== "all" ? 1 : 0) +
                    (dateFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("workouts")}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Log New Workout →
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6 transition-all duration-300">
            <div className="space-y-4">
              {/* Activity Type Filter */}
              <div>
                <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                  <TbRun className="w-5 h-5" />
                  Activity Type
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      value: "all",
                      label: "All Activities",
                      icon: "🔄",
                      color: "bg-white/10",
                    },
                    {
                      value: "swim",
                      label: "Swimming",
                      icon: "TbSwimming",
                      color: "bg-blue-500/20 border-blue-400/30 text-blue-400",
                    },
                    {
                      value: "bike",
                      label: "Cycling",
                      icon: "TbBike",
                      color:
                        "bg-orange-500/20 border-orange-400/30 text-orange-400",
                    },
                    {
                      value: "run",
                      label: "Running",
                      icon: "TbRun",
                      color:
                        "bg-green-500/20 border-green-400/30 text-green-400",
                    },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setActivityFilter(type.value as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                        activityFilter === type.value
                          ? type.color
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {renderIcon(type.icon, "w-4 h-4")}
                      <span className="hidden sm:inline">{type.label}</span>
                      <span className="sm:hidden">
                        {type.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                  <span>📅</span>
                  Time Period
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Time", icon: "TbStar" },
                    { value: "week", label: "Past Week", icon: "📅" },
                    { value: "month", label: "Past Month", icon: "TbCalendar" },
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setDateFilter(period.value as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                        dateFilter === period.value
                          ? "bg-purple-500/20 border-purple-400/30 text-purple-400"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {renderIcon(period.icon, "w-4 h-4")}
                      <span className="hidden sm:inline">{period.label}</span>
                      <span className="sm:hidden">
                        {
                          period.label.split(" ")[
                            period.label.split(" ").length - 1
                          ]
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="text-sm text-white/60">
                  {(() => {
                    const filteredWorkouts = getFilteredWorkouts(
                      workoutLogs,
                      activityFilter,
                      dateFilter,
                    );
                    return `Showing ${filteredWorkouts.length} of ${workoutLogs.length} workouts`;
                  })()}
                </div>
                {(activityFilter !== "all" || dateFilter !== "all") && (
                  <button
                    onClick={() => {
                      setActivityFilter("all");
                      setDateFilter("all");
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1"
                  >
                    <span>🧹</span>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {getFilteredWorkouts(workoutLogs, activityFilter, dateFilter)
            .slice(0, workoutsDisplayCount)
            .map((workout) => {
              const performanceScore = calculatePerformanceScore(workout);
              const performanceColor = getPerformanceColor(performanceScore);

              return (
                <div
                  key={workout.id}
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-white/10"
                  onClick={() => handleWorkoutClick(workout)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Activity info */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          workout.discipline === "swim"
                            ? "bg-blue-500/20"
                            : workout.discipline === "bike"
                              ? "bg-orange-500/20"
                              : workout.discipline === "run"
                                ? "bg-green-500/20"
                                : "bg-purple-500/20"
                        }`}
                      >
                        <span className="text-lg">
                          {workout.discipline === "swim" ? (
                            <TbSwimming className="w-4 h-4 text-blue-400" />
                          ) : workout.discipline === "bike" ? (
                            <TbBike className="w-4 h-4 text-orange-400" />
                          ) : workout.discipline === "run" ? (
                            <TbRun className="w-4 h-4 text-green-400" />
                          ) : (
                            <TbFlame className="w-4 h-4 text-purple-400" />
                          )}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Activity name and performance score */}
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-semibold truncate">
                            {workout.notes &&
                            workout.notes !==
                              `${workout.discipline.charAt(0).toUpperCase() + workout.discipline.slice(1)} workout`
                              ? workout.notes
                              : `${workout.discipline.charAt(0).toUpperCase() + workout.discipline.slice(1)} Workout`}
                          </h4>
                          <div
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${performanceColor} bg-white/10 flex-shrink-0`}
                          >
                            {performanceScore}
                          </div>
                          {workout.trainer && (
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 flex-shrink-0">
                              🏠 Indoor
                            </span>
                          )}
                        </div>

                        {/* Date and key metrics */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-white/70 mb-2">
                          <span className="whitespace-nowrap">
                            📅 {new Date(workout.date).toLocaleDateString()}
                          </span>
                          <span className="whitespace-nowrap font-mono">
                            {Math.round(workout.duration_minutes || 0)}min
                          </span>
                          {workout.distance && (
                            <span className="whitespace-nowrap">
                              📏 {workout.distance.toFixed(1)}{" "}
                              {workout.distance_unit}
                            </span>
                          )}
                          {workout.average_speed && (
                            <span className="whitespace-nowrap flex items-center gap-1">
                              <TbBolt className="w-3 h-3" />{" "}
                              {formatPaceForCard(
                                workout.average_speed,
                                workout.discipline,
                              )}
                            </span>
                          )}
                          {workout.average_heartrate && (
                            <span className="whitespace-nowrap flex items-center gap-1">
                              <TbHeart className="w-3 h-3" />{" "}
                              {Math.round(workout.average_heartrate)} bpm
                            </span>
                          )}
                          {workout.average_watts && (
                            <span className="whitespace-nowrap">
                              🔋 {Math.round(workout.average_watts)}W
                            </span>
                          )}
                        </div>

                        {/* Training insights */}
                        {workout.average_heartrate && (
                          <div className="text-xs text-white/60">
                            Zone:{" "}
                            {getHeartRateZone(
                              workout.average_heartrate,
                              workout.max_heartrate,
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Quick actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {workout.strava_activity_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteActivity(
                              workout.id,
                              workout.strava_activity_id,
                            );
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1"
                          title="Delete this activity"
                        >
                          <TbTrash className="w-4 h-4" />
                        </button>
                      )}
                      <div className="text-white/40 text-xs">→</div>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Load More Button */}
          {(() => {
            const filteredWorkouts = getFilteredWorkouts(
              workoutLogs,
              activityFilter,
              dateFilter,
            );
            return (
              filteredWorkouts.length > workoutsDisplayCount && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setIsLoadingMore(true);
                      setTimeout(() => {
                        setWorkoutsDisplayCount((prev) =>
                          Math.min(prev + 10, filteredWorkouts.length),
                        );
                        setIsLoadingMore(false);
                      }, 300);
                    }}
                    disabled={isLoadingMore}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <span>📂</span>
                        Load More (
                        {filteredWorkouts.length - workoutsDisplayCount}{" "}
                        remaining)
                      </>
                    )}
                  </button>
                </div>
              )
            );
          })()}

          {(() => {
            const filteredWorkouts = getFilteredWorkouts(
              workoutLogs,
              activityFilter,
              dateFilter,
            );
            if (workoutLogs.length === 0) {
              return (
                <div className="text-center py-8 text-white/60">
                  <p>No workouts logged yet.</p>
                  <p className="text-sm mt-2">
                    {stravaConnected
                      ? "Try syncing your Strava activities."
                      : "Connect Strava or log a workout manually."}
                  </p>
                </div>
              );
            } else if (filteredWorkouts.length === 0) {
              return (
                <div className="text-center py-8 text-white/60">
                  <p>No workouts match your current filters.</p>
                  <p className="text-sm mt-2">
                    Try adjusting your filter settings or clearing them to see
                    more results.
                  </p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Upcoming Training Events */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            Upcoming Training Events
          </h3>
          <button
            onClick={() => setActiveTab("events")}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {trainingEvents.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-semibold">{event.title}</h4>
                  <p className="text-white/70 text-sm mt-1">
                    {event.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <TbCalendar className="w-3 h-3" />{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1">
                        <TbClock className="w-3 h-3" /> {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <TbMapPin className="w-3 h-3" /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                    event.event_type === "clinic"
                      ? "bg-blue-500/20 text-blue-400"
                      : event.event_type === "workshop"
                        ? "bg-green-500/20 text-green-400"
                        : event.event_type === "group_training"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  {event.event_type.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWorkoutLogger = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Would save to database here
      const workout: WorkoutLog = {
        id: Date.now().toString(),
        ...newWorkout,
        duration_minutes: parseInt(newWorkout.duration_minutes),
        distance: newWorkout.distance
          ? parseFloat(newWorkout.distance)
          : undefined,
      };
      setWorkoutLogs([workout, ...workoutLogs]);
      // Reset form
      setNewWorkout({
        date: new Date().toISOString().split("T")[0],
        discipline: "run",
        duration_minutes: "",
        distance: "",
        distance_unit: "miles",
        intensity: "moderate",
        notes: "",
        feeling_rating: 7,
      });
      alert("Workout logged successfully!");
    };

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Log New Workout</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newWorkout.date}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Discipline
                </label>
                <select
                  value={newWorkout.discipline}
                  onChange={(e) =>
                    setNewWorkout({
                      ...newWorkout,
                      discipline: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="swim" className="bg-slate-800">
                    Swimming
                  </option>
                  <option value="bike" className="bg-slate-800">
                    Cycling
                  </option>
                  <option value="run" className="bg-slate-800">
                    Running
                  </option>
                  <option value="brick" className="bg-slate-800">
                    Brick Workout
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newWorkout.duration_minutes}
                  onChange={(e) =>
                    setNewWorkout({
                      ...newWorkout,
                      duration_minutes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  placeholder="45"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Distance (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWorkout.distance}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, distance: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                  placeholder="5.0"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Distance Unit
                </label>
                <select
                  value={newWorkout.distance_unit}
                  onChange={(e) =>
                    setNewWorkout({
                      ...newWorkout,
                      distance_unit: e.target.value as "miles" | "km",
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="miles" className="bg-slate-800">
                    Miles
                  </option>
                  <option value="km" className="bg-slate-800">
                    Kilometers
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Intensity
                </label>
                <select
                  value={newWorkout.intensity}
                  onChange={(e) =>
                    setNewWorkout({
                      ...newWorkout,
                      intensity: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="easy" className="bg-slate-800">
                    Easy
                  </option>
                  <option value="moderate" className="bg-slate-800">
                    Moderate
                  </option>
                  <option value="hard" className="bg-slate-800">
                    Hard
                  </option>
                  <option value="race_pace" className="bg-slate-800">
                    Race Pace
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1">
                  Feeling Rating (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newWorkout.feeling_rating}
                  onChange={(e) =>
                    setNewWorkout({
                      ...newWorkout,
                      feeling_rating: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>1 (Terrible)</span>
                  <span className="text-white font-medium">
                    {newWorkout.feeling_rating}
                  </span>
                  <span>10 (Amazing)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1">
                Notes
              </label>
              <textarea
                value={newWorkout.notes}
                onChange={(e) =>
                  setNewWorkout({ ...newWorkout, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none h-20 resize-none"
                placeholder="How did the workout feel? Any specific intervals or goals?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Log Workout
            </button>
          </form>
        </div>

        {/* Recent Workouts History */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Workout History</h3>
          <div className="space-y-2">
            {workoutLogs.map((workout) => (
              <div
                key={workout.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => handleWorkoutClick(workout)}
              >
                <div className="flex items-center gap-3">
                  {/* Sport Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      workout.discipline === "swim"
                        ? "bg-blue-500/20"
                        : workout.discipline === "bike"
                          ? "bg-orange-500/20"
                          : workout.discipline === "run"
                            ? "bg-green-500/20"
                            : "bg-purple-500/20"
                    }`}
                  >
                    {workout.discipline === "swim" ? (
                      <TbSwimming className={`w-4 h-4 text-blue-400`} />
                    ) : workout.discipline === "bike" ? (
                      <TbBike className={`w-4 h-4 text-orange-400`} />
                    ) : workout.discipline === "run" ? (
                      <TbRun className={`w-4 h-4 text-green-400`} />
                    ) : (
                      <TbFlame className="w-4 h-4 text-purple-400" />
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium text-sm leading-tight">
                        {workout.notes ||
                          `${workout.discipline.charAt(0).toUpperCase() + workout.discipline.slice(1)} Workout`}
                      </h4>
                      <span className="text-xs text-white/50 whitespace-nowrap ml-2">
                        {new Date(workout.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <span>{workout.duration_minutes}min</span>
                      {workout.distance && (
                        <span>
                          {workout.distance} {workout.distance_unit}
                        </span>
                      )}

                      {/* Key metrics */}
                      {workout.average_heartrate && (
                        <span>{Math.round(workout.average_heartrate)} bpm</span>
                      )}
                      {workout.average_speed && (
                        <span>
                          {calculatePace(
                            workout.average_speed,
                            workout.discipline,
                          )}
                        </span>
                      )}

                      {/* Intensity badge */}
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                          workout.intensity === "easy"
                            ? "bg-green-500/20 text-green-400"
                            : workout.intensity === "moderate"
                              ? "bg-blue-500/20 text-blue-400"
                              : workout.intensity === "hard"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {workout.intensity.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show More Button */}
        {filteredWorkouts.length > workoutsDisplayCount && (
          <div className="text-center">
            <button
              onClick={() => setWorkoutsDisplayCount((prev) => prev + 10)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-blue-400/20 hover:border-blue-400/40"
            >
              Show More Workouts (
              {filteredWorkouts.length - workoutsDisplayCount} remaining)
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTrainingEvents = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">
          Upcoming Training Events
        </h3>
        <div className="space-y-4">
          {trainingEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-white font-semibold text-lg">
                      {event.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                        event.event_type === "clinic"
                          ? "bg-blue-500/20 text-blue-400"
                          : event.event_type === "workshop"
                            ? "bg-green-500/20 text-green-400"
                            : event.event_type === "group_training"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {event.event_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-white/70 mb-3">{event.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-white/60">
                    <span className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </span>
                    {event.time && (
                      <span className="flex items-center space-x-1">
                        <TbClock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </span>
                    )}
                    {event.duration_minutes && (
                      <span className="flex items-center space-x-1">
                        <TbClock className="w-4 h-4" />
                        <span>{event.duration_minutes} min</span>
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center space-x-1">
                        <TbMapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
                {event.registration_url && (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm"
                  >
                    Register
                  </a>
                )}
              </div>
            </div>
          ))}
          {trainingEvents.length === 0 && (
            <div className="text-center py-8 text-white/60">
              <p>No upcoming training events found.</p>
              <p className="text-sm mt-2">
                Check back later for new training opportunities!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTrainingArticles = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">
          Latest Training Tips & Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingArticles.map((article) => (
            <div
              key={article.id}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-start space-x-3">
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                        article.category === "technique"
                          ? "bg-blue-500/20 text-blue-400"
                          : article.category === "nutrition"
                            ? "bg-green-500/20 text-green-400"
                            : article.category === "training"
                              ? "bg-orange-500/20 text-orange-400"
                              : article.category === "mental"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {article.category}
                    </span>
                    {article.reading_time_minutes && (
                      <span className="text-xs text-white/60">
                        {article.reading_time_minutes} min read
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-white/70 text-xs mb-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">
                      {article.author && <span>By {article.author}</span>}
                      {article.published_at && (
                        <span className="ml-2">
                          {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                      >
                        Read More →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {trainingArticles.length === 0 && (
            <div className="col-span-2 text-center py-8 text-white/60">
              <p>No training articles available.</p>
              <p className="text-sm mt-2">
                Check back later for new training tips!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Calculate training analytics from workout data
  function calculateTrainingAnalytics(workouts: WorkoutLog[]) {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    // Get the start of the current week (Monday)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday should be 6 days back
    const startOfThisWeek = new Date(
      now.getTime() - mondayOffset * 24 * 60 * 60 * 1000,
    );
    startOfThisWeek.setHours(0, 0, 0, 0);

    // Get the start of last week (7 days before start of this week)
    const pastWeek = new Date(
      startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    // Filter workouts by time periods
    const currentMonthWorkouts = workouts.filter((w) => {
      const date = new Date(w.date);
      return date >= currentMonth && date <= currentMonthEnd;
    });

    const previousMonthWorkouts = workouts.filter((w) => {
      const date = new Date(w.date);
      return date >= previousMonth && date <= previousMonthEnd;
    });

    const pastWeekWorkouts = workouts.filter((w) => {
      const date = new Date(w.date);
      return date >= pastWeek;
    });

    // Calculate monthly volume by week (last 4 weeks)
    const monthlyVolume = Array(4)
      .fill(0)
      .map((_, weekIndex) => {
        // Calculate the start of each week (going backwards from most recent week)
        const weekStart = new Date(
          startOfThisWeek.getTime() - weekIndex * 7 * 24 * 60 * 60 * 1000,
        );
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

        const weekWorkouts = workouts.filter((w) => {
          const workoutDate = new Date(w.date);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });

        const totalMinutes = weekWorkouts.reduce(
          (sum, w) => sum + (w.duration_minutes || 0),
          0,
        );
        const hours = totalMinutes / 60;

        // Determine primary activity type for the week
        const disciplineCounts = weekWorkouts.reduce(
          (acc, w) => {
            acc[w.discipline] =
              (acc[w.discipline] || 0) + (w.duration_minutes || 0);
            return acc;
          },
          {} as Record<string, number>,
        );

        const primaryDiscipline =
          Object.entries(disciplineCounts).sort(
            ([, a], [, b]) => b - a,
          )[0]?.[0] || "run";

        return {
          hours: Math.round(hours * 10) / 10,
          primaryDiscipline,
          workoutCount: weekWorkouts.length,
        };
      })
      .reverse(); // Reverse to show oldest to newest

    // Calculate training distribution
    const totalDuration = currentMonthWorkouts.reduce(
      (sum, w) => sum + (w.duration_minutes || 0),
      0,
    );
    const swimDuration = currentMonthWorkouts
      .filter((w) => w.discipline === "swim")
      .reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const bikeDuration = currentMonthWorkouts
      .filter((w) => w.discipline === "bike")
      .reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const runDuration = currentMonthWorkouts
      .filter((w) => w.discipline === "run")
      .reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const brickDuration = currentMonthWorkouts
      .filter((w) => w.discipline === "brick")
      .reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

    const distribution =
      totalDuration > 0
        ? {
            swimming: Math.round((swimDuration / totalDuration) * 100),
            cycling: Math.round(
              ((bikeDuration + brickDuration * 0.5) / totalDuration) * 100,
            ),
            running: Math.round(
              ((runDuration + brickDuration * 0.5) / totalDuration) * 100,
            ),
          }
        : { swimming: 0, cycling: 0, running: 0 };

    // Calculate heart rate zones
    const workoutsWithHR = currentMonthWorkouts.filter(
      (w) => w.average_heartrate,
    );
    const totalHRTime = workoutsWithHR.reduce(
      (sum, w) => sum + (w.duration_minutes || 0),
      0,
    );

    let zoneDistribution = { zone1: 0, zone2: 0, zone3: 0, zone45: 0 };

    if (totalHRTime > 0) {
      workoutsWithHR.forEach((workout) => {
        const avgHR = workout.average_heartrate!;
        const maxHR = workout.max_heartrate || 190;
        const percentage = (avgHR / maxHR) * 100;
        const duration = workout.duration_minutes || 0;

        if (percentage < 60) {
          zoneDistribution.zone1 += duration;
        } else if (percentage < 70) {
          zoneDistribution.zone2 += duration;
        } else if (percentage < 80) {
          zoneDistribution.zone3 += duration;
        } else {
          zoneDistribution.zone45 += duration;
        }
      });

      // Convert to percentages
      zoneDistribution = {
        zone1: Math.round((zoneDistribution.zone1 / totalHRTime) * 100),
        zone2: Math.round((zoneDistribution.zone2 / totalHRTime) * 100),
        zone3: Math.round((zoneDistribution.zone3 / totalHRTime) * 100),
        zone45: Math.round((zoneDistribution.zone45 / totalHRTime) * 100),
      };
    }

    // Calculate monthly comparisons
    const currentMonthStats = {
      totalWorkouts: currentMonthWorkouts.length,
      totalHours:
        Math.round(
          (currentMonthWorkouts.reduce(
            (sum, w) => sum + (w.duration_minutes || 0),
            0,
          ) /
            60) *
            10,
        ) / 10,
      avgPerformance:
        currentMonthWorkouts.length > 0
          ? Math.round(
              (currentMonthWorkouts.reduce(
                (sum, w) => sum + calculatePerformanceScore(w),
                0,
              ) /
                currentMonthWorkouts.length) *
                10,
            ) / 10
          : 0,
      totalDistance: {
        swim:
          Math.round(
            currentMonthWorkouts
              .filter((w) => w.discipline === "swim")
              .reduce((sum, w) => sum + (w.distance || 0), 0) * 10,
          ) / 10,
        bike:
          Math.round(
            currentMonthWorkouts
              .filter((w) => w.discipline === "bike")
              .reduce((sum, w) => sum + (w.distance || 0), 0) * 10,
          ) / 10,
        run:
          Math.round(
            currentMonthWorkouts
              .filter((w) => w.discipline === "run")
              .reduce((sum, w) => sum + (w.distance || 0), 0) * 10,
          ) / 10,
      },
    };

    const previousMonthStats = {
      totalWorkouts: previousMonthWorkouts.length,
      totalHours:
        Math.round(
          (previousMonthWorkouts.reduce(
            (sum, w) => sum + (w.duration_minutes || 0),
            0,
          ) /
            60) *
            10,
        ) / 10,
      avgPerformance:
        previousMonthWorkouts.length > 0
          ? Math.round(
              (previousMonthWorkouts.reduce(
                (sum, w) => sum + calculatePerformanceScore(w),
                0,
              ) /
                previousMonthWorkouts.length) *
                10,
            ) / 10
          : 0,
      totalDistance: {
        swim:
          Math.round(
            previousMonthWorkouts
              .filter((w) => w.discipline === "swim")
              .reduce((sum, w) => sum + (w.distance || 0), 0) * 10,
          ) / 10,
        bike:
          Math.round(
            previousMonthWorkouts
              .filter((w) => w.discipline === "bike")
              .reduce((sum, w) => sum + (w.distance || 0), 0) * 10,
          ) / 10,
        run:
          Math.round(
            previousMonthWorkouts
              .filter((w) => w.discipline === "run")
              .reduce((sum, w) => sum + (w.distance || 0), 0) * 10,
          ) / 10,
      },
    };

    // Calculate additional metrics
    const daysInCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const daysWithWorkouts = new Set(
      currentMonthWorkouts.map((w) => new Date(w.date).toDateString()),
    ).size;
    const consistencyScore = Math.round(
      (daysWithWorkouts / daysInCurrentMonth) * 100,
    );

    // Most active time analysis (only for workouts with start_time)
    const workoutsWithTime = currentMonthWorkouts.filter((w) => w.start_time);
    const hourCounts = workoutsWithTime.reduce(
      (acc, w) => {
        // Parse the start_time in local timezone
        const startDate = new Date(w.start_time!);
        const hour = startDate.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const mostActiveHour = Object.entries(hourCounts).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];

    return {
      monthlyVolume,
      distribution,
      zoneDistribution,
      currentMonthStats,
      previousMonthStats,
      consistencyScore,
      mostActiveHour: mostActiveHour ? parseInt(mostActiveHour) : null,
      totalWeeklyHours:
        Math.round(
          (pastWeekWorkouts.reduce(
            (sum, w) => sum + (w.duration_minutes || 0),
            0,
          ) /
            60) *
            10,
        ) / 10,
    };
  }

  // Get month-over-month comparisons
  function getMonthlyComparison(
    current: number,
    previous: number,
  ): { change: number; isPositive: boolean; text: string } {
    if (previous === 0) {
      return {
        change: current > 0 ? 100 : 0,
        isPositive: current > 0,
        text: current > 0 ? `+${current} this month` : "No change",
      };
    }

    const change = Math.round(((current - previous) / previous) * 100);
    const isPositive = change >= 0;

    return {
      change: Math.abs(change),
      isPositive,
      text: `${isPositive ? "+" : "-"}${Math.abs(change)}% vs last month`,
    };
  }

  const renderAnalytics = () => {
    const analytics = calculateTrainingAnalytics(workoutLogs);

    return (
      <div className="space-y-6">
        {/* Weekly Training Volume */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">
            Monthly Training Volume
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {analytics.monthlyVolume.map((weekData, index) => {
              const maxHours = Math.max(
                ...analytics.monthlyVolume.map((d) => d.hours),
                1,
              );
              // Ensure bars with data show meaningful height - minimum 60% for visibility
              const heightPercentage =
                weekData.hours > 0
                  ? Math.max((weekData.hours / maxHours) * 100, 60)
                  : 0;

              const getColorForDiscipline = (discipline: string) => {
                switch (discipline) {
                  case "swim":
                    return "border-blue-400";
                  case "bike":
                    return "border-orange-400";
                  case "run":
                    return "border-green-400";
                  case "brick":
                    return "border-purple-400";
                  default:
                    return "border-gray-400";
                }
              };

              const getColorForHeight = (discipline: string) => {
                switch (discipline) {
                  case "swim":
                    return "bg-blue-400";
                  case "bike":
                    return "bg-orange-400";
                  case "run":
                    return "bg-green-400";
                  case "brick":
                    return "bg-purple-400";
                  default:
                    return "bg-gray-400";
                }
              };

              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-white/60 mb-2">
                    Week {4 - index}
                  </div>
                  <div
                    className={`h-20 rounded-lg flex flex-col justify-end relative border overflow-hidden ${
                      weekData.hours > 0
                        ? getColorForDiscipline(weekData.primaryDiscipline)
                        : "bg-white/5 border-white/10"
                    }`}
                    style={{ minHeight: "80px" }}
                  >
                    {weekData.hours > 0 && (
                      <div
                        className={`w-full rounded-b-lg flex items-end justify-center flex-1 ${getColorForHeight(weekData.primaryDiscipline)}`}
                      >
                        <div className="text-xs text-white/90 mb-1 px-2 py-1 rounded bg-black/20 backdrop-blur-sm shadow-lg">
                          {weekData.hours}h
                        </div>
                      </div>
                    )}
                    {weekData.hours === 0 && (
                      <div className="text-xs text-white/90 mb-1 px-2 py-1 rounded bg-black/20 backdrop-blur-sm shadow-lg"></div>
                    )}
                    {weekData.workoutCount > 1 && (
                      <div className="absolute top-1 right-1 text-xs text-white/60 bg-white/20 rounded-full w-4 h-4 flex items-center justify-center">
                        {weekData.workoutCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              Total this month:{" "}
              {analytics.monthlyVolume
                .reduce((sum, week) => sum + week.hours, 0)
                .toFixed(1)}
              h
            </span>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-white/60">Swim</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-white/60">Bike</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-white/60">Run</span>
              </div>
            </div>
          </div>
        </div>

        {/* Training Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Training Distribution (This Month)
            </h3>
            <div className="space-y-3">
              {[
                {
                  discipline: "Swimming",
                  percentage: analytics.distribution.swimming,
                  color: "bg-blue-500",
                },
                {
                  discipline: "Cycling",
                  percentage: analytics.distribution.cycling,
                  color: "bg-orange-500",
                },
                {
                  discipline: "Running",
                  percentage: analytics.distribution.running,
                  color: "bg-green-500",
                },
              ].map((item) => (
                <div key={item.discipline}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">{item.discipline}</span>
                    <span className="text-white font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            {analytics.currentMonthStats.totalHours === 0 && (
              <div className="text-center py-4 text-white/60">
                <p className="text-sm">No workouts this month yet</p>
                <p className="text-xs">
                  Start training to see your distribution!
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Heart Rate Zones (This Month)
            </h3>
            <div className="space-y-3">
              {[
                {
                  zone: "Zone 1 (Recovery)",
                  percentage: analytics.zoneDistribution.zone1,
                  color: "bg-blue-500",
                },
                {
                  zone: "Zone 2 (Aerobic)",
                  percentage: analytics.zoneDistribution.zone2,
                  color: "bg-green-500",
                },
                {
                  zone: "Zone 3 (Tempo)",
                  percentage: analytics.zoneDistribution.zone3,
                  color: "bg-yellow-500",
                },
                {
                  zone: "Zone 4-5 (Threshold+)",
                  percentage: analytics.zoneDistribution.zone45,
                  color: "bg-red-500",
                },
              ].map((item) => (
                <div key={item.zone}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">{item.zone}</span>
                    <span className="text-white font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            {Object.values(analytics.zoneDistribution).every(
              (v) => v === 0,
            ) && (
              <div className="text-center py-4 text-white/60">
                <p className="text-sm">No heart rate data available</p>
                <p className="text-xs">
                  Connect a heart rate monitor to see zone analysis!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Progress - Current vs Previous Month */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">
            Monthly Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {analytics.currentMonthStats.totalWorkouts}
              </div>
              <div className="text-white/70">Total Workouts</div>
              <div
                className={`text-sm ${getMonthlyComparison(analytics.currentMonthStats.totalWorkouts, analytics.previousMonthStats.totalWorkouts).isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {
                  getMonthlyComparison(
                    analytics.currentMonthStats.totalWorkouts,
                    analytics.previousMonthStats.totalWorkouts,
                  ).text
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {analytics.currentMonthStats.totalHours}h
              </div>
              <div className="text-white/70">Training Time</div>
              <div
                className={`text-sm ${getMonthlyComparison(analytics.currentMonthStats.totalHours, analytics.previousMonthStats.totalHours).isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {
                  getMonthlyComparison(
                    analytics.currentMonthStats.totalHours,
                    analytics.previousMonthStats.totalHours,
                  ).text
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {analytics.currentMonthStats.avgPerformance}
              </div>
              <div className="text-white/70">Avg. Performance</div>
              <div
                className={`text-sm ${getMonthlyComparison(analytics.currentMonthStats.avgPerformance, analytics.previousMonthStats.avgPerformance).isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {
                  getMonthlyComparison(
                    analytics.currentMonthStats.avgPerformance,
                    analytics.previousMonthStats.avgPerformance,
                  ).text
                }
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Monthly Analytics - Distance Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">
            Distance Analysis (This Month vs Last Month)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-400/20">
              <div className="flex items-center gap-2 mb-3">
                <TbSwimming className="text-blue-400 w-5 h-5" />
                <span className="text-blue-400 font-medium">Swimming</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {analytics.currentMonthStats.totalDistance.swim} mi
              </div>
              <div className="text-sm text-white/60 mb-2">
                vs {analytics.previousMonthStats.totalDistance.swim} mi last
                month
              </div>
              <div
                className={`text-sm ${getMonthlyComparison(analytics.currentMonthStats.totalDistance.swim, analytics.previousMonthStats.totalDistance.swim).isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {
                  getMonthlyComparison(
                    analytics.currentMonthStats.totalDistance.swim,
                    analytics.previousMonthStats.totalDistance.swim,
                  ).text
                }
              </div>
            </div>

            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-400/20">
              <div className="flex items-center gap-2 mb-3">
                <TbBike className="text-orange-400 w-5 h-5" />
                <span className="text-orange-400 font-medium">Cycling</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {analytics.currentMonthStats.totalDistance.bike} mi
              </div>
              <div className="text-sm text-white/60 mb-2">
                vs {analytics.previousMonthStats.totalDistance.bike} mi last
                month
              </div>
              <div
                className={`text-sm ${getMonthlyComparison(analytics.currentMonthStats.totalDistance.bike, analytics.previousMonthStats.totalDistance.bike).isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {
                  getMonthlyComparison(
                    analytics.currentMonthStats.totalDistance.bike,
                    analytics.previousMonthStats.totalDistance.bike,
                  ).text
                }
              </div>
            </div>

            <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/20">
              <div className="flex items-center gap-2 mb-3">
                <TbRun className="text-green-400 w-5 h-5" />
                <span className="text-green-400 font-medium">Running</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {analytics.currentMonthStats.totalDistance.run} mi
              </div>
              <div className="text-sm text-white/60 mb-2">
                vs {analytics.previousMonthStats.totalDistance.run} mi last
                month
              </div>
              <div
                className={`text-sm ${getMonthlyComparison(analytics.currentMonthStats.totalDistance.run, analytics.previousMonthStats.totalDistance.run).isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {
                  getMonthlyComparison(
                    analytics.currentMonthStats.totalDistance.run,
                    analytics.previousMonthStats.totalDistance.run,
                  ).text
                }
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Consistency Score */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <TbChartBar className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-medium">Consistency</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {analytics.consistencyScore}%
            </div>
            <div className="text-white/70 text-sm">Days trained this month</div>
            <div className="mt-2">
              <div className="bg-white/10 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analytics.consistencyScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Average Workout Quality */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <TbStar className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Quality Score</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {analytics.currentMonthStats.avgPerformance}
            </div>
            <div className="text-white/70 text-sm">Average performance</div>
            <div
              className={`text-xs mt-1 ${analytics.currentMonthStats.avgPerformance >= 70 ? "text-green-400" : analytics.currentMonthStats.avgPerformance >= 50 ? "text-yellow-400" : "text-red-400"}`}
            >
              {analytics.currentMonthStats.avgPerformance >= 70
                ? "Excellent"
                : analytics.currentMonthStats.avgPerformance >= 50
                  ? "Good"
                  : "Needs improvement"}
            </div>
          </div>

          {/* Most Active Time */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <TbClock className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Peak Time</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {analytics.mostActiveHour !== null
                ? analytics.mostActiveHour === 0
                  ? "12:00 AM"
                  : analytics.mostActiveHour < 12
                    ? `${analytics.mostActiveHour}:00 AM`
                    : analytics.mostActiveHour === 12
                      ? "12:00 PM"
                      : `${analytics.mostActiveHour - 12}:00 PM`
                : "--"}
            </div>
            <div className="text-white/70 text-sm">Most active hour</div>
            <div className="text-xs text-white/60 mt-1">
              {analytics.mostActiveHour !== null
                ? `${analytics.mostActiveHour < 12 ? "Morning" : analytics.mostActiveHour < 17 ? "Afternoon" : "Evening"} person`
                : "Connect Strava to see your peak workout time"}
            </div>
          </div>

          {/* Goal Progress Placeholder */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <TbTarget className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Goal Progress</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {Math.min(
                100,
                Math.round((analytics.currentMonthStats.totalHours / 20) * 100),
              )}
              %
            </div>
            <div className="text-white/70 text-sm">Monthly target (20h)</div>
            <div className="mt-2">
              <div className="bg-white/10 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, Math.round((analytics.currentMonthStats.totalHours / 20) * 100))}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (hasError) {
    return (
      <div
        className="bg-slate-900 relative overflow-auto flex items-center justify-center"
        style={{ minHeight: "100dvh" }}
      >
        <div className="text-center">
          <div className="text-white text-lg mb-4">
            Training Tab Temporarily Unavailable
          </div>
          <div className="text-white/70 text-sm mb-4">
            We&apos;re working to resolve this issue. Please try refreshing the
            page.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="bg-slate-900 relative overflow-auto flex items-center justify-center"
        style={{ minHeight: "100dvh" }}
      >
        <div className="text-white text-lg">Loading training data...</div>
      </div>
    );
  }

  return (
    <div
      className="bg-slate-900 relative overflow-auto"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Training</h1>
            <p className="text-lg text-white/70">
              Track workouts, training plans, and progress
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {renderIcon(tab.icon, "w-5 h-5")}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "plans" && (
            <TrainingPlanSelectionScreen
              onSelectPlan={(template) =>
                router.push(`/create-training-plan?templateId=${template.id}`)
              }
            />
          )}
          {activeTab === "workouts" && renderWorkoutLogger()}
          {activeTab === "events" && renderTrainingEvents()}
          {activeTab === "articles" && renderTrainingArticles()}
          {activeTab === "analytics" && renderAnalytics()}
        </div>
      </div>

      {/* Workout Detail Modal */}
      {showWorkoutDetail && selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedWorkout.discipline === "swim"
                      ? "bg-blue-500/20"
                      : selectedWorkout.discipline === "bike"
                        ? "bg-orange-500/20"
                        : selectedWorkout.discipline === "run"
                          ? "bg-green-500/20"
                          : "bg-purple-500/20"
                  }`}
                >
                  <span className="text-lg">
                    {selectedWorkout.discipline === "swim" ? (
                      <TbSwimming className="w-6 h-6" />
                    ) : selectedWorkout.discipline === "bike" ? (
                      <TbBike className="w-6 h-6" />
                    ) : selectedWorkout.discipline === "run" ? (
                      <TbRun className="w-6 h-6" />
                    ) : (
                      <TbBolt className="w-6 h-6" />
                    )}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedWorkout.name ||
                      `${selectedWorkout.discipline.charAt(0).toUpperCase() + selectedWorkout.discipline.slice(1)} Workout`}
                  </h2>
                  <p className="text-white/60 text-sm">
                    {new Date(selectedWorkout.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkoutDetail(false)}
                className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedWorkout.duration_minutes && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white">
                      {selectedWorkout.duration_minutes}
                    </div>
                    <div className="text-white/60 text-sm">Minutes</div>
                  </div>
                )}
                {selectedWorkout.distance && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white">
                      {parseFloat(selectedWorkout.distance).toFixed(1)}
                    </div>
                    <div className="text-white/60 text-sm">
                      {selectedWorkout.distance_unit || "Miles"}
                    </div>
                  </div>
                )}
                {selectedWorkout.feeling_rating && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white">
                      {selectedWorkout.feeling_rating}/10
                    </div>
                    <div className="text-white/60 text-sm">Feeling</div>
                  </div>
                )}
                {selectedWorkout.intensity && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-lg font-bold text-white capitalize">
                      {selectedWorkout.intensity.replace("_", " ")}
                    </div>
                    <div className="text-white/60 text-sm">Intensity</div>
                  </div>
                )}
              </div>

              {/* Strava Performance Metrics */}
              {(selectedWorkout.average_heartrate ||
                selectedWorkout.average_speed ||
                selectedWorkout.average_watts ||
                selectedWorkout.total_elevation_gain) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <TbBolt className="w-4 h-4" /> Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedWorkout.average_heartrate && (
                      <div className="bg-red-500/10 rounded-lg p-3 border border-red-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <TbHeart className="w-4 h-4" />
                          <span className="text-red-400 font-medium">
                            Heart Rate
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {Math.round(selectedWorkout.average_heartrate)} bpm
                        </div>
                        {selectedWorkout.max_heartrate && (
                          <div className="text-white/60 text-sm">
                            Max: {Math.round(selectedWorkout.max_heartrate)} bpm
                          </div>
                        )}
                        {selectedWorkout.average_heartrate && (
                          <div className="text-white/60 text-sm">
                            Zone:{" "}
                            {getHeartRateZone(
                              selectedWorkout.average_heartrate,
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {selectedWorkout.average_speed && (
                      <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span>🚀</span>
                          <span className="text-blue-400 font-medium">
                            Pace
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {calculatePace(
                            selectedWorkout.average_speed,
                            selectedWorkout.discipline,
                          )}
                        </div>
                      </div>
                    )}
                    {selectedWorkout.average_watts && (
                      <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span>🔋</span>
                          <span className="text-yellow-400 font-medium">
                            Power
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {Math.round(selectedWorkout.average_watts)}W
                        </div>
                      </div>
                    )}
                    {selectedWorkout.total_elevation_gain &&
                      selectedWorkout.total_elevation_gain > 0 && (
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-400/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TbMountain className="w-4 h-4" />
                            <span className="text-green-400 font-medium">
                              Elevation
                            </span>
                          </div>
                          <div className="text-xl font-bold text-white">
                            {Math.round(
                              selectedWorkout.total_elevation_gain * 3.28084,
                            )}{" "}
                            ft
                          </div>
                        </div>
                      )}
                    {selectedWorkout.average_cadence && (
                      <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span>🦵</span>
                          <span className="text-purple-400 font-medium">
                            Cadence
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {Math.round(selectedWorkout.average_cadence)}{" "}
                          {selectedWorkout.discipline === "run" ? "spm" : "rpm"}
                        </div>
                      </div>
                    )}
                    {selectedWorkout.suffer_score && (
                      <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <TbTarget className="w-4 h-4" />
                          <span className="text-orange-400 font-medium">
                            Training Stress
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {selectedWorkout.suffer_score} TSS
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="space-y-4">
                {selectedWorkout.trainer && (
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-400/20">
                    <div className="flex items-center gap-2">
                      <span>🏠</span>
                      <span className="text-purple-400 font-medium">
                        Indoor Training
                      </span>
                    </div>
                  </div>
                )}

                {selectedWorkout.sport_type &&
                  selectedWorkout.sport_type !== selectedWorkout.discipline && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-white/60 text-sm mb-1">
                        Sport Type
                      </div>
                      <div className="text-white font-medium">
                        {selectedWorkout.sport_type}
                      </div>
                    </div>
                  )}

                {selectedWorkout.notes && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-white/60 text-sm mb-2">Notes</div>
                    <div className="text-white">{selectedWorkout.notes}</div>
                  </div>
                )}

                {selectedWorkout.kudos_count &&
                  selectedWorkout.kudos_count > 0 && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span>👍</span>
                        <span className="text-white">
                          {selectedWorkout.kudos_count} Kudos
                        </span>
                      </div>
                    </div>
                  )}

                {selectedWorkout.strava_activity_id && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TbChartBar className="w-4 h-4 text-orange-500" />
                        <span className="text-white/80">
                          Synced from Strava
                        </span>
                      </div>
                      <a
                        href={`https://www.strava.com/activities/${selectedWorkout.strava_activity_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                      >
                        View on Strava →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strava Attribution */}
      {stravaConnected && (
        <div className="mt-8 pt-4 border-t border-white/5">
          <div className="flex items-center justify-center text-xs text-white/40">
            <span>Powered by Strava</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default function TrainingScreen() {
  return (
    <AuthGuard>
      <TrainingScreenContent />
    </AuthGuard>
  );
}
