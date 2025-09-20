import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Race, RaceResult } from '../../types';

interface RaceState {
  races: Race[];
  raceResults: RaceResult[];
  selectedRace: RaceResult | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RaceState = {
  races: [],
  raceResults: [],
  selectedRace: null,
  isLoading: false,
  error: null,
};

export const raceSlice = createSlice({
  name: 'races',
  initialState,
  reducers: {
    setRaces: (state, action: PayloadAction<Race[]>) => {
      state.races = action.payload;
    },
    setRaceResults: (state, action: PayloadAction<RaceResult[]>) => {
      state.raceResults = action.payload;
    },
    addRaceResult: (state, action: PayloadAction<RaceResult>) => {
      state.raceResults.push(action.payload);
    },
    updateRaceResult: (state, action: PayloadAction<RaceResult>) => {
      const index = state.raceResults.findIndex(race => race.id === action.payload.id);
      if (index !== -1) {
        state.raceResults[index] = action.payload;
      }
    },
    deleteRaceResult: (state, action: PayloadAction<string>) => {
      state.raceResults = state.raceResults.filter(race => race.id !== action.payload);
    },
    setSelectedRace: (state, action: PayloadAction<RaceResult | null>) => {
      state.selectedRace = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRaces,
  setRaceResults,
  addRaceResult,
  updateRaceResult,
  deleteRaceResult,
  setSelectedRace,
  setLoading,
  setError,
} = raceSlice.actions;

export default raceSlice.reducer;