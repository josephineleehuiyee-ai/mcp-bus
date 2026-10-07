import React from 'react';
import { User, Users, Accessibility, Bike, Clock, ChevronRight } from 'lucide-react';
import { StopDeparture, TransitRoute } from '../types/transit';

interface ArrivalCardProps {
  departure: StopDeparture;
  route?: TransitRoute;
  onSelectRoute?: (routeId: string) => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

export const ArrivalCard: React.FC<ArrivalCardProps> = ({
  departure,
  route,
  onSelectRoute,
  onSelectVehicle,
}) => {
  // Format countdown string
  const formatCountdown = (seconds: number) => {
    if (seconds <= 45) return 'DUE';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const isDueOrUnderFive = departure.etaSeconds < 300;
  const isDelayed = departure.isDelayed;

  // Occupancy silhouette helper
  const renderOccupancy = () => {
    const activeClass = "text-[#0B1528]";
    const inactiveClass = "text-[#CBD5E1]";

    let count = 1;
    let label = "Light Load";
    if (departure.occupancy === 'moderate') {
      count = 2;
      label = "Moderate";
    } else if (departure.occupancy === 'full') {
      count = 3;
      label = "Crowded";
    }

    return (
      <div className="flex items-center gap-1.5" title={`Vehicle capacity: ${departure.occupancyPercent}% (${label})`}>
        <div className="flex items-center -space-x-0.5">
          <User className={`w-3.5 h-3.5 ${count >= 1 ? activeClass : inactiveClass}`} />
          <User className={`w-3.5 h-3.5 ${count >= 2 ? activeClass : inactiveClass}`} />
          <User className={`w-3.5 h-3.5 ${count >= 3 ? (departure.occupancy === 'full' ? 'text-[#EF4444]' : activeClass) : inactiveClass}`} />
        </div>
        <span className="text-[11px] font-sans-custom text-[#64748B] font-medium hidden sm:inline">
          {departure.occupancyPercent}% full
        </span>
      </div>
    );
  };

  const badgeBg = route?.color || '#0B1528';
  const badgeText = route?.textColor || '#ffffff';

  return (
    <div
      onClick={() => {
        if (departure.vehicleId && onSelectVehicle) {
          onSelectVehicle(departure.vehicleId);
        } else if (onSelectRoute) {
          onSelectRoute(departure.routeId);
        }
      }}
      className="group relative bg-white border border-[#E2E8F0] hover:border-[#00C365]/60 hover:shadow-[0_4px_16px_-4px_rgba(11,21,40,0.1)] transition-all rounded-xl p-3.5 sm:p-4 cursor-pointer"
    >
      {/* 3-Column Visual Hierarchy */}
      <div className="grid grid-cols-12 items-center gap-3">
        
        {/* Column 1: Route Identifier Badge (Capsule/Rounded Rect, Space Grotesk) */}
        <div className="col-span-3 sm:col-span-2 flex flex-col items-start gap-1">
          <span
            style={{ backgroundColor: badgeBg, color: badgeText }}
            className="font-display font-bold text-xs sm:text-sm px-2.5 py-1 rounded-md tracking-wider uppercase shadow-xs flex items-center justify-center min-w-[52px] text-center"
          >
            {departure.routeId}
          </span>
          <span className="text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
            {route?.type || 'Bus'}
          </span>
        </div>

        {/* Column 2: Destination Title & Intermediate Stops */}
        <div className="col-span-6 sm:col-span-7 flex flex-col justify-center min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-display font-bold text-sm sm:text-base text-[#0B1528] tracking-tight truncate group-hover:text-[#006d36] transition-colors">
              {departure.destination}
            </h4>
            <span className="text-[10px] font-semibold bg-[#EFF4FF] text-[#006d36] px-1.5 py-0.5 rounded border border-[#D9E2FD]">
              {departure.platform}
            </span>
          </div>

          {departure.via && (
            <p className="text-xs text-[#64748B] font-sans-custom truncate mt-0.5">
              via {departure.via}
            </p>
          )}

          {/* Micro Amenities & Status */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#64748B]">
            {renderOccupancy()}
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1">
              {departure.isAccessible && (
                <span title="Step-free wheelchair ramp" className="flex items-center">
                  <Accessibility className="w-3 h-3 text-[#555E75]" />
                </span>
              )}
              {departure.hasBikeRack && (
                <span title="Front bike rack available" className="flex items-center">
                  <Bike className="w-3 h-3 text-[#555E75]" />
                </span>
              )}
            </div>
            {isDelayed && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-semibold text-[#855300] bg-[#F59E0B]/15 px-1.5 py-0.2 rounded font-sans-custom">
                  +{departure.delayMins}m delay
                </span>
              </>
            )}
          </div>
        </div>

        {/* Column 3: Real-Time Arrival Clock with Radiating Live Pulse Dot */}
        <div className="col-span-3 sm:col-span-3 flex flex-col items-end justify-center text-right">
          <div className="flex items-center gap-2">
            {departure.isLive && (
              <div className="relative flex items-center justify-center w-2.5 h-2.5" title="Live GPS Telemetry synced">
                <span className="absolute w-3 h-3 rounded-full bg-[#00C365] live-pulse-ring" />
                <span className="w-2 h-2 rounded-full bg-[#00C365]" />
              </div>
            )}
            <span
              className={`font-display text-lg sm:text-2xl font-bold tracking-tight tabular-nums ${
                isDelayed
                  ? 'text-[#F59E0B]'
                  : isDueOrUnderFive
                  ? 'text-[#00C365]'
                  : 'text-[#0B1528]'
              }`}
            >
              {formatCountdown(departure.etaSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#64748B] font-sans-custom mt-0.5">
            <Clock className="w-3 h-3" />
            <span>Sched {departure.scheduledTime}</span>
          </div>
        </div>

      </div>

      {/* Hover action affordance */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[#006d36]">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};
