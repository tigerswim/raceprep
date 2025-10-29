import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import authSlice from './slices/authSlice';
import raceSlice from './slices/raceSlice';

export const store = configureStore({
  reducer: {
    api: api.reducer,
    auth: authSlice,
    races: raceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'api/executeQuery/pending', 'api/executeQuery/fulfilled'],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;