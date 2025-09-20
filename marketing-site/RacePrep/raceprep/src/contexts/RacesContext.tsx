import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Race {
  id: string;
  name: string;
  location: string;
  date: string;
  distance_type: string;
  description?: string;
  status?: 'interested' | 'registered' | 'completed';
  difficulty_score?: number;
  source?: string;
  registration_url?: string;
  price_min?: number;
  currency?: string;
  website?: string;
  swim_type?: string;
  bike_elevation_gain?: number;
  wetsuit_legal?: boolean;
}

interface RacesContextType {
  savedRaces: Race[];
  savedRaceIds: string[];
  setSavedRaces: (races: Race[]) => void;
  addSavedRace: (race: Race) => void;
  removeSavedRace: (raceId: string) => void;
  updateRaceStatus: (raceId: string, status: 'interested' | 'registered' | 'completed') => void;
  selectedRaceForPlanning: Race | null;
  setSelectedRaceForPlanning: (race: Race | null) => void;
}

const RacesContext = createContext<RacesContextType | undefined>(undefined);

export const RacesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedRaces, setSavedRaces] = useState<Race[]>([]);
  const [selectedRaceForPlanning, setSelectedRaceForPlanning] = useState<Race | null>(null);

  // Initialize with empty saved races when user logs in
  useEffect(() => {
    if (user && savedRaces.length === 0) {
      // Start with clean slate - users will add their own races
      setSavedRaces([]);
    }
  }, [user, savedRaces.length]);

  const savedRaceIds = savedRaces.map(race => race.id);

  const addSavedRace = (race: Race) => {
    if (!savedRaceIds.includes(race.id)) {
      setSavedRaces(prev => [...prev, { ...race, status: 'interested' }]);
    }
  };

  const removeSavedRace = (raceId: string) => {
    setSavedRaces(prev => prev.filter(race => race.id !== raceId));
  };

  const updateRaceStatus = (raceId: string, status: 'interested' | 'registered' | 'completed') => {
    setSavedRaces(prev => prev.map(race => 
      race.id === raceId ? { ...race, status } : race
    ));
  };

  return (
    <RacesContext.Provider value={{
      savedRaces,
      savedRaceIds,
      setSavedRaces,
      addSavedRace,
      removeSavedRace,
      updateRaceStatus,
      selectedRaceForPlanning,
      setSelectedRaceForPlanning
    }}>
      {children}
    </RacesContext.Provider>
  );
};

export const useRaces = () => {
  const context = useContext(RacesContext);
  if (context === undefined) {
    throw new Error('useRaces must be used within a RacesProvider');
  }
  return context;
};