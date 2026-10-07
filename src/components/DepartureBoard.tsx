import React, { useState, useMemo } from 'react';
import { Search, X, Star, BookmarkCheck, Accessibility, Bike, Home, Navigation, RefreshCw } from 'lucide-react';
import { TransitStop, TransitRoute, StopDeparture } from '../types/transit';
import { ArrivalCard } from './ArrivalCard';

interface DepartureBoardProps {
  currentStop: TransitStop;
  allStops: TransitStop[];
  routes: TransitRoute[];
  departures: StopDeparture[];
  onSelectStop: (stopId: string) => void;
  onSelectRoute: (routeId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  bookmarkedStopIds: string[];
  onToggleBookmarkStop: (stopId: string) => void;
  lastSyncTime: string;
  onRefresh: () => void;
}

export const DepartureBoard: React.FC<DepartureBoardProps> = ({
  currentStop,
  allStops,
  routes,
  departures,
  onSelectStop,
  onSelectRoute,
  onSelectVehicle,
  bookmarkedStopIds,
  onToggleBookmarkStop,
  lastSyncTime,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'BRT' | 'Express' | 'Circulator' | 'bookmarked'>('all');

  const isCurrentBookmarked = bookmarkedStopIds.includes(currentStop.id);

  // Filtered stops for search dropdown
  const filteredStops = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allStops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.routesServing.some((r) => r.toLowerCase().includes(q))
    );
  }, [searchQuery, allStops]);

  // Filtered departures
  const filteredDepartures = useMemo(() => {
    return departures.filter((dep) => {
      const route = routes.find((r) => r.id === dep.routeId);
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'bookmarked') return isCurrentBookmarked;
      return route?.type === selectedFilter;
    });
  }, [departures, selectedFilter, routes, isCurrentBookmarked]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header & Search Bar with instant-clear target per design brief */}
      <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#64748B]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stop name, route number, or stop code..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0B1528] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C365] focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0B1528] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {filteredStops.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-[#F1F5F9] z-30">
            {filteredStops.map((stop) => (
              <button
                key={stop.id}
                onClick={() => {
                  onSelectStop(stop.id);
                  setSearchQuery('');
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#EFF4FF] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-[#0B1528] group-hover:text-[#006d36]">
                    {stop.name}
                  </div>
                  <div className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                    <span className="font-display font-medium">{stop.code}</span>
                    <span>·</span>
                    <span>Routes: {stop.routesServing.join(', ')}</span>
                  </div>
                </div>
                {stop.isTransferHub && (
                  <span className="text-[10px] font-bold bg-[#D9E2FD] text-[#0B1528] px-2 py-0.5 rounded uppercase">
                    Hub
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Current Stop Tactical Card */}
        <div className="bg-[#EFF4FF] border border-[#D9E2FD] rounded-xl p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xs bg-[#0B1528] text-white px-2 py-0.5 rounded tracking-wide">
                  {currentStop.code}
                </span>
                <span className="text-xs font-semibold text-[#555E75]">
                  {currentStop.zone}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#0B1528] tracking-tight mt-1">
                {currentStop.name}
              </h2>
            </div>

            {/* Bookmark button with 48px touch target */}
            <button
              onClick={() => onToggleBookmarkStop(currentStop.id)}
              title={isCurrentBookmarked ? 'Remove Bookmark' : 'Bookmark this stop'}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                isCurrentBookmarked
                  ? 'bg-[#00C365] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#0B1528] border border-[#CBD5E1]'
              }`}
            >
              <Star className={`w-5 h-5 ${isCurrentBookmarked ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Amenities & Serving Lines */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#D9E2FD]/80 text-xs text-[#555E75]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#64748B]">Lines:</span>
              <div className="flex items-center gap-1">
                {currentStop.routesServing.map((rId) => {
                  const r = routes.find((x) => x.id === rId);
                  return (
                    <button
                      key={rId}
                      onClick={() => onSelectRoute(rId)}
                      style={{ backgroundColor: r?.color || '#0B1528', color: r?.textColor || '#ffffff' }}
                      className="font-display font-bold text-[11px] px-1.5 py-0.5 rounded hover:opacity-85 transition-opacity cursor-pointer"
                    >
                      {rId}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentStop.wheelchairAccessible && (
                <span title="Wheelchair accessible platform" className="flex items-center">
                  <Accessibility className="w-3.5 h-3.5 text-[#006d36]" />
                </span>
              )}
              {currentStop.hasBikes && (
                <span title="Bike share rack at stop" className="flex items-center">
                  <Bike className="w-3.5 h-3.5 text-[#006d36]" />
                </span>
              )}
              {currentStop.hasShelter && (
                <span className="text-[11px] font-semibold text-[#0B1528] bg-white/80 px-1.5 py-0.5 rounded">
                  Shelter
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Chips per design brief (capsule-shaped toggling between subtle gray and solid navy) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#0B1528] text-white shadow-xs'
                : 'bg-white text-[#555E75] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            All Departures ({departures.length})
          </button>
          <button
            onClick={() => setSelectedFilter('BRT')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === 'BRT'
                ? 'bg-[#00C365] text-[#0B1528] font-bold shadow-xs'
                : 'bg-white text-[#555E75] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            Rapid BRT
          </button>
          <button
            onClick={() => setSelectedFilter('Express')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === 'Express'
                ? 'bg-[#0B1528] text-white shadow-xs'
                : 'bg-white text-[#555E75] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            Express
          </button>
          <button
            onClick={() => setSelectedFilter('Circulator')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === 'Circulator'
                ? 'bg-[#F59E0B] text-[#0B1528] font-bold shadow-xs'
                : 'bg-white text-[#555E75] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            Circulator
          </button>
        </div>
      </div>

      {/* Real-Time Departure List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C365] live-pulse-ring" />
            <span className="font-semibold text-[#0B1528]">LIVE GPS COUNTDOWN</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Sync: {lastSyncTime}</span>
            <button
              onClick={onRefresh}
              title="Refresh departures"
              className="hover:text-[#0B1528] transition-colors p-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredDepartures.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-[#64748B]">
            <p className="font-semibold text-sm text-[#0B1528]">No departures match selected filter.</p>
            <p className="text-xs mt-1">Try switching to "All Departures" or inspect another stop.</p>
          </div>
        ) : (
          filteredDepartures.map((departure) => {
            const route = routes.find((r) => r.id === departure.routeId);
            return (
              <ArrivalCard
                key={departure.id}
                departure={departure}
                route={route}
                onSelectRoute={onSelectRoute}
                onSelectVehicle={onSelectVehicle}
              />
            );
          })
        )}

        {/* Quick Stop Switcher Rail */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-display">
            Popular Station Nodes
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {allStops.slice(0, 6).map((stop) => (
              <button
                key={stop.id}
                onClick={() => onSelectStop(stop.id)}
                className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  stop.id === currentStop.id
                    ? 'bg-[#0B1528] text-white border-[#0B1528]'
                    : 'bg-white text-[#0B1528] border-[#E2E8F0] hover:bg-[#EFF4FF]'
                }`}
              >
                <div className="truncate">{stop.name}</div>
                <div className={`text-[10px] ${stop.id === currentStop.id ? 'text-slate-300' : 'text-[#64748B]'}`}>
                  {stop.routesServing.join(' · ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
