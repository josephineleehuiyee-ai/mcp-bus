import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Bus, Navigation, Layers, ShieldCheck, MapPin } from 'lucide-react';
import { TransitStop, TransitRoute, TransitVehicle } from '../types/transit';

interface TransitMapProps {
  stops: TransitStop[];
  routes: TransitRoute[];
  vehicles: TransitVehicle[];
  selectedStopId: string;
  onSelectStop: (stopId: string) => void;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null) => void;
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
}

export const TransitMap: React.FC<TransitMapProps> = ({
  stops,
  routes,
  vehicles,
  selectedStopId,
  onSelectStop,
  selectedRouteId,
  onSelectRoute,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredVehicle, setHoveredVehicle] = useState<TransitVehicle | null>(null);
  const [hoveredStop, setHoveredStop] = useState<TransitStop | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.75), 2.2));
  };

  // Find currently selected stop coordinates
  const selectedStop = stops.find((s) => s.id === selectedStopId);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full min-h-[500px] bg-[#EFF4FF] overflow-hidden select-none cursor-grab active:cursor-grabbing border-b lg:border-b-0 border-[#E2E8F0]"
    >
      {/* Dynamic Map Vector Canvas */}
      <svg
        viewBox="0 0 1000 720"
        className="w-full h-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D3E4FE" strokeWidth="0.75" strokeOpacity="0.45" />
          </pattern>

          {/* Glow filter for active route lines */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00C365" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Map Background Grid */}
        <rect width="1000" height="720" fill="#F8FAFC" />
        <rect width="1000" height="720" fill="url(#grid)" />

        {/* Geographic Waterway: Bay & Emerald River */}
        <path
          d="M 60,0 C 90,140 120,240 180,330 C 230,410 320,490 410,540 C 510,600 680,640 1000,680 L 1000,720 L 0,720 L 0,0 Z"
          fill="#D9E2FD"
          opacity="0.65"
        />
        <path
          d="M 80,0 C 110,140 140,240 200,330 C 250,410 340,490 430,540 C 530,600 700,640 1000,680"
          fill="none"
          stroke="#CBDBF5"
          strokeWidth="6"
          opacity="0.8"
        />

        {/* Urban District Labels */}
        <text x="500" y="320" fill="#94A3B8" fontSize="13" fontWeight="700" letterSpacing="0.1em" className="font-display uppercase opacity-60">
          Civic Central Quarter
        </text>
        <text x="140" y="240" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="0.1em" className="font-display uppercase opacity-60">
          Harbor Marina District
        </text>
        <text x="440" y="80" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="0.1em" className="font-display uppercase opacity-60">
          University Science Park
        </text>
        <text x="800" y="320" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="0.1em" className="font-display uppercase opacity-60">
          Innovation Corridor
        </text>
        <text x="520" y="550" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="0.1em" className="font-display uppercase opacity-60">
          Intermodal Rail Gateway
        </text>

        {/* Bridges across waterway */}
        <line x1="280" y1="450" x2="330" y2="475" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
        <line x1="430" y1="520" x2="490" y2="550" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" opacity="0.6" />

        {/* Transit Routes (Tracks / Lines) */}
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isDimmed = selectedRouteId !== null && !isSelected;
          const strokeColor = route.color;

          return (
            <g key={route.id} className="transition-opacity duration-200" opacity={isDimmed ? 0.2 : 1}>
              {/* Outer stroke casing */}
              <path
                d={route.pathD}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={isSelected ? '12' : '9'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Colored route line */}
              <path
                d={route.pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isSelected ? '8' : '5'}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursor-pointer hover:stroke-width-[9px] transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoute(isSelected ? null : route.id);
                }}
              />
              {/* Route badge pill on track midpoint */}
            </g>
          );
        })}

        {/* Transit Stop Nodes */}
        {stops.map((stop) => {
          const isSelected = selectedStopId === stop.id;
          const servesSelectedRoute = selectedRouteId
            ? stop.routesServing.includes(selectedRouteId)
            : true;

          return (
            <g
              key={stop.id}
              transform={`translate(${stop.x}, ${stop.y})`}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                onSelectStop(stop.id);
              }}
              onMouseEnter={() => setHoveredStop(stop)}
              onMouseLeave={() => setHoveredStop(null)}
            >
              {/* Selection Halo */}
              {isSelected && (
                <circle
                  r="18"
                  fill="none"
                  stroke="#00C365"
                  strokeWidth="2.5"
                  className="live-pulse-ring"
                />
              )}

              {/* Transfer Hub double ring */}
              {stop.isTransferHub && (
                <circle
                  r="11"
                  fill="#FFFFFF"
                  stroke="#0B1528"
                  strokeWidth="2"
                  opacity={servesSelectedRoute ? 1 : 0.4}
                />
              )}

              {/* Stop Core Node */}
              <circle
                r={isSelected ? '7' : stop.isTransferHub ? '6' : '5'}
                fill={isSelected ? '#00C365' : '#0B1528'}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                opacity={servesSelectedRoute ? 1 : 0.4}
                className="group-hover:scale-125 transition-transform"
              />

              {/* Stop Name Label */}
              <text
                x={stop.x > 700 ? -12 : 12}
                y="4"
                textAnchor={stop.x > 700 ? 'end' : 'start'}
                fill={isSelected ? '#006d36' : '#0B1528'}
                fontSize={isSelected ? '12' : '10'}
                fontWeight={isSelected ? '700' : '600'}
                className="font-display select-none transition-all"
                opacity={servesSelectedRoute ? 1 : 0.4}
              >
                {stop.name}
              </text>
            </g>
          );
        })}

        {/* Live Vehicles (Animated Buses) */}
        {vehicles.map((veh) => {
          const route = routes.find((r) => r.id === veh.routeId);
          const isSelected = selectedVehicleId === veh.id;
          const isRouteDimmed = selectedRouteId !== null && selectedRouteId !== veh.routeId;

          if (isRouteDimmed) return null;

          return (
            <g
              key={veh.id}
              transform={`translate(${veh.x}, ${veh.y})`}
              className="cursor-pointer group transition-transform duration-700 ease-linear"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVehicle(veh.id);
              }}
              onMouseEnter={() => setHoveredVehicle(veh)}
              onMouseLeave={() => setHoveredVehicle(null)}
            >
              {/* Radiating Live GPS Telemetry Pulse Ring */}
              <circle
                r="16"
                fill="none"
                stroke="#00C365"
                strokeWidth="2"
                className="live-pulse-ring"
              />

              {/* Vehicle Pill Container */}
              <rect
                x="-18"
                y="-11"
                width="36"
                height="22"
                rx="6"
                fill="#0B1528"
                stroke={isSelected ? '#00C365' : '#FFFFFF'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                filter="drop-shadow(0px 3px 5px rgba(11, 21, 40, 0.25))"
              />

              {/* Route Number on Bus */}
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="700"
                className="font-display select-none"
              >
                {veh.routeId}
              </text>

              {/* Direction heading pointer */}
              <circle
                cx={veh.direction === 'outbound' ? '15' : '-15'}
                cy="0"
                r="3"
                fill={veh.isDelayed ? '#F59E0B' : '#00C365'}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tactical Overlay Controls (Apple Maps & Citymapper aesthetic) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 border border-[#E2E8F0] shadow-md flex flex-col gap-1">
          <button
            onClick={() => handleZoom(0.25)}
            title="Zoom In"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0B1528] hover:bg-[#EFF4FF] transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-slate-200 mx-1" />
          <button
            onClick={() => handleZoom(-0.25)}
            title="Zoom Out"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0B1528] hover:bg-[#EFF4FF] transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-slate-200 mx-1" />
          <button
            onClick={handleResetView}
            title="Reset Map Frame"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0B1528] hover:bg-[#EFF4FF] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Route Quick Filters on Map Canvas */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 flex-wrap max-w-[calc(100%-80px)]">
        <button
          onClick={() => onSelectRoute(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            selectedRouteId === null
              ? 'bg-[#0B1528] text-white shadow-sm ring-2 ring-slate-900/10'
              : 'bg-white/90 text-[#555E75] hover:bg-white border border-[#E2E8F0]'
          }`}
        >
          All Corridors
        </button>

        {routes.map((r) => {
          const isActive = selectedRouteId === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoute(isActive ? null : r.id)}
              style={isActive ? { backgroundColor: r.color, color: r.textColor } : undefined}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold font-display transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                isActive
                  ? 'ring-2 ring-black/20'
                  : 'bg-white/90 text-[#0B1528] hover:bg-white border border-[#E2E8F0]'
              }`}
            >
              <span>{r.number}</span>
              <span className="hidden sm:inline font-sans-custom font-medium text-[11px] opacity-90">
                {r.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Hover Tooltip for Vehicles */}
      {hoveredVehicle && (
        <div
          className="absolute z-30 pointer-events-none bg-[#0B1528] text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700/60 max-w-xs"
          style={{
            left: `${hoveredVehicle.x * zoom + pan.x + 20}px`,
            top: `${hoveredVehicle.y * zoom + pan.y - 40}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-[#00C365] bg-emerald-950/80 px-1.5 py-0.5 rounded text-[11px]">
              {hoveredVehicle.vehicleNumber}
            </span>
            <span className="font-semibold text-slate-200">
              Route {hoveredVehicle.routeId}
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            Speed: <span className="font-bold text-white tabular-nums">{hoveredVehicle.speedMph} mph</span> · Load:{' '}
            <span className="font-bold text-[#00C365]">{hoveredVehicle.occupancyPercent}%</span>
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-3 left-4 z-20 hidden md:flex items-center gap-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#555E75] shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C365] live-pulse-ring" />
          <span className="font-medium text-[#0B1528]">Live GPS Bus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0B1528] bg-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B1528]" />
          </span>
          <span className="font-medium text-[#0B1528]">Transfer Hub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0B1528]" />
          <span className="font-medium text-[#0B1528]">Local Stop</span>
        </div>
      </div>
    </div>
  );
};
