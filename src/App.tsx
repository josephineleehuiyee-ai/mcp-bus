/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TransitMap } from './components/TransitMap';
import { DepartureBoard } from './components/DepartureBoard';
import { RouteInspector } from './components/RouteInspector';
import { TripPlanner } from './components/TripPlannerModal';
import { LtaDataMallView } from './components/LtaDataMallView';
import { VehicleTelemetryModal } from './components/VehicleTelemetryModal';
import { ServiceAlertsModal } from './components/ServiceAlertsModal';
import { TRANSIT_STOPS, TRANSIT_ROUTES, INITIAL_VEHICLES, SERVICE_ALERTS } from './data/transitData';
import { TransitVehicle, StopDeparture } from './types/transit';
import { generateDeparturesForStop } from './utils/transitUtils';
import { ChevronUp, ChevronDown, MapPin, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'radar' | 'board' | 'routes' | 'planner' | 'lta'>('radar');
  const [selectedStopId, setSelectedStopId] = useState<string>('stop-civic-hub');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<TransitVehicle[]>(INITIAL_VEHICLES);
  const [isSimulatingRushHour, setIsSimulatingRushHour] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [mobileDrawerSnap, setMobileDrawerSnap] = useState<'peek' | 'half' | 'full'>('half');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Bookmarks persistence
  const [bookmarkedStopIds, setBookmarkedStopIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pulsebus_bookmarked_stops');
      return saved ? JSON.parse(saved) : ['stop-civic-hub'];
    } catch {
      return ['stop-civic-hub'];
    }
  });

  const toggleBookmarkStop = useCallback((stopId: string) => {
    setBookmarkedStopIds((prev) => {
      const updated = prev.includes(stopId) ? prev.filter((id) => id !== stopId) : [...prev, stopId];
      try {
        localStorage.setItem('pulsebus_bookmarked_stops', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // Currently active stop
  const currentStop = useMemo(
    () => TRANSIT_STOPS.find((s) => s.id === selectedStopId) || TRANSIT_STOPS[0],
    [selectedStopId]
  );

  // Currently active route
  const currentRoute = useMemo(
    () => TRANSIT_ROUTES.find((r) => r.id === (selectedRouteId || '42')) || TRANSIT_ROUTES[0],
    [selectedRouteId]
  );

  // Dynamic Departures for current stop
  const [departures, setDepartures] = useState<StopDeparture[]>(() =>
    generateDeparturesForStop(TRANSIT_STOPS[0], TRANSIT_ROUTES, INITIAL_VEHICLES, false)
  );

  // Re-generate departures whenever stop, rush hour, or vehicles change
  const refreshDepartures = useCallback(() => {
    const deps = generateDeparturesForStop(currentStop, TRANSIT_ROUTES, vehicles, isSimulatingRushHour);
    setDepartures(deps);
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [currentStop, vehicles, isSimulatingRushHour]);

  useEffect(() => {
    refreshDepartures();
  }, [selectedStopId, isSimulatingRushHour]);

  // Real-time second tick engine:
  // 1. Decrements arrival countdowns by 1 second
  // 2. Smoothly moves vehicles between stop coordinates
  // 3. Updates telemetry latency ping
  useEffect(() => {
    const timer = setInterval(() => {
      // Decrement departure seconds
      setDepartures((prev) =>
        prev.map((d) => {
          if (d.etaSeconds <= 15) {
            // Cycle back to regular headway when arrived
            const route = TRANSIT_ROUTES.find((r) => r.id === d.routeId);
            return {
              ...d,
              etaSeconds: (route?.frequencyMins || 8) * 60,
            };
          }
          return {
            ...d,
            etaSeconds: d.etaSeconds - 1,
          };
        })
      );

      // Smooth vehicle progress & ping cycle
      setVehicles((prev) =>
        prev.map((veh) => {
          let nextProgress = veh.progressBetweenStops + 0.035;
          let currentStopId = veh.currentStopId;
          let nextStopId = veh.nextStopId;
          let direction = veh.direction;

          const route = TRANSIT_ROUTES.find((r) => r.id === veh.routeId);
          const stopList = direction === 'outbound' ? (route?.stopsOutbound || []) : (route?.stopsInbound || []);

          if (nextProgress >= 1) {
            nextProgress = 0;
            const nextIdx = stopList.indexOf(nextStopId);
            if (nextIdx !== -1 && nextIdx < stopList.length - 1) {
              currentStopId = nextStopId;
              nextStopId = stopList[nextIdx + 1];
            } else {
              // Turn around at terminus
              direction = direction === 'outbound' ? 'inbound' : 'outbound';
              const reversedList = direction === 'outbound' ? (route?.stopsOutbound || []) : (route?.stopsInbound || []);
              currentStopId = reversedList[0] || currentStopId;
              nextStopId = reversedList[1] || nextStopId;
            }
          }

          // Interpolate coordinate
          const cStop = TRANSIT_STOPS.find((s) => s.id === currentStopId);
          const nStop = TRANSIT_STOPS.find((s) => s.id === nextStopId);
          const x = cStop && nStop ? cStop.x + (nStop.x - cStop.x) * nextProgress : veh.x;
          const y = cStop && nStop ? cStop.y + (nStop.y - cStop.y) * nextProgress : veh.y;

          // Ping latency cycle (1 to 7 seconds)
          const newPing = veh.lastPingSecondsAgo >= 7 ? 1 : veh.lastPingSecondsAgo + 1;

          return {
            ...veh,
            currentStopId,
            nextStopId,
            direction,
            progressBetweenStops: nextProgress,
            x: Math.round(x),
            y: Math.round(y),
            lastPingSecondsAgo: newPing,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Focused vehicle for telemetry modal
  const activeVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId),
    [selectedVehicleId, vehicles]
  );

  const activeVehicleRoute = useMemo(
    () => (activeVehicle ? TRANSIT_ROUTES.find((r) => r.id === activeVehicle.routeId) : undefined),
    [activeVehicle]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0B1528]">
      {/* Top Bar with Brand, Nav, and Status */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertCount={SERVICE_ALERTS.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        isSimulatingRushHour={isSimulatingRushHour}
        onToggleRushHour={() => setIsSimulatingRushHour((prev) => !prev)}
        liveVehiclesCount={vehicles.length}
      />

      {/* Main View Area */}
      <main className="flex-1 relative flex overflow-hidden">
        {activeTab === 'radar' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full w-full relative">
            {/* Desktop Left Drawer (420px Fixed Panel Architecture per Design Spec) */}
            <div className="hidden lg:flex w-[420px] shrink-0 h-full border-r border-[#E2E8F0] shadow-sm flex-col z-20 bg-white">
              <DepartureBoard
                currentStop={currentStop}
                allStops={TRANSIT_STOPS}
                routes={TRANSIT_ROUTES}
                departures={departures}
                onSelectStop={(id) => {
                  setSelectedStopId(id);
                }}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                onSelectVehicle={(id) => setSelectedVehicleId(id)}
                bookmarkedStopIds={bookmarkedStopIds}
                onToggleBookmarkStop={toggleBookmarkStop}
                lastSyncTime={lastSyncTime}
                onRefresh={refreshDepartures}
              />
            </div>

            {/* Fluid Map Canvas */}
            <div className="flex-1 h-full w-full relative">
              <TransitMap
                stops={TRANSIT_STOPS}
                routes={TRANSIT_ROUTES}
                vehicles={vehicles}
                selectedStopId={selectedStopId}
                onSelectStop={(id) => {
                  setSelectedStopId(id);
                  setMobileDrawerSnap('half');
                }}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={(id) => setSelectedVehicleId(id)}
              />
            </div>

            {/* Mobile Snap Drawer (peek, half, full per Design Spec) */}
            <div
              className={`lg:hidden absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl border-t border-[#E2E8F0] transition-all duration-300 flex flex-col ${
                mobileDrawerSnap === 'peek'
                  ? 'h-24'
                  : mobileDrawerSnap === 'half'
                  ? 'h-[55%]'
                  : 'h-[90%]'
              }`}
            >
              {/* Drawer Drag Bar & Header Toggle */}
              <div
                onClick={() => {
                  setMobileDrawerSnap((prev) =>
                    prev === 'peek' ? 'half' : prev === 'half' ? 'full' : 'peek'
                  );
                }}
                className="w-full pt-2 pb-2 flex flex-col items-center justify-center cursor-pointer select-none bg-white rounded-t-2xl border-b border-slate-100"
              >
                <div className="w-10 h-1.5 bg-slate-300 rounded-full mb-1" />
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B1528]">
                  <span>{currentStop.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-[#006d36] font-display">
                    {departures[0] ? `Next in ${Math.ceil(departures[0].etaSeconds / 60)}m` : 'Live'}
                  </span>
                  {mobileDrawerSnap === 'peek' ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Scrollable Departure Board content on mobile */}
              <div className="flex-1 overflow-hidden">
                <DepartureBoard
                  currentStop={currentStop}
                  allStops={TRANSIT_STOPS}
                  routes={TRANSIT_ROUTES}
                  departures={departures}
                  onSelectStop={(id) => {
                    setSelectedStopId(id);
                  }}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  onSelectVehicle={(id) => setSelectedVehicleId(id)}
                  bookmarkedStopIds={bookmarkedStopIds}
                  onToggleBookmarkStop={toggleBookmarkStop}
                  lastSyncTime={lastSyncTime}
                  onRefresh={refreshDepartures}
                />
              </div>
            </div>
          </div>
        )}

        {/* Departure Board Focused View */}
        {activeTab === 'board' && (
          <div className="flex-1 flex max-w-4xl mx-auto w-full h-full bg-white border-x border-[#E2E8F0] shadow-sm">
            <DepartureBoard
              currentStop={currentStop}
              allStops={TRANSIT_STOPS}
              routes={TRANSIT_ROUTES}
              departures={departures}
              onSelectStop={(id) => setSelectedStopId(id)}
              onSelectRoute={(id) => {
                setSelectedRouteId(id);
                setActiveTab('routes');
              }}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              bookmarkedStopIds={bookmarkedStopIds}
              onToggleBookmarkStop={toggleBookmarkStop}
              lastSyncTime={lastSyncTime}
              onRefresh={refreshDepartures}
            />
          </div>
        )}

        {/* Route Corridors Inspector View */}
        {activeTab === 'routes' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full w-full">
            <div className="w-full lg:w-[480px] shrink-0 h-full border-r border-[#E2E8F0] bg-white z-10">
              <RouteInspector
                selectedRoute={currentRoute}
                allRoutes={TRANSIT_ROUTES}
                stops={TRANSIT_STOPS}
                vehicles={vehicles}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                onSelectStop={(id) => {
                  setSelectedStopId(id);
                  setActiveTab('radar');
                }}
                onSelectVehicle={(id) => setSelectedVehicleId(id)}
              />
            </div>
            <div className="hidden lg:flex flex-1 h-full">
              <TransitMap
                stops={TRANSIT_STOPS}
                routes={TRANSIT_ROUTES}
                vehicles={vehicles}
                selectedStopId={selectedStopId}
                onSelectStop={(id) => setSelectedStopId(id)}
                selectedRouteId={currentRoute.id}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={(id) => setSelectedVehicleId(id)}
              />
            </div>
          </div>
        )}

        {/* Trip Planner View */}
        {activeTab === 'planner' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full w-full">
            <div className="w-full lg:w-[480px] shrink-0 h-full border-r border-[#E2E8F0] bg-white z-10">
              <TripPlanner
                stops={TRANSIT_STOPS}
                routes={TRANSIT_ROUTES}
                onSelectRoute={(id) => {
                  setSelectedRouteId(id);
                  setActiveTab('routes');
                }}
                onSelectStop={(id) => {
                  setSelectedStopId(id);
                  setActiveTab('radar');
                }}
              />
            </div>
            <div className="hidden lg:flex flex-1 h-full">
              <TransitMap
                stops={TRANSIT_STOPS}
                routes={TRANSIT_ROUTES}
                vehicles={vehicles}
                selectedStopId={selectedStopId}
                onSelectStop={(id) => setSelectedStopId(id)}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={(id) => setSelectedVehicleId(id)}
              />
            </div>
          </div>
        )}

        {/* Singapore LTA DataMall v3 Live Bus Arrival View */}
        {activeTab === 'lta' && (
          <div className="flex-1 flex h-full w-full overflow-hidden">
            <LtaDataMallView />
          </div>
        )}
      </main>

      {/* Vehicle Telemetry Modal */}
      {activeVehicle && (
        <VehicleTelemetryModal
          vehicle={activeVehicle}
          route={activeVehicleRoute}
          stops={TRANSIT_STOPS}
          onClose={() => setSelectedVehicleId(null)}
          onFocusStop={(stopId) => {
            setSelectedStopId(stopId);
            setActiveTab('radar');
          }}
        />
      )}

      {/* Service Advisories & Alerts Modal */}
      {isAlertsOpen && (
        <ServiceAlertsModal
          alerts={SERVICE_ALERTS}
          routes={TRANSIT_ROUTES}
          onClose={() => setIsAlertsOpen(false)}
          onSelectRoute={(id) => {
            setSelectedRouteId(id);
            setActiveTab('routes');
          }}
        />
      )}
    </div>
  );
}
