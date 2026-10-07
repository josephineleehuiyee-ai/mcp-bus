import React from 'react';
import { Radio, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: 'radar' | 'board' | 'routes' | 'planner' | 'lta';
  setActiveTab: (tab: 'radar' | 'board' | 'routes' | 'planner' | 'lta') => void;
  activeAlertCount: number;
  onOpenAlerts: () => void;
  isSimulatingRushHour: boolean;
  onToggleRushHour: () => void;
  liveVehiclesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertCount,
  onOpenAlerts,
  isSimulatingRushHour,
  onToggleRushHour,
  liveVehiclesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_2px_8px_-2px_rgba(11,21,40,0.06)]">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (Single text element wordmark in display face per Top Bar Contract) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#0B1528] flex items-center justify-center text-white shadow-sm border border-slate-700/50">
            <Radio className="w-5 h-5 text-[#00C365] animate-pulse" />
          </div>
          <button
            onClick={() => setActiveTab('radar')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0B1528] group-hover:text-[#006d36] transition-colors">
              PulseBus <span className="text-[#00C365]">Velocity</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-sans-custom text-[#64748B] font-medium tracking-normal">
              Civic Real-Time Radar
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 Nav Links (Single line, text with clean active indicator) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-[#0B1528] text-white shadow-sm'
                : 'text-[#555E75] hover:text-[#0B1528] hover:bg-[#F1F5F9]'
            }`}
          >
            Live Radar & Map
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'board'
                ? 'bg-[#0B1528] text-white shadow-sm'
                : 'text-[#555E75] hover:text-[#0B1528] hover:bg-[#F1F5F9]'
            }`}
          >
            Departure Board
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-[#0B1528] text-white shadow-sm'
                : 'text-[#555E75] hover:text-[#0B1528] hover:bg-[#F1F5F9]'
            }`}
          >
            Route Corridors
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-[#0B1528] text-white shadow-sm'
                : 'text-[#555E75] hover:text-[#0B1528] hover:bg-[#F1F5F9]'
            }`}
          >
            Trip Planner
          </button>

          <button
            onClick={() => setActiveTab('lta')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lta'
                ? 'bg-[#006d36] text-white shadow-sm'
                : 'text-[#006d36] hover:bg-[#EFF4FF]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00C365]" />
            <span>LTA DataMall (SG)</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions & Civic Telemetry Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Rush Hour Stress Toggle */}
          <button
            onClick={onToggleRushHour}
            title={isSimulatingRushHour ? 'Peak Congestion Active' : 'Normal Flow'}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
              isSimulatingRushHour
                ? 'bg-[#F59E0B]/15 text-[#855300] border-[#F59E0B]/40'
                : 'bg-white text-[#555E75] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingRushHour ? 'text-[#F59E0B] fill-amber-500' : 'text-[#64748B]'}`} />
            <span className="hidden md:inline whitespace-nowrap">
              {isSimulatingRushHour ? 'Peak Congestion' : 'Normal Service'}
            </span>
          </button>

          {/* Service Alerts Button */}
          <button
            onClick={onOpenAlerts}
            className="relative px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E2E8F0] text-[#0B1528] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden sm:inline whitespace-nowrap">Alerts</span>
            {activeAlertCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center font-display">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* Live Fleet Counter Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF4FF] border border-[#D9E2FD] text-xs font-medium text-[#0B1528]">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-[#00C365] live-pulse-ring" />
              <span className="w-2 h-2 rounded-full bg-[#00C365]" />
            </div>
            <span className="font-display font-bold text-[#006d36] tabular-nums">
              {liveVehiclesCount}
            </span>
            <span className="text-[#555E75]">Buses Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};
