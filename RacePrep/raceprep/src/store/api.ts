import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';
import { User, Race, RaceResult, RaceAnalysis, DashboardData, Course } from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Race', 'Course', 'NutritionPlan', 'RacePlan'],
  endpoints: (builder) => ({
    // User endpoints
    getUserProfile: builder.query<User, void>({
      query: () => 'users/profile',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: 'users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Race endpoints
    getRaces: builder.query<RaceResult[], void>({
      query: () => 'races',
      providesTags: ['Race'],
    }),
    getRaceAnalysis: builder.query<RaceAnalysis, string>({
      query: (raceId) => `races/${raceId}/analysis`,
    }),
    addRace: builder.mutation<RaceResult, Partial<RaceResult>>({
      query: (raceData) => ({
        url: 'races',
        method: 'POST',
        body: raceData,
      }),
      invalidatesTags: ['Race'],
    }),
    updateRace: builder.mutation<RaceResult, { id: string; data: Partial<RaceResult> }>({
      query: ({ id, data }) => ({
        url: `races/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Race'],
    }),
    deleteRace: builder.mutation<void, string>({
      query: (raceId) => ({
        url: `races/${raceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Race'],
    }),
    
    // Course endpoints
    getCourses: builder.query<Course[], { location?: string; distanceType?: string }>({
      query: (params = {}) => ({
        url: 'courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    getCourseDetails: builder.query<Course, string>({
      query: (courseId) => `courses/${courseId}`,
    }),
    
    // Dashboard data
    getDashboardData: builder.query<DashboardData, void>({
      query: () => 'dashboard',
      providesTags: ['User', 'Race'],
    }),
    
    // Strava integration endpoints
    connectStrava: builder.mutation<any, { code: string }>({
      query: (body) => ({
        url: 'strava/connect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    refreshStravaToken: builder.mutation<any, { refresh_token: string }>({
      query: (body) => ({
        url: 'strava/refresh',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getStravaActivities: builder.query<any[], { access_token: string; after?: number; before?: number; per_page?: number }>({
      query: (params) => ({
        url: 'strava/activities',
        params,
      }),
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetRacesQuery,
  useGetRaceAnalysisQuery,
  useAddRaceMutation,
  useUpdateRaceMutation,
  useDeleteRaceMutation,
  useGetCoursesQuery,
  useGetCourseDetailsQuery,
  useGetDashboardDataQuery,
  useConnectStravaMutation,
  useRefreshStravaTokenMutation,
  useGetStravaActivitiesQuery,
} = api;