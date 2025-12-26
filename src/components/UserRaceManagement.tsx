import React, { useState, useEffect, useCallback } from 'react';
import { UserRaceFormModal } from './UserRaceFormModal';
import { dbHelpers } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserRaceManagementProps {
  onRaceUpdate?: () => void; // Callback for when races are updated
}

export const UserRaceManagement: React.FC<UserRaceManagementProps> = ({ onRaceUpdate }) => {
  const { user } = useAuth();
  const [userRaces, setUserRaces] = useState<any[]>([]);
  const [filteredRaces, setFilteredRaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRace, setEditingRace] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Terminal color palette
  const terminalColors = {
    bg: '#0A0E14',
    panel: '#0F1419',
    border: '#1C2127',
    textPrimary: '#F8F8F2',
    textSecondary: '#B4B8C5',
    yellow: '#FFD866',
    swim: '#00D4FF',
    bike: '#FF6B35',
    run: '#4ECDC4',
  };

  // Load user races
  const loadUserRaces = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await dbHelpers.userRaces.getAll();
      if (error) {
        console.error('Error loading user races:', error);
        setUserRaces([]);
      } else {
        setUserRaces(data || []);
      }
    } catch (error) {
      console.error('Error loading user races:', error);
      setUserRaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserRaces();
  }, [loadUserRaces]);

  // Filter races based on search and filters
  useEffect(() => {
    let filtered = userRaces;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(race =>
        race.name?.toLowerCase().includes(query) ||
        race.location?.toLowerCase().includes(query) ||
        race.description?.toLowerCase().includes(query)
      );
    }

    // Distance filter
    if (distanceFilter !== 'all') {
      filtered = filtered.filter(race =>
        race.distance_type?.toLowerCase() === distanceFilter.toLowerCase()
      );
    }

    // Status filter (based on date)
    if (statusFilter !== 'all') {
      const today = new Date();
      filtered = filtered.filter(race => {
        const raceDate = new Date(race.date);
        if (statusFilter === 'upcoming') {
          return raceDate >= today;
        } else if (statusFilter === 'past') {
          return raceDate < today;
        }
        return true;
      });
    }

    // Sort by date (upcoming first, then past)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const today = new Date();

      // Separate upcoming and past races
      const aIsUpcoming = dateA >= today;
      const bIsUpcoming = dateB >= today;

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Within the same category, sort by date
      if (aIsUpcoming && bIsUpcoming) {
        return dateA.getTime() - dateB.getTime(); // Ascending for upcoming
      } else {
        return dateB.getTime() - dateA.getTime(); // Descending for past
      }
    });

    setFilteredRaces(filtered);
  }, [userRaces, searchQuery, distanceFilter, statusFilter]);

  // Handle race creation
  const handleCreateRace = async (raceData: any) => {
    try {
      const { data: newRace, error } = await dbHelpers.userRaces.create(raceData);

      if (error) {
        throw new Error(error);
      }

      await loadUserRaces();
      setShowCreateModal(false);
      onRaceUpdate?.();

      alert(`Race "${newRace?.name}" created successfully!`);
    } catch (error: any) {
      console.error('Error creating race:', error);
      alert('Failed to create race. Please try again.');
    }
  };

  // Handle race editing
  const handleEditRace = async (raceData: any) => {
    if (!editingRace) return;

    try {
      const { data, error } = await dbHelpers.userRaces.update(editingRace.id, raceData);

      if (error) {
        throw new Error(error);
      }

      await loadUserRaces();
      setShowEditModal(false);
      setEditingRace(null);
      onRaceUpdate?.();

      alert(`Race "${data?.name}" updated successfully!`);
    } catch (error: any) {
      console.error('Error updating race:', error);
      alert('Failed to update race. Please try again.');
    }
  };

  // Handle race deletion
  const handleDeleteRace = async (raceId: string) => {
    setActionLoading(raceId);
    try {
      const { error } = await dbHelpers.userRaces.delete(raceId);

      if (error) {
        throw new Error(error);
      }

      await loadUserRaces();
      setShowDeleteConfirm(null);
      onRaceUpdate?.();

      alert('Race deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting race:', error);
      alert('Failed to delete race. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Start editing a race
  const startEdit = (race: any) => {
    setEditingRace(race);
    setShowEditModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine if race is upcoming
  const isUpcoming = (dateString: string): boolean => {
    return new Date(dateString) >= new Date();
  };

  // Get distance display with units
  const getDistanceDisplay = (race: any): string => {
    if (race.distance_type !== 'custom') {
      return race.distance_type.charAt(0).toUpperCase() + race.distance_type.slice(1);
    }

    const swim = race.swim_distance ? `${race.swim_distance}m` : '?';
    const bike = race.bike_distance ? `${race.bike_distance}km` : '?';
    const run = race.run_distance ? `${race.run_distance}km` : '?';

    return `Custom (${swim}/${bike}/${run})`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white text-lg">Loading your races...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold font-mono tracking-wider"
            style={{ color: terminalColors.textPrimary, textTransform: 'uppercase' }}
          >
            MY CREATED RACES
          </h2>
          <p
            className="font-mono text-sm"
            style={{ color: terminalColors.textSecondary }}
          >
            MANAGE YOUR CUSTOM RACES AND EVENTS
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 font-mono font-bold tracking-wider transition-all duration-300 flex items-center gap-2 border-2"
          style={{
            backgroundColor: terminalColors.yellow,
            color: terminalColors.bg,
            borderColor: terminalColors.yellow,
            borderRadius: 0,
            textTransform: 'uppercase',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          CREATE NEW RACE
        </button>
      </div>

      {/* Search and Filters */}
      <div
        className="p-6 border-2"
        style={{
          backgroundColor: terminalColors.panel,
          borderColor: terminalColors.border,
          borderRadius: 0,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label
              className="block text-sm font-bold mb-2 font-mono tracking-wider"
              style={{ color: terminalColors.textSecondary, textTransform: 'uppercase' }}
            >
              SEARCH RACES
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: terminalColors.textSecondary }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY NAME, LOCATION, OR DESCRIPTION..."
                className="w-full pl-10 pr-4 py-3 border-2 focus:outline-none font-mono"
                style={{
                  backgroundColor: terminalColors.bg,
                  borderColor: terminalColors.border,
                  color: terminalColors.textPrimary,
                  borderRadius: 0,
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-bold mb-2 font-mono tracking-wider"
              style={{ color: terminalColors.textSecondary, textTransform: 'uppercase' }}
            >
              DISTANCE TYPE
            </label>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 focus:outline-none font-mono"
              style={{
                backgroundColor: terminalColors.bg,
                borderColor: terminalColors.border,
                color: terminalColors.textPrimary,
                borderRadius: 0,
              }}
            >
              <option value="all">ALL DISTANCES</option>
              <option value="sprint">SPRINT</option>
              <option value="olympic">OLYMPIC</option>
              <option value="half">HALF IRONMAN</option>
              <option value="ironman">IRONMAN</option>
              <option value="custom">CUSTOM</option>
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-bold mb-2 font-mono tracking-wider"
              style={{ color: terminalColors.textSecondary, textTransform: 'uppercase' }}
            >
              STATUS
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 focus:outline-none font-mono"
              style={{
                backgroundColor: terminalColors.bg,
                borderColor: terminalColors.border,
                color: terminalColors.textPrimary,
                borderRadius: 0,
              }}
            >
              <option value="all">ALL RACES</option>
              <option value="upcoming">UPCOMING</option>
              <option value="past">PAST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Race List */}
      {filteredRaces.length === 0 ? (
        <div
          className="text-center py-12 border-2"
          style={{
            backgroundColor: terminalColors.panel,
            borderColor: terminalColors.border,
            borderRadius: 0,
          }}
        >
          {userRaces.length === 0 ? (
            <>
              <svg
                className="mx-auto w-16 h-16 mb-4"
                style={{ color: terminalColors.textSecondary }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
              <h3
                className="text-xl font-bold mb-2 font-mono tracking-wider"
                style={{ color: terminalColors.textPrimary, textTransform: 'uppercase' }}
              >
                NO CUSTOM RACES YET
              </h3>
              <p
                className="mb-4 font-mono text-sm"
                style={{ color: terminalColors.textSecondary }}
              >
                CREATE YOUR FIRST CUSTOM RACE TO GET STARTED!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 font-mono font-bold tracking-wider transition-all duration-300 border-2"
                style={{
                  backgroundColor: terminalColors.yellow,
                  color: terminalColors.bg,
                  borderColor: terminalColors.yellow,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                }}
              >
                CREATE YOUR FIRST RACE
              </button>
            </>
          ) : (
            <>
              <svg
                className="mx-auto w-16 h-16 mb-4"
                style={{ color: terminalColors.textSecondary }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3
                className="text-xl font-bold mb-2 font-mono tracking-wider"
                style={{ color: terminalColors.textPrimary, textTransform: 'uppercase' }}
              >
                NO RACES FOUND
              </h3>
              <p
                className="font-mono text-sm"
                style={{ color: terminalColors.textSecondary }}
              >
                TRY ADJUSTING YOUR SEARCH OR FILTERS.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRaces.map((race) => (
            <div
              key={race.id}
              className="p-6 border-2 hover:border-opacity-80 transition-all duration-300"
              style={{
                backgroundColor: terminalColors.panel,
                borderColor: isUpcoming(race.date) ? terminalColors.yellow : terminalColors.border,
                borderRadius: 0,
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-bold mb-1 truncate font-mono tracking-wider"
                    style={{ color: terminalColors.textPrimary, textTransform: 'uppercase' }}
                  >
                    {race.name.toUpperCase()}
                  </h3>
                  <p
                    className="font-medium mb-1 font-mono text-sm"
                    style={{ color: isUpcoming(race.date) ? terminalColors.yellow : terminalColors.textSecondary }}
                  >
                    {formatDate(race.date)}
                    {isUpcoming(race.date) && (
                      <span
                        className="ml-2 px-2 py-0.5 text-xs font-mono font-bold border"
                        style={{
                          backgroundColor: `${terminalColors.run}33`,
                          color: terminalColors.run,
                          borderColor: terminalColors.run,
                          borderRadius: 0,
                        }}
                      >
                        UPCOMING
                      </span>
                    )}
                  </p>
                  <p
                    className="text-sm break-words font-mono"
                    style={{ color: terminalColors.textSecondary }}
                  >
                    {race.location}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 text-sm font-bold font-mono border"
                    style={{
                      backgroundColor: `${terminalColors.bike}33`,
                      color: terminalColors.bike,
                      borderColor: terminalColors.bike,
                      borderRadius: 0,
                    }}
                  >
                    {getDistanceDisplay(race).toUpperCase()}
                  </span>
                  {race.difficulty_score && (
                    <span
                      className="px-3 py-1 text-sm font-bold font-mono border"
                      style={{
                        backgroundColor: `${terminalColors.yellow}33`,
                        color: terminalColors.yellow,
                        borderColor: terminalColors.yellow,
                        borderRadius: 0,
                      }}
                    >
                      DIFF: {race.difficulty_score}/10
                    </span>
                  )}
                </div>

                {race.description && (
                  <p
                    className="text-sm line-clamp-2 break-words font-mono"
                    style={{ color: terminalColors.textSecondary }}
                  >
                    {race.description}
                  </p>
                )}

                {race.website_url && (
                  <a
                    href={race.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all inline-flex items-center gap-1 font-mono font-bold"
                    style={{ color: terminalColors.swim }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    WEBSITE →
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(race)}
                  className="flex-1 py-2 transition-colors text-sm font-bold flex items-center justify-center gap-1 font-mono border-2"
                  style={{
                    backgroundColor: `${terminalColors.swim}33`,
                    color: terminalColors.swim,
                    borderColor: terminalColors.swim,
                    borderRadius: 0,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  EDIT
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(race.id)}
                  className="flex-1 py-2 transition-colors text-sm font-bold flex items-center justify-center gap-1 font-mono border-2"
                  style={{
                    backgroundColor: `${terminalColors.bike}33`,
                    color: terminalColors.bike,
                    borderColor: terminalColors.bike,
                    borderRadius: 0,
                  }}
                  disabled={actionLoading === race.id}
                >
                  {actionLoading === race.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Race Modal */}
      {showCreateModal && (
        <UserRaceFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRace}
        />
      )}

      {/* Edit Race Modal */}
      {showEditModal && editingRace && (
        <UserRaceFormModal
          mode="edit"
          existingRace={editingRace}
          onClose={() => {
            setShowEditModal(false);
            setEditingRace(null);
          }}
          onSubmit={handleEditRace}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <svg className="mx-auto w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-bold text-white mb-2">Delete Race</h3>
                <p className="text-white/70 mb-6">
                  Are you sure you want to delete this race? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteRace(showDeleteConfirm)}
                    disabled={actionLoading === showDeleteConfirm}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === showDeleteConfirm ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};