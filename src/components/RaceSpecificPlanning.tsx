import { logger } from '../utils/logger';
import React, { useState, useEffect } from 'react';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlannedRace {
  id: string;
  external_race_id: string;
  race_name: string;
  race_date: string;
  race_location: string;
  distance_type: string;
  status: string;
  goal_time?: string;
  notes?: string;
}

interface NutritionItem {
  id?: string;
  item: string;
  quantity: string;
  timing: string;
  calories?: number;
  notes?: string;
}

interface PackingItem {
  id?: string;
  item: string;
  checked: boolean;
  priority: 'essential' | 'important' | 'optional';
  notes?: string;
  category_override?: string;
}

interface RaceSpecificPlanningProps {
  activeTab: string;
}

export const RaceSpecificPlanning: React.FC<RaceSpecificPlanningProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [plannedRaces, setPlannedRaces] = useState<PlannedRace[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [selectedRace, setSelectedRace] = useState<PlannedRace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Nutrition Plan State
  const [nutritionPlan, setNutritionPlan] = useState({
    pre_race_items: [] as NutritionItem[],
    bike_items: [] as NutritionItem[],
    run_items: [] as NutritionItem[],
    hydration_plan: [] as NutritionItem[],
    notes: '',
    plan_name: 'Race Day Nutrition'
  });

  // Packing List State  
  const [packingLists, setPackingLists] = useState<{[category: string]: PackingItem[]}>({
    t1: [],
    t2: [],
    race_morning: [],
    travel: [],
    general: []
  });

  useEffect(() => {
    const initializePlanning = async () => {
      // Check if there's a race selected for planning from localStorage first
      const storedRace = localStorage.getItem('selectedRaceForPlanning');
      let initialRaces: PlannedRace[] = [];
      let initialSelectedRaceId = '';
      
      if (storedRace) {
        try {
          const raceData = JSON.parse(storedRace);
          const plannedRace: PlannedRace = {
            id: raceData.id,
            external_race_id: raceData.id,
            race_name: raceData.name,
            race_date: raceData.date,
            race_location: raceData.location,
            distance_type: raceData.distance_type,
            status: raceData.status || 'interested'
          };
          initialRaces = [plannedRace];
          initialSelectedRaceId = raceData.id;
          // Clear from localStorage
          localStorage.removeItem('selectedRaceForPlanning');
        } catch (error) {
          logger.error('Error parsing stored race data:', error);
          localStorage.removeItem('selectedRaceForPlanning');
        }
      }
      
      // Set the initial races and selected race
      setPlannedRaces(initialRaces);
      if (initialSelectedRaceId) {
        setSelectedRaceId(initialSelectedRaceId);
      }
      
      // Load any additional planned races from database if needed
      await loadPlannedRaces();
    };
    
    if (user) {
      initializePlanning();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRaceId) {
      const race = plannedRaces.find(r => r.id === selectedRaceId);
      setSelectedRace(race || null);
      if (race) {
        loadRaceSpecificPlans(selectedRaceId);
      }
    }
  }, [selectedRaceId, plannedRaces]);

  const loadPlannedRaces = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Try to load user's planned races from database, fallback to mock data if table doesn't exist
      const { data, error } = await dbHelpers.userPlannedRaces.getAll();
      
      if (error && (error.code === 'PGRST205' || error.code === 'TABLE_NOT_FOUND')) {
        // Table doesn't exist, use mock data for now
        logger.warn('userPlannedRaces table not found, using mock data');
        const mockSavedRaces = [
          {
            id: 'saved-1',
            external_race_id: 'saved-1',
            race_name: 'Ironman Louisville',
            race_location: 'Louisville, KY', 
            race_date: '2025-10-12',
            distance_type: 'ironman',
            status: 'registered'
          },
          {
            id: 'saved-2',
            external_race_id: 'saved-2',
            race_name: 'Nashville Sprint Triathlon',
            race_location: 'Nashville, TN',
            race_date: '2025-06-15',
            distance_type: 'sprint',
            status: 'interested'
          }
        ];
        
        // Merge with any existing races from localStorage, avoiding duplicates
        setPlannedRaces(currentRaces => {
          const currentIds = new Set(currentRaces.map(r => r.id));
          const newRaces = mockSavedRaces.filter(r => !currentIds.has(r.id));
          return [...currentRaces, ...newRaces];
        });
        return;
      }
      
      if (error) {
        // Handle feature disabled gracefully (not a real error)
        if (error.code === 'FEATURE_DISABLED') {
          logger.debug('Planned races feature is disabled:', error.message);
        } else {
          logger.error('Error loading planned races:', error);
        }
        return;
      }
      
      // Transform database data to planned races format
      const transformedRaces = data?.map(plannedRace => ({
        id: plannedRace.id,
        external_race_id: plannedRace.external_race_id,
        race_name: plannedRace.external_races?.name || 'Unknown Race',
        race_date: plannedRace.external_races?.date || plannedRace.race_date || new Date().toISOString(),
        race_location: plannedRace.external_races?.location || 'Unknown Location',
        distance_type: plannedRace.external_races?.distance_type || 'unknown',
        status: plannedRace.status || 'interested',
        goal_time: plannedRace.goal_time,
        notes: plannedRace.notes
      })) || [];
      
      // Merge with existing races from localStorage, avoiding duplicates
      setPlannedRaces(currentRaces => {
        const currentIds = new Set(currentRaces.map(r => r.id));
        const newRaces = transformedRaces.filter(r => !currentIds.has(r.id));
        return [...currentRaces, ...newRaces];
      });
      
    } catch (error: any) {
      // Handle feature disabled gracefully (not a real error)
      if (error?.code === 'FEATURE_DISABLED') {
        logger.debug('Planned races feature is disabled:', error.message);
      } else {
        logger.error('Error loading planned races:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeRaceFromPlanning = (raceId: string) => {
    // Remove the race from planned races
    setPlannedRaces(currentRaces => currentRaces.filter(race => race.id !== raceId));
    
    // If this was the selected race, clear the selection
    if (selectedRaceId === raceId) {
      setSelectedRaceId('');
      setSelectedRace(null);
    }
  };

  const loadRaceSpecificPlans = async (raceId: string) => {
    if (!user) return;
    
    try {
      // Load existing nutrition plans for this race
      const { data: nutritionPlans } = await dbHelpers.nutritionPlans.getUserPlans(user.id);
      const raceNutritionPlan = nutritionPlans?.find(plan => plan.planned_race_id === raceId);
      
      // Load existing packing lists for this race
      const { data: packingListsData } = await dbHelpers.packingLists.getUserLists(user.id);
      const racePackingLists = packingListsData?.filter(list => list.planned_race_id === raceId) || [];
      
      const race = plannedRaces.find(r => r.id === raceId);
      if (race) {
        if (raceNutritionPlan) {
          // Load saved nutrition plan
          setNutritionPlan({
            plan_name: raceNutritionPlan.plan_name || `${race.distance_type} Nutrition Plan`,
            pre_race_items: raceNutritionPlan.pre_race_items || [],
            bike_items: raceNutritionPlan.bike_items || [],
            run_items: raceNutritionPlan.run_items || [],
            hydration_plan: raceNutritionPlan.hydration_plan || [],
            notes: raceNutritionPlan.notes || ''
          });
        } else {
          // Load default nutrition plan
          const defaults = getDefaultPlans(race.distance_type);
          setNutritionPlan(defaults.nutrition);
        }
        
        if (racePackingLists.length > 0) {
          // Load saved packing lists
          const packingListsByCategory: {[category: string]: PackingItem[]} = {
            t1: [],
            t2: [],
            race_morning: [],
            travel: [],
            general: []
          };
          
          racePackingLists.forEach(list => {
            if (list.category && list.items) {
              packingListsByCategory[list.category] = list.items;
            }
          });
          
          setPackingLists(packingListsByCategory);
        } else {
          // Load default packing lists
          const defaults = getDefaultPlans(race.distance_type);
          setPackingLists(defaults.packing);
        }
      }
    } catch (error) {
      logger.error('Error loading race plans:', error);
      // Fall back to defaults
      const race = plannedRaces.find(r => r.id === raceId);
      if (race) {
        loadDefaultPlans(race.distance_type);
      }
    }
  };

  const loadDefaultPlans = (distanceType: string) => {
    // Set defaults based on race distance
    const defaults = getDefaultPlans(distanceType);
    setNutritionPlan(defaults.nutrition);
    setPackingLists(defaults.packing);
  };

  const getDefaultPlans = (distanceType: string) => {
    const baseNutrition = {
      pre_race_items: [
        { item: 'Banana with peanut butter', quantity: '1 medium', timing: '2-3 hours before', calories: 300, notes: 'Easy to digest' },
        { item: 'Coffee', quantity: '8-12 oz', timing: '2 hours before', calories: 5, notes: 'If part of routine' }
      ],
      bike_items: [] as NutritionItem[],
      run_items: [] as NutritionItem[],
      hydration_plan: [
        { item: 'Sports drink', quantity: '16-24 oz', timing: '2 hours before race', calories: 120, notes: 'Start hydrated' }
      ],
      notes: `Default plan for ${distanceType} distance`,
      plan_name: `${distanceType.charAt(0).toUpperCase() + distanceType.slice(1)} Nutrition Plan`
    };

    const basePacking = {
      t1: [
        { item: 'Towel', checked: false, priority: 'essential' as const, notes: 'For drying feet' },
        { item: 'Cycling shoes', checked: false, priority: 'essential' as const, notes: 'Pre-set with bike' },
        { item: 'Helmet', checked: false, priority: 'essential' as const, notes: 'Put on first!' },
        { item: 'Sunglasses', checked: false, priority: 'important' as const, notes: 'For bike leg' }
      ],
      t2: [
        { item: 'Running shoes', checked: false, priority: 'essential' as const, notes: 'Loose laces, easy slip-on' },
        { item: 'Race belt with number', checked: false, priority: 'essential' as const, notes: 'Pre-attached' },
        { item: 'Hat/visor', checked: false, priority: 'important' as const, notes: 'Sun protection' },
        { item: 'Running nutrition', checked: false, priority: 'important' as const, notes: 'Gels or sports drink' }
      ],
      race_morning: [
        { item: 'Race packet/timing chip', checked: false, priority: 'essential' as const, notes: 'Usually ankle strap' },
        { item: 'Body marking supplies', checked: false, priority: 'essential' as const, notes: 'Markers provided' },
        { item: 'Wetsuit', checked: false, priority: 'essential' as const, notes: 'Check water temp rules' }
      ],
      travel: [
        { item: 'Bike (assembled/packed)', checked: false, priority: 'essential' as const, notes: 'Race day ready' },
        { item: 'All nutrition items', checked: false, priority: 'essential' as const, notes: 'Tested in training' },
        { item: 'Spare gear', checked: false, priority: 'important' as const, notes: 'Backup goggles, etc.' }
      ],
      general: [
        { item: 'Emergency contact info', checked: false, priority: 'essential' as const, notes: 'In case of emergency' },
        { item: 'Post-race clothes', checked: false, priority: 'important' as const, notes: 'Warm, comfortable' },
        { item: 'Recovery snacks', checked: false, priority: 'optional' as const, notes: 'For after the race' }
      ]
    };

    // Customize based on distance
    if (distanceType === 'ironman') {
      baseNutrition.bike_items = [
        { item: 'Energy gel', quantity: '1 per hour', timing: 'Every 45-60 min', calories: 100, notes: 'Start at 45min mark' },
        { item: 'Sports drink', quantity: '24-32 oz/hour', timing: 'Consistent sipping', calories: 200, notes: 'Electrolyte replacement' },
        { item: 'Solid food', quantity: '1 item', timing: 'Hour 3-4', calories: 250, notes: 'Sandwich, banana, etc.' }
      ];
      baseNutrition.run_items = [
        { item: 'Energy gel', quantity: '1 per 45min', timing: 'Every aid station', calories: 100, notes: 'Alternate with sports drink' },
        { item: 'Cola/caffeine', quantity: '4-6 oz', timing: 'Final 6 miles', calories: 50, notes: 'Mental boost' }
      ];
    } else if (distanceType === '70.3') {
      baseNutrition.bike_items = [
        { item: 'Energy gel', quantity: '2 total', timing: 'Mile 30 and 50', calories: 100, notes: 'With water' },
        { item: 'Sports drink', quantity: '20-24 oz/hour', timing: 'Consistent sipping', calories: 150, notes: 'On bike bottle' }
      ];
      baseNutrition.run_items = [
        { item: 'Energy gel', quantity: '1-2 total', timing: 'Mile 4 and 9', calories: 100, notes: 'If needed' },
        { item: 'Sports drink', quantity: 'At aid stations', timing: 'Every mile', calories: 25, notes: 'Small sips' }
      ];
    } else if (distanceType === 'olympic') {
      baseNutrition.bike_items = [
        { item: 'Sports drink', quantity: '16-20 oz', timing: 'Throughout bike', calories: 120, notes: 'One bottle sufficient' }
      ];
      baseNutrition.run_items = [
        { item: 'Sports drink', quantity: 'Small sips', timing: 'Aid stations', calories: 15, notes: 'Mainly for hydration' }
      ];
    }

    return { nutrition: baseNutrition, packing: basePacking };
  };

  const addNutritionItem = (category: keyof typeof nutritionPlan) => {
    if (category === 'notes' || category === 'plan_name') return;
    
    const newItem: NutritionItem = {
      item: '',
      quantity: '',
      timing: '',
      calories: 0,
      notes: ''
    };

    setNutritionPlan(prev => ({
      ...prev,
      [category]: [...(prev[category] as NutritionItem[]), newItem]
    }));
  };

  const updateNutritionItem = (category: keyof typeof nutritionPlan, index: number, field: keyof NutritionItem, value: string | number) => {
    if (category === 'notes' || category === 'plan_name') return;
    
    setNutritionPlan(prev => ({
      ...prev,
      [category]: (prev[category] as NutritionItem[]).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeNutritionItem = (category: keyof typeof nutritionPlan, index: number) => {
    if (category === 'notes' || category === 'plan_name') return;
    
    setNutritionPlan(prev => ({
      ...prev,
      [category]: (prev[category] as NutritionItem[]).filter((_, i) => i !== index)
    }));
  };

  const addPackingItem = (category: string) => {
    const newItem: PackingItem = {
      item: '',
      checked: false,
      priority: 'important',
      notes: ''
    };

    setPackingLists(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
  };

  const updatePackingItem = (category: string, index: number, field: keyof PackingItem, value: string | boolean) => {
    setPackingLists(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePackingItem = (category: string, index: number) => {
    setPackingLists(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const savePlans = async () => {
    if (!selectedRaceId || !user) return;
    
    try {
      // Save nutrition plan
      const nutritionPlanData = {
        user_id: user.id,
        planned_race_id: selectedRaceId,
        plan_name: nutritionPlan.plan_name,
        pre_race_items: nutritionPlan.pre_race_items,
        bike_items: nutritionPlan.bike_items,
        run_items: nutritionPlan.run_items,
        hydration_plan: nutritionPlan.hydration_plan,
        notes: nutritionPlan.notes
      };
      
      const { data: nutritionData, error: nutritionError } = await dbHelpers.nutritionPlans.create(nutritionPlanData);
      if (nutritionError) {
        // Handle feature disabled gracefully (not a real error)
        if (nutritionError.code === 'FEATURE_DISABLED') {
          logger.debug('Nutrition plans feature is disabled:', nutritionError.message);
        } else {
          logger.error('Error saving nutrition plan:', nutritionError);
        }
      }
      
      // Save packing lists
      for (const [category, items] of Object.entries(packingLists)) {
        if (items.length > 0) {
          const packingListData = {
            user_id: user.id,
            planned_race_id: selectedRaceId,
            list_name: `${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Checklist`,
            category,
            items
          };
          
          const { data: packingData, error: packingError } = await dbHelpers.packingLists.create(packingListData);
          if (packingError) {
            // Handle feature disabled gracefully (not a real error)
            if (packingError.code === 'FEATURE_DISABLED') {
              logger.debug(`Packing lists feature is disabled for ${category}:`, packingError.message);
            } else {
              logger.error(`Error saving packing list for ${category}:`, packingError);
            }
          }
        }
      }
      
      alert('Your race plans have been saved!');
    } catch (error) {
      logger.error('Error saving plans:', error);
      alert('Error saving plans. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-white text-center">Loading your planned races...</div>;
  }

  return (
    <div>
      {/* Race Selector */}
      <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Select Race to Plan</h3>
          <button
            onClick={savePlans}
            disabled={!selectedRaceId}
            className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Plans
          </button>
        </div>
        
        {plannedRaces.length === 0 ? (
          <div className="text-center text-white/60 py-4">
            <p>No planned races found.</p>
            <p className="text-sm mt-2">Visit the Races tab to save races for planning.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {plannedRaces.map((race) => (
              <div
                key={race.id}
                className={`relative p-3 rounded-xl border transition-all ${
                  selectedRaceId === race.id
                    ? 'border-blue-400/30 bg-blue-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <button
                  onClick={() => setSelectedRaceId(race.id)}
                  className="text-left w-full pr-8"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{race.race_name}</div>
                      <div className="text-sm text-white/60">
                        {race.race_location} • {race.distance_type} • Date: {race.race_date && !isNaN(Date.parse(race.race_date)) 
                          ? new Date(race.race_date).toLocaleDateString() 
                          : 'TBD'}
                      </div>
                      {race.goal_time && (
                        <div className="text-sm text-green-400">Goal: {race.goal_time}</div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      race.status === 'registered' ? 'bg-green-500/20 text-green-400' :
                      race.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {race.status}
                    </span>
                  </div>
                </button>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRaceFromPlanning(race.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full flex items-center justify-center text-sm transition-colors"
                  title="Remove from planning"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRace && (
        <>
          {/* Nutrition Planning */}
          {activeTab === 'nutrition' && (
            <NutritionPlanningSection
              nutritionPlan={nutritionPlan}
              setNutritionPlan={setNutritionPlan}
              addNutritionItem={addNutritionItem}
              updateNutritionItem={updateNutritionItem}
              removeNutritionItem={removeNutritionItem}
              selectedRace={selectedRace}
            />
          )}

          {/* Packing Lists */}
          {activeTab === 'gear' && (
            <PackingListSection
              packingLists={packingLists}
              addPackingItem={addPackingItem}
              updatePackingItem={updatePackingItem}
              removePackingItem={removePackingItem}
              selectedRace={selectedRace}
            />
          )}
        </>
      )}
    </div>
  );
};

// Nutrition Planning Section Component
const NutritionPlanningSection: React.FC<{
  nutritionPlan: any;
  setNutritionPlan: any;
  addNutritionItem: any;
  updateNutritionItem: any;
  removeNutritionItem: any;
  selectedRace: PlannedRace;
}> = ({ nutritionPlan, setNutritionPlan, addNutritionItem, updateNutritionItem, removeNutritionItem, selectedRace }) => {
  
  const nutritionCategories = [
    { key: 'pre_race_items', label: 'Pre-Race', icon: '🌅', description: '2-4 hours before race' },
    { key: 'bike_items', label: 'Bike Leg', icon: '🚴‍♂️', description: 'During cycling portion' },
    { key: 'run_items', label: 'Run Leg', icon: '🏃‍♂️', description: 'During running portion' },
    { key: 'hydration_plan', label: 'Hydration', icon: '💧', description: 'Fluid intake strategy' }
  ];

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Nutrition Plan</h3>
          <span className="text-sm text-white/60">{selectedRace.race_name}</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">Plan Name</label>
            <input
              type="text"
              value={nutritionPlan.plan_name}
              onChange={(e) => setNutritionPlan(prev => ({ ...prev, plan_name: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">Race Distance</label>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70">
              {selectedRace.distance_type}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">Notes</label>
          <textarea
            value={nutritionPlan.notes}
            onChange={(e) => setNutritionPlan(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any special considerations, allergies, or preferences..."
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none h-20 resize-none"
          />
        </div>
      </div>

      {/* Nutrition Categories */}
      {nutritionCategories.map((category) => (
        <div key={category.key} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>{category.icon}</span>
                {category.label}
              </h4>
              <p className="text-white/60 text-sm">{category.description}</p>
            </div>
            <button
              onClick={() => addNutritionItem(category.key)}
              className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {nutritionPlan[category.key]?.map((item: NutritionItem, index: number) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Item</label>
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updateNutritionItem(category.key, index, 'item', e.target.value)}
                      placeholder="Food/drink item"
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Quantity</label>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => updateNutritionItem(category.key, index, 'quantity', e.target.value)}
                      placeholder="Amount"
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Timing</label>
                    <input
                      type="text"
                      value={item.timing}
                      onChange={(e) => updateNutritionItem(category.key, index, 'timing', e.target.value)}
                      placeholder="When to consume"
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Calories</label>
                    <input
                      type="number"
                      value={item.calories || ''}
                      onChange={(e) => updateNutritionItem(category.key, index, 'calories', parseInt(e.target.value) || 0)}
                      placeholder="Cal"
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-white/70 text-xs mb-1">Notes</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateNutritionItem(category.key, index, 'notes', e.target.value)}
                      placeholder="Additional notes..."
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      onClick={() => removeNutritionItem(category.key, index)}
                      className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-400/30 rounded hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {nutritionPlan[category.key]?.length === 0 && (
              <div className="text-center text-white/40 py-4 border border-dashed border-white/20 rounded-lg">
                No items added yet. Click &quot;Add Item&quot; to get started.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Packing List Section Component  
const PackingListSection: React.FC<{
  packingLists: {[category: string]: PackingItem[]};
  addPackingItem: (category: string) => void;
  updatePackingItem: (category: string, index: number, field: keyof PackingItem, value: string | boolean) => void;
  removePackingItem: (category: string, index: number) => void;
  selectedRace: PlannedRace;
}> = ({ packingLists, addPackingItem, updatePackingItem, removePackingItem, selectedRace }) => {

  const packingCategories = [
    { key: 't1', label: 'T1 (Swim → Bike)', icon: '🏊‍♂️➡️🚴‍♂️', description: 'Transition 1 setup' },
    { key: 't2', label: 'T2 (Bike → Run)', icon: '🚴‍♂️➡️🏃‍♂️', description: 'Transition 2 setup' },
    { key: 'race_morning', label: 'Race Morning', icon: '🌅', description: 'Pre-race essentials' },
    { key: 'travel', label: 'Travel/Transport', icon: '🚗', description: 'Getting to the race' },
    { key: 'general', label: 'General Items', icon: '📦', description: 'Other important items' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'important': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      case 'optional': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Packing Overview */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Packing Checklists</h3>
          <span className="text-sm text-white/60">{selectedRace.race_name}</span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {Object.values(packingLists).flat().filter(item => item.priority === 'essential').length}
            </div>
            <div className="text-white/60">Essential Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {Object.values(packingLists).flat().filter(item => item.priority === 'important').length}
            </div>
            <div className="text-white/60">Important Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Object.values(packingLists).flat().filter(item => item.checked).length}
            </div>
            <div className="text-white/60">Items Checked</div>
          </div>
        </div>
      </div>

      {/* Packing Categories */}
      {packingCategories.map((category) => (
        <div key={category.key} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>{category.icon}</span>
                {category.label}
              </h4>
              <p className="text-white/60 text-sm">{category.description}</p>
            </div>
            <button
              onClick={() => addPackingItem(category.key)}
              className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-2">
            {packingLists[category.key]?.map((item: PackingItem, index: number) => (
              <div key={index} className={`p-3 rounded-lg border transition-all ${
                item.checked 
                  ? 'bg-green-500/10 border-green-400/30' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => updatePackingItem(category.key, index, 'checked', e.target.checked)}
                    className="w-4 h-4 text-green-500 bg-white/10 border-white/30 rounded focus:ring-green-500"
                  />
                  
                  <div className="flex-1 grid md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updatePackingItem(category.key, index, 'item', e.target.value)}
                      placeholder="Item name"
                      className={`px-2 py-1 bg-transparent border-b border-white/20 text-white text-sm focus:border-blue-400 focus:outline-none ${
                        item.checked ? 'line-through text-white/60' : ''
                      }`}
                    />
                    
                    <select
                      value={item.priority}
                      onChange={(e) => updatePackingItem(category.key, index, 'priority', e.target.value)}
                      className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-blue-400 focus:outline-none"
                    >
                      <option value="essential" className="bg-slate-800">Essential</option>
                      <option value="important" className="bg-slate-800">Important</option>
                      <option value="optional" className="bg-slate-800">Optional</option>
                    </select>
                    
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updatePackingItem(category.key, index, 'notes', e.target.value)}
                      placeholder="Notes..."
                      className="px-2 py-1 bg-transparent border-b border-white/20 text-white text-sm focus:border-blue-400 focus:outline-none"
                    />
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <button
                        onClick={() => removePackingItem(category.key, index)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-400/30 rounded hover:bg-red-500/30 transition-colors text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {packingLists[category.key]?.length === 0 && (
              <div className="text-center text-white/40 py-4 border border-dashed border-white/20 rounded-lg">
                No items in this category yet. Click &quot;Add Item&quot; to get started.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};