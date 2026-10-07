import React, { useState } from 'react';
import { ArrowLeftRight, Clock, DollarSign, Bus, MapPin, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { TransitRoute, TransitStop, TransitVehicle } from '../types/transit';

interface RouteInspectorProps {
  selectedRoute: TransitRoute;
  allRoutes: TransitRoute[];
  stops: TransitStop[];
  vehicles: TransitVehicle[];
  onSelectRoute: (routeId: string) => void;
  onSelectStop: (stopId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export const RouteInspector: React.FC<RouteInspectorProps> = ({
  selectedRoute,
  allRoutes,
  stops,
  vehicles,
  onSelectRoute,
  onSelectStop,
  onSelectVehicle,
}) => {
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');

  const stopSequenceIds = direction === 'outbound'
    ? selectedRoute.stopsOutbound
    : selectedRoute.stopsInbound;

  const currentHeadsign = direction === 'outbound'
    ? selectedRoute.headsignOutbound
    : selectedRoute.headsignInbound;

  // Active buses running on this route in this direction
  const routeVehicles = vehicles.filter(
    (v) => v.routeId === selectedRoute.id && v.direction === direction
  );

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Route Switcher Top Header */}
      <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] space-y-4">
        {/* Route Selector Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allRoutes.map((r) => {
            const isActive = r.id === selectedRoute.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoute(r.id)}
                style={isActive ? { backgroundColor: r.color, color: r.textColor } : undefined}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'shadow-sm ring-2 ring-black/10'
                    : 'bg-[#EFF4FF] text-[#0B1528] hover:bg-[#D9E2FD] border border-[#D9E2FD]'
                }`}
              >
                Line {r.number}
              </button>
            );
          })}
        </div>

        {/* Selected Route Info Banner */}
        <div className="bg-[#0B1528] text-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                style={{ backgroundColor: selectedRoute.color, color: selectedRoute.textColor }}
                className="font-display font-bold text-lg sm:text-xl px-3 py-1.5 rounded-lg tracking-wider"
              >
                {selectedRoute.number}
              </span>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold tracking-tight">
                  {selectedRoute.name}
                </h3>
                <span className="text-xs text-slate-300 font-medium">
                  {selectedRoute.type} Service · {selectedRoute.description}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00C365]" />
              <span className="text-slate-300">Every <strong className="text-white font-display">{selectedRoute.frequencyMins}m</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#00C365]" />
              <span className="text-slate-300">Fare <strong className="text-white font-display">${selectedRoute.fare.toFixed(2)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-[#00C365]" />
              <span className="text-slate-300">Active <strong className="text-white font-display">{routeVehicles.length} Buses</strong></span>
            </div>
          </div>
        </div>

        {/* Direction Switcher Button */}
        <div className="flex items-center justify-between bg-[#EFF4FF] border border-[#D9E2FD] p-2.5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Current Direction
            </span>
            <span className="font-display font-bold text-sm text-[#0B1528] truncate max-w-[220px]">
              Towards {currentHeadsign}
            </span>
          </div>

          <button
            onClick={() => setDirection((d) => (d === 'outbound' ? 'inbound' : 'outbound'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0B1528] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#006d36]" />
            <span>Reverse</span>
          </button>
        </div>
      </div>

      {/* Vertical Stop Sequence Timeline (Civic Transit Diagram) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4 font-display flex items-center justify-between">
          <span>Corridor Stop Sequence</span>
          <span className="text-[11px] font-normal normal-case text-[#555E75]">
            {stopSequenceIds.length} Stations
          </span>
        </h4>

        <div className="relative pl-6 space-y-6">
          {/* Vertical line through all stops */}
          <div
            style={{ backgroundColor: selectedRoute.color }}
            className="absolute left-[11px] top-3 bottom-4 w-1 rounded-full opacity-80"
          />

          {stopSequenceIds.map((stopId, index) => {
            const stop = stops.find((s) => s.id === stopId);
            if (!stop) return null;

            const isFirst = index === 0;
            const isLast = index === stopSequenceIds.length - 1;

            // Check if any bus is approaching this stop
            const approachingBuses = routeVehicles.filter(
              (v) => v.nextStopId === stop.id
            );

            // Estimated arrival from now
            const etaMinutes = index * 3 + 2;

            return (
              <div key={stop.id} className="relative group">
                {/* Timeline Stop Node Node Indicator */}
                <div
                  style={{
                    backgroundColor: isFirst || isLast ? selectedRoute.color : '#FFFFFF',
                    borderColor: selectedRoute.color,
                  }}
                  className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-[3px] flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 z-10 ${
                    isFirst || isLast ? 'ring-2 ring-white' : ''
                  }`}
                >
                  {(isFirst || isLast) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                {/* Stop Card */}
                <div
                  onClick={() => onSelectStop(stop.id)}
                  className="bg-white border border-[#E2E8F0] hover:border-[#00C365] hover:shadow-xs rounded-xl p-3.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xs text-[#0B1528]">
                          {stop.code}
                        </span>
                        {stop.isTransferHub && (
                          <span className="text-[10px] font-bold bg-[#D9E2FD] text-[#0B1528] px-1.5 py-0.2 rounded uppercase">
                            Transfer Hub
                          </span>
                        )}
                      </div>
                      <h5 className="font-display font-bold text-sm text-[#0B1528] mt-0.5 group-hover:text-[#006d36] transition-colors">
                        {stop.name}
                      </h5>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-bold text-xs text-[#006d36] bg-[#EFF4FF] px-2 py-0.5 rounded tabular-nums">
                        +{etaMinutes}m ETA
                      </span>
                    </div>
                  </div>

                  {/* Transfer connections */}
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-xs text-[#64748B]">
                    <span className="text-[11px]">Connect to:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {stop.routesServing
                        .filter((rid) => rid !== selectedRoute.id)
                        .map((rid) => {
                          const routeObj = allRoutes.find((x) => x.id === rid);
                          return (
                            <span
                              key={rid}
                              style={{ backgroundColor: routeObj?.color || '#0B1528', color: routeObj?.textColor || '#ffffff' }}
                              className="font-display font-bold text-[10px] px-1.5 py-0.2 rounded"
                            >
                              {rid}
                            </span>
                          );
                        })}
                      {stop.routesServing.length === 1 && (
                        <span className="text-[11px] text-slate-400">Direct Route</span>
                      )}
                    </div>
                  </div>

                  {/* Bus approaching alert banner */}
                  {approachingBuses.length > 0 && (
                    <div className="mt-2.5 bg-[#EFF4FF] border border-[#D9E2FD] rounded-lg p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#006d36]">
                        <div className="relative flex items-center justify-center w-2 h-2">
                          <span className="absolute w-2 h-2 rounded-full bg-[#00C365] live-pulse-ring" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00C365]" />
                        </div>
                        <span className="font-bold">
                          Bus {approachingBuses[0].vehicleNumber} approaching
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(approachingBuses[0].id);
                        }}
                        className="text-[11px] font-semibold text-[#0B1528] hover:underline"
                      >
                        Inspect Telemetry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
