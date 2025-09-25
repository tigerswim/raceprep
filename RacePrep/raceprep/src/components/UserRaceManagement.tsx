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
          <h2 className="text-2xl font-bold text-white">My Created Races</h2>
          <p className="text-white/70">Manage your custom races and events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Race
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-white/70 text-sm font-medium mb-2">Search Races</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or description..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Distance Type</label>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Distances</option>
              <option value="sprint">Sprint</option>
              <option value="olympic">Olympic</option>
              <option value="half">Half Ironman</option>
              <option value="ironman">Ironman</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Races</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {/* Race List */}
      {filteredRaces.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
          {userRaces.length === 0 ? (
            <>
              <svg className="mx-auto w-16 h-16 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No Custom Races Yet</h3>
              <p className="text-white/70 mb-4">Create your first custom race to get started!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Create Your First Race
              </button>
            </>
          ) : (
            <>
              <svg className="mx-auto w-16 h-16 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No Races Found</h3>
              <p className="text-white/70">Try adjusting your search or filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRaces.map((race) => (
            <div
              key={race.id}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{race.name}</h3>
                  <p className={`font-medium mb-1 ${isUpcoming(race.date) ? 'text-blue-400' : 'text-white/70'}`}>
                    {formatDate(race.date)}
                    {isUpcoming(race.date) && (
                      <span className="ml-2 bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs">Upcoming</span>
                    )}
                  </p>
                  <p className="text-white/70 text-sm break-words">{race.location}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                    {getDistanceDisplay(race)}
                  </span>
                  {race.difficulty_score && (
                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                      Difficulty: {race.difficulty_score}/10
                    </span>
                  )}
                </div>

                {race.description && (
                  <p className="text-white/70 text-sm line-clamp-2 break-words">{race.description}</p>
                )}

                {race.website_url && (
                  <a
                    href={race.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(race)}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(race.id)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  disabled={actionLoading === race.id}
                >
                  {actionLoading === race.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Delete
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