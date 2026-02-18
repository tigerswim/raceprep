export const dateUtils = {
  /**
   * Calculate start and end dates for a specific week in a plan
   */
  calculateWeekDates: (startDate: string, weekNumber: number) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + ((weekNumber - 1) * 7));

    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  },

  /**
   * Check if a workout is overdue
   */
  isWorkoutOverdue: (scheduledDate: string) => {
    const scheduled = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduled < today;
  },

  /**
   * Check if a date is today
   */
  isToday: (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },
};
