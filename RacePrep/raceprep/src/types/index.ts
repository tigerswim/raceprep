export interface User {
  id: string;
  email: string;
  name: string;
  ageGroup?: string;
  gender?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
  usatId?: string;
  premiumExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Race {
  id: string;
  name: string;
  date: Date;
  location: string;
  distanceType: 'sprint' | 'olympic' | '70.3' | 'ironman';
  courseId?: string;
  timingPlatform?: string;
  externalRaceId?: string;
  createdAt: Date;
}

export interface RaceResult {
  id: string;
  userId: string;
  raceId: string;
  overallTime: number; // seconds
  swimTime?: number;
  t1Time?: number;
  bikeTime?: number;
  t2Time?: number;
  runTime?: number;
  overallPlacement?: number;
  ageGroupPlacement?: number;
  bibNumber?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  distanceType: 'sprint' | 'olympic' | '70.3' | 'ironman';
  swimType?: 'lake' | 'ocean' | 'river' | 'pool';
  bikeElevationGain?: number;
  runElevationGain?: number;
  overallElevation?: number;
  difficultyScore?: number;
  wetsuitLegal?: boolean;
  description?: string;
  features?: string[];
  createdAt: Date;
}

export interface TransitionAnalysis {
  t1Time: number;
  t2Time: number;
  totalTransitionTime: number;
  ageGroupAverage: number;
  percentileRanking: number;
  improvementOpportunity: number;
  recommendations: string[];
}

export interface RaceAnalysis {
  race: Race;
  result: RaceResult;
  transitionAnalysis: TransitionAnalysis;
  performanceMetrics: {
    overallEfficiency: number;
    splitComparison: {
      swim: number;
      bike: number;
      run: number;
    };
  };
  recommendations: string[];
}

export interface NutritionItem {
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  carbs: number;
  sodium: number;
  calories: number;
  caffeine: number;
  timing?: string;
}

export interface NutritionPlan {
  id: string;
  userId: string;
  raceId: string;
  preRace: NutritionItem[];
  bikeSegment: NutritionItem[];
  runSegment: NutritionItem[];
  totals: {
    carbs: number;
    sodium: number;
    calories: number;
    caffeine: number;
  };
  createdAt: Date;
}

export interface DashboardData {
  seasonStats: {
    racesCompleted: number;
    personalBests: number;
    avgTransitionTime: number;
    totalTrainingHours: number;
  };
  latestRace?: RaceResult & { race: Race };
  nextRace?: Race;
  insights: string[];
}

// Redux State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RaceState {
  races: Race[];
  raceResults: RaceResult[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  races: RaceState;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}