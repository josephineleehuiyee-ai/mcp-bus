import React, { useState } from 'react';
import { ArrowUpDown, MapPin, Navigation, Clock, DollarSign, Footprints, Bus, CheckCircle2, Leaf } from 'lucide-react';
import { TransitStop, TransitRoute } from '../types/transit';

interface TripPlannerProps {
  stops: TransitStop[];
  routes: TransitRoute[];
  onSelectRoute: (routeId: string) => void;
  onSelectStop: (stopId: string) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  stops,
  routes,
  onSelectRoute,
  onSelectStop,
}) => {
  const [originId, setOriginId] = useState<string>('stop-grand-univ');
  const [destId, setDestId] = useState<string>('stop-union-station');
  const [selectedItineraryIndex, setSelectedItineraryIndex] = useState<number>(0);

  const originStop = stops.find((s) => s.id === originId) || stops[0];
  const destStop = stops.find((s) => s.id === destId) || stops[1];

  const handleSwap = () => {
    setOriginId(destId);
    setDestId(originId);
  };

  // Find direct route or transfer
  const directRoute = routes.find(
    (r) =>
      (r.stopsOutbound.includes(originId) && r.stopsOutbound.includes(destId)) ||
      (r.stopsInbound.includes(originId) && r.stopsInbound.includes(destId))
  );

  // Computed itineraries
  const itineraries = [
    {
      id: 'itin-1',
      title: directRoute ? `Direct via Line ${directRoute.number}` : 'Optimized Transfer',
      durationMins: directRoute ? 14 : 22,
      departureTime: 'Now (In 2 mins)',
      arrivalTime: directRoute ? '16 mins from now' : '24 mins from now',
      fare: directRoute ? directRoute.fare : 2.75,
      walkMins: 3,
      co2SavedKg: 1.6,
      legs: directRoute
        ? [
            {
              type: 'walk',
              text: `Walk 200m to ${originStop.name}`,
              duration: '2 min',
            },
            {
              type: 'bus',
              route: directRoute,
              from: originStop.name,
              to: destStop.name,
              duration: '11 min',
              stopsCount: 3,
            },
            {
              type: 'walk',
              text: `Arrive at ${destStop.name}`,
              duration: '1 min',
            },
          ]
        : [
            {
              type: 'walk',
              text: `Walk 150m to ${originStop.name}`,
              duration: '2 min',
            },
            {
              type: 'bus',
              route: routes[0],
              from: originStop.name,
              to: 'Civic Center Plaza',
              duration: '9 min',
              stopsCount: 2,
            },
            {
              type: 'transfer',
              text: 'Cross-platform transfer at Civic Center Plaza (Bay B -> Bay A)',
              duration: '3 min',
            },
            {
              type: 'bus',
              route: routes[1] || routes[0],
              from: 'Civic Center Plaza',
              to: destStop.name,
              duration: '7 min',
              stopsCount: 2,
            },
          ],
    },
    {
      id: 'itin-2',
      title: 'Alternative Express Corridor',
      durationMins: 19,
      departureTime: 'In 6 mins',
      arrivalTime: '25 mins from now',
      fare: 2.50,
      walkMins: 5,
      co2SavedKg: 1.4,
      legs: [
        {
          type: 'walk',
          text: `Walk 350m to arterial connector`,
          duration: '4 min',
        },
        {
          type: 'bus',
          route: routes[1] || routes[0],
          from: originStop.name,
          to: destStop.name,
          duration: '14 min',
          stopsCount: 4,
        },
        {
          type: 'walk',
          text: `Step off at ${destStop.name}`,
          duration: '1 min',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Route Query Formulation Panel */}
      <div className="p-4 sm:p-5 bg-white border-b border-[#E2E8F0] space-y-3">
        <h3 className="font-display text-base font-bold text-[#0B1528] tracking-tight">
          Precision Civic Journey Engine
        </h3>

        <div className="relative bg-[#EFF4FF] border border-[#D9E2FD] rounded-xl p-3.5 space-y-3">
          {/* Origin selector */}
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00C365] bg-white flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C365]" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase">Origin Node</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0B1528] focus:outline-none focus:ring-2 focus:ring-[#00C365]"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Trigger Button */}
          <div className="flex justify-end pr-3 -my-1">
            <button
              onClick={handleSwap}
              title="Reverse Journey"
              className="w-7 h-7 rounded-full bg-white border border-[#CBD5E1] text-[#0B1528] hover:bg-[#F8FAFC] shadow-2xs flex items-center justify-center cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination selector */}
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#EF4444] bg-white flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase">Destination Node</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0B1528] focus:outline-none focus:ring-2 focus:ring-[#00C365]"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-[#64748B] font-medium shrink-0">Picks:</span>
          {stops.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                if (originId !== s.id) setDestId(s.id);
              }}
              className="px-2.5 py-1 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B1528] font-semibold text-[11px] whitespace-nowrap cursor-pointer transition-colors"
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Itinerary Options List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-display">
          Recommended Itineraries ({itineraries.length})
        </h4>

        {itineraries.map((itin, idx) => {
          const isSelected = selectedItineraryIndex === idx;
          return (
            <div
              key={itin.id}
              onClick={() => setSelectedItineraryIndex(idx)}
              className={`bg-white border transition-all rounded-xl p-4 cursor-pointer ${
                isSelected
                  ? 'border-[#00C365] shadow-md ring-1 ring-[#00C365]'
                  : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-[#0B1528]">
                      {itin.title}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold bg-[#00C365]/15 text-[#006d36] px-1.5 py-0.5 rounded">
                        Fastest
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2">
                    <span>Departs: <strong className="text-[#0B1528]">{itin.departureTime}</strong></span>
                    <span>·</span>
                    <span>Arrives: <strong className="text-[#0B1528]">{itin.arrivalTime}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display text-xl font-bold text-[#0B1528] tabular-nums">
                    {itin.durationMins} <span className="text-xs font-normal text-[#64748B]">min</span>
                  </div>
                  <div className="text-xs text-[#006d36] font-semibold">
                    ${itin.fare.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Legs Preview Bar */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F1F5F9] text-xs text-[#555E75]">
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{itin.walkMins}m walk</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5 text-[#006d36]">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>-{itin.co2SavedKg}kg CO₂</span>
                </div>
              </div>

              {/* Expanded Step-by-Step Breakdown if Selected */}
              {isSelected && (
                <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-3">
                  <h5 className="text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                    Step-by-Step Directions
                  </h5>
                  <div className="space-y-2.5">
                    {itin.legs.map((leg, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-5 h-5 rounded-full bg-[#EFF4FF] border border-[#D9E2FD] text-[#006d36] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          {lIdx + 1}
                        </div>
                        <div className="flex-1">
                          {leg.type === 'bus' ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  style={{ backgroundColor: leg.route?.color, color: leg.route?.textColor }}
                                  className="font-display font-bold text-[10px] px-1.5 py-0.5 rounded"
                                >
                                  Line {leg.route?.number}
                                </span>
                                <span className="font-semibold text-[#0B1528]">
                                  Ride {leg.duration} ({leg.stopsCount} stops)
                                </span>
                              </div>
                              <div className="text-[11px] text-[#64748B] mt-0.5">
                                Board at {leg.from} → Disembark at {leg.to}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[#555E75]">
                              {leg.text} ({leg.duration})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (directRoute) {
                        onSelectRoute(directRoute.id);
                      }
                      onSelectStop(originStop.id);
                    }}
                    className="w-full mt-3 py-2.5 rounded-lg bg-[#00C365] hover:bg-[#00b05b] text-[#004922] font-display font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Track on Live Radar</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
