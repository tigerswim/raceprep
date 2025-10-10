import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  TbSwimming,
  TbBike,
  TbRun,
  TbWeight,
  TbBed,
  TbFlame,
} from 'react-icons/tb';
import { trainingPlanService } from '../../services/trainingPlanService';
import type { TrainingPlanProgress } from '../../types/trainingPlans';
import { useAuth } from '../../contexts/AuthContext';

export const TrainingPlanProgressWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TrainingPlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewCalendar = useCallback(() => {
    if (activePlanId && progress) {
      router.push(`/training-calendar?planId=${activePlanId}&currentWeek=${progress.currentWeek}`);
    }
  }, [activePlanId, progress, router]);

  const handleStartPlan = useCallback(() => {
    router.push("/training-plans");
  }, [router]);

  const loadProgress = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's active training plan
      const plansResult = await trainingPlanService.getUserTrainingPlans(user.id, 'active');

      if (plansResult.error) {
        setError(plansResult.error.message);
        return;
      }

      if (!plansResult.data || plansResult.data.length === 0) {
        setProgress(null);
        setActivePlanId(null);
        return;
      }

      // Get progress for the first active plan
      const activePlan = plansResult.data[0];
      setActivePlanId(activePlan.id);
      const progressResult = await trainingPlanService.getTrainingPlanProgress(activePlan.id);

      if (progressResult.error) {
        setError(progressResult.error.message);
      } else {
        setProgress(progressResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // All hooks must run before any conditional returns
  // Render logic after all hooks
  if (!user && !loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="text-center py-6">
          <p className="text-white/50">Please log in to view your training plan</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Training Plan</h3>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Training Plan</h3>
        <p className="text-red-400 text-center mt-5">{error}</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Training Plan</h3>
        <div className="py-10 text-center">
          <p className="text-white/60 mb-4">No active training plan</p>
          <button
            onClick={handleStartPlan}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Start a Plan
          </button>
        </div>
      </div>
    );
  }

  const completionPercentage = progress.totalWorkouts > 0
    ? Math.round((progress.completedWorkouts / progress.totalWorkouts) * 100)
    : 0;

  return (
    <div
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl cursor-pointer hover:bg-white/10 transition-all"
      onClick={handleViewCalendar}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-bold text-white">Training Plan</h3>
        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
          Week {progress.currentWeek}/{progress.totalWeeks}
        </span>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center my-5">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-8 border-blue-500 bg-white/5 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-blue-500">{completionPercentage}%</span>
              <span className="text-xs text-white/60 mt-1">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-around py-4 border-t border-b border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{progress.completedWorkouts}</div>
          <div className="text-xs text-white/60 mt-1">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{progress.adherenceRate}%</div>
          <div className="text-xs text-white/60 mt-1">Adherence</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {progress.totalWorkouts - progress.completedWorkouts}
          </div>
          <div className="text-xs text-white/60 mt-1">Remaining</div>
        </div>
      </div>

      {/* This Week Summary */}
      {progress.upcomingWorkouts && progress.upcomingWorkouts.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-3">This Week:</h4>
          <div className="space-y-2">
            {progress.upcomingWorkouts.slice(0, 3).map((workout, index) => (
              <div key={index} className="flex items-center gap-2">
                {getDisciplineIcon(workout.discipline)}
                <span className="text-sm text-white/60">
                  {workout.discipline} • {workout.duration_minutes || '?'} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Calendar Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleViewCalendar();
        }}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
      >
        View Calendar →
      </button>
    </div>
  );
};

const getDisciplineIcon = (discipline: string) => {
  const iconClass = "text-base mr-1";

  switch (discipline.toLowerCase()) {
    case 'swim':
      return <TbSwimming className={`${iconClass} text-[#007AFF]`} />;
    case 'bike':
      return <TbBike className={`${iconClass} text-[#FF9500]`} />;
    case 'run':
      return <TbRun className={`${iconClass} text-[#34C759]`} />;
    case 'brick':
      return <TbFlame className={`${iconClass} text-[#AF52DE]`} />;
    case 'strength':
      return <TbWeight className={`${iconClass} text-[#FF3B30]`} />;
    case 'rest':
      return <TbBed className={`${iconClass} text-[#8E8E93]`} />;
    default:
      return <TbBed className={`${iconClass} text-[#8E8E93]`} />;
  }
};
