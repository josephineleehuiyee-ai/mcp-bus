import React from 'react';
import { X, Bus, BatteryCharging, Gauge, Users, MapPin, Radio, ShieldCheck, UserCheck } from 'lucide-react';
import { TransitVehicle, TransitRoute, TransitStop } from '../types/transit';

interface VehicleTelemetryModalProps {
  vehicle: TransitVehicle;
  route?: TransitRoute;
  stops: TransitStop[];
  onClose: () => void;
  onFocusStop: (stopId: string) => void;
}

export const VehicleTelemetryModal: React.FC<VehicleTelemetryModalProps> = ({
  vehicle,
  route,
  stops,
  onClose,
  onFocusStop,
}) => {
  const currentStop = stops.find((s) => s.id === vehicle.currentStopId);
  const nextStop = stops.find((s) => s.id === vehicle.nextStopId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0B1528] text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
              <Bus className="w-5 h-5 text-[#00C365]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white">
                  {vehicle.vehicleNumber}
                </span>
                <span
                  style={{ backgroundColor: route?.color || '#00C365', color: route?.textColor || '#000000' }}
                  className="font-display font-bold text-[11px] px-2 py-0.5 rounded uppercase"
                >
                  Line {vehicle.routeId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-sans-custom">
                {vehicle.model}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* GPS Ping Bar */}
          <div className="flex items-center justify-between bg-[#EFF4FF] border border-[#D9E2FD] p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-2.5 h-2.5">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-[#00C365] live-pulse-ring" />
                <span className="w-2 h-2 rounded-full bg-[#00C365]" />
              </div>
              <span className="font-semibold text-[#006d36]">
                Telemetry Stream Active
              </span>
            </div>
            <span className="text-[#555E75] font-sans-custom">
              Last ping: <strong className="text-[#0B1528] font-display">{vehicle.lastPingSecondsAgo}s ago</strong>
            </span>
          </div>

          {/* Speed & Occupancy Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                <Gauge className="w-3.5 h-3.5 text-[#006d36]" />
                <span className="font-medium">Cruising Velocity</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#0B1528] tabular-nums">
                {vehicle.speedMph} <span className="text-xs font-normal text-[#64748B]">mph</span>
              </div>
              <div className="text-[11px] text-[#006d36] font-semibold mt-0.5">
                Transit Signal Priority: Active
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                <Users className="w-3.5 h-3.5 text-[#006d36]" />
                <span className="font-medium">Passenger Load</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#0B1528] tabular-nums">
                {vehicle.occupancyPercent}%
              </div>
              <div className="text-[11px] text-[#64748B] capitalize mt-0.5">
                {vehicle.occupancy} Crowding Level
              </div>
            </div>
          </div>

          {/* Route Progression */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Approach Vector</span>
              <span className="font-display font-bold text-[#0B1528]">
                Direction: {vehicle.direction === 'outbound' ? 'Outbound' : 'Inbound'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00C365]" />
              <div className="flex-1">
                <span className="text-[10px] text-[#64748B] block">Next Station Stop</span>
                <span className="font-display font-bold text-sm text-[#0B1528]">
                  {nextStop?.name || 'In Transit'}
                </span>
              </div>
              {nextStop && (
                <button
                  onClick={() => {
                    onFocusStop(nextStop.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-[#EFF4FF] hover:bg-[#D9E2FD] text-xs font-semibold text-[#006d36] transition-colors cursor-pointer"
                >
                  View Stop
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.round(vehicle.progressBetweenStops * 100)}%` }}
                className="h-full bg-[#00C365] rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Hardware & Operator Metadata */}
          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-[#006d36]" />
              <span>EV Battery: 88%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#555E75]" />
              <span>{vehicle.driverId}</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B1528] text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
