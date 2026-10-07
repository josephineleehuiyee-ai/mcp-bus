import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Activity, CheckCircle, AlertTriangle, Bus, ShieldCheck, Clock, Users, Accessibility, Layers, ExternalLink } from 'lucide-react';

interface LtaService {
  ServiceNo: string;
  Operator: string;
  NextBus?: {
    OriginCode: string;
    DestinationCode: string;
    EstimatedArrival: string;
    Latitude: string;
    Longitude: string;
    VisitNumber: string;
    Load: 'SEA' | 'SDA' | 'LSD' | string;
    Feature: 'WAB' | string;
    Type: 'SD' | 'DD' | 'BD' | string;
  };
  NextBus2?: {
    EstimatedArrival: string;
    Load: string;
    Feature: string;
    Type: string;
  };
  NextBus3?: {
    EstimatedArrival: string;
    Load: string;
    Feature: string;
    Type: string;
  };
}

interface LtaApiResponse {
  BusStopCode: string;
  Services: LtaService[];
  source?: string;
  accountKeyConfigured?: boolean;
  notice?: string;
  error?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  ltaIntegration?: {
    provider: string;
    accountKeyConfigured: boolean;
    status: string;
  };
}

export const LtaDataMallView: React.FC = () => {
  const [busStopCode, setBusStopCode] = useState('04121');
  const [serviceNo, setServiceNo] = useState('');
  const [data, setData] = useState<LtaApiResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset Singapore bus stops
  const presets = [
    { code: '04121', name: 'Old Supreme Court / City Hall' },
    { code: '01012', name: 'Hotel Grand Pacific / Bras Basah' },
    { code: '08057', name: 'Dhoby Ghaut Stn' },
    { code: '10169', name: 'Opp Great World City' },
    { code: '17009', name: 'Jurong East Bus Interchange' },
  ];

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json);
      }
    } catch (e) {
      console.error('Failed to fetch /api/health:', e);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchLtaArrivals = async (stopCode = busStopCode, service = serviceNo) => {
    if (!stopCode) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      let url = `/api/bus-arrival?BusStopCode=${encodeURIComponent(stopCode)}`;
      if (service) {
        url += `&ServiceNo=${encodeURIComponent(service)}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Failed to fetch bus arrival data');
      } else {
        setData(json);
        setLastFetched(new Date().toLocaleTimeString());
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error connecting to /api/bus-arrival');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchLtaArrivals();

    // Auto-refresh every 20 seconds per LTA specification
    const interval = setInterval(() => {
      fetchLtaArrivals();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const calculateMinutes = (isoString?: string) => {
    if (!isoString) return null;
    const diff = new Date(isoString).getTime() - Date.now();
    const minutes = Math.round(diff / 60000);
    if (minutes <= 0) return 'Arr';
    return `${minutes}m`;
  };

  const getLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return { label: 'Seats Avail', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'SDA':
        return { label: 'Standing', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'LSD':
        return { label: 'Limited Standing', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: load || 'Normal', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner & API Health Monitor Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C365] live-pulse-ring" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#0B1528] tracking-tight">
                Singapore LTA DataMall v3 Live Bus Arrival
              </h2>
            </div>
            <p className="text-xs text-[#555E75] mt-1">
              Connected via backend proxy <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#0B1528] font-mono text-[11px]">/api/bus-arrival</code>
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                fetchHealth();
                fetchLtaArrivals();
              }}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#EFF4FF] hover:bg-[#D9E2FD] text-xs font-semibold text-[#006d36] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh (20s cycle)</span>
            </button>
          </div>
        </div>

        {/* API Health Monitor Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#F1F5F9] text-xs">
          <div className="flex items-center gap-2.5 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
            <Activity className="w-4 h-4 text-[#00C365]" />
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">API Health Status</span>
              <span className="font-display font-bold text-[#0B1528]">
                {health?.status === 'ok' ? 'Online · /api/health' : 'Checking...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
            <ShieldCheck className={`w-4 h-4 ${data?.accountKeyConfigured ? 'text-[#00C365]' : 'text-[#F59E0B]'}`} />
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">LTA Account Key</span>
              <span className="font-display font-bold text-[#0B1528]">
                {data?.accountKeyConfigured ? 'Live Key Configured' : 'Ready (Awaiting Key in Vercel)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
            <Clock className="w-4 h-4 text-[#555E75]" />
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Last Synchronized</span>
              <span className="font-display font-bold text-[#0B1528]">
                {lastFetched || 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Notice banner if awaiting key in Vercel */}
        {!data?.accountKeyConfigured && (
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">Vercel Environment Setup:</strong> When you deploy to Vercel, set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">LTA_ACCOUNT_KEY</code> in your Project Settings → Environment Variables. The backend endpoint will automatically stream 100% live data directly from DataMall.
            </div>
          </div>
        )}
      </div>

      {/* Query Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-[#0B1528] uppercase tracking-wider mb-1.5 font-display">
              Bus Stop Code (5 Digits)
            </label>
            <div className="relative">
              <input
                type="text"
                value={busStopCode}
                onChange={(e) => setBusStopCode(e.target.value)}
                placeholder="e.g. 04121"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-xl font-display font-bold text-[#0B1528] focus:outline-none focus:ring-2 focus:ring-[#00C365]"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-[#0B1528] uppercase tracking-wider mb-1.5 font-display">
              Service No (Optional)
            </label>
            <input
              type="text"
              value={serviceNo}
              onChange={(e) => setServiceNo(e.target.value)}
              placeholder="All, or e.g. 7"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-xl font-display font-bold text-[#0B1528] focus:outline-none focus:ring-2 focus:ring-[#00C365]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              onClick={() => fetchLtaArrivals()}
              className="w-full py-2.5 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white font-display font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 h-[42px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Query</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase font-display">Quick Stops:</span>
          {presets.map((p) => (
            <button
              key={p.code}
              onClick={() => {
                setBusStopCode(p.code);
                fetchLtaArrivals(p.code, serviceNo);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                busStopCode === p.code
                  ? 'bg-[#0B1528] text-white border-[#0B1528]'
                  : 'bg-[#F8FAFC] text-[#0B1528] border-[#E2E8F0] hover:bg-[#EFF4FF]'
              }`}
            >
              <span className="font-display font-bold">{p.code}</span>
              <span className="ml-1 text-[11px] opacity-80 hidden md:inline">({p.name})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {errorMsg ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h4 className="font-bold text-sm">Query Failed</h4>
          <p className="text-xs mt-1">{errorMsg}</p>
        </div>
      ) : data?.Services && data.Services.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-sm font-bold text-[#64748B] uppercase tracking-wider">
              Services Operating at Stop {data.BusStopCode} ({data.Services.length})
            </h3>
            <span className="text-xs text-[#006d36] font-semibold bg-[#EFF4FF] px-2 py-0.5 rounded-full">
              LTA DataMall v3 Format
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {data.Services.map((svc) => {
              const nextMins = calculateMinutes(svc.NextBus?.EstimatedArrival);
              const next2Mins = calculateMinutes(svc.NextBus2?.EstimatedArrival);
              const next3Mins = calculateMinutes(svc.NextBus3?.EstimatedArrival);

              const load1 = getLoadBadge(svc.NextBus?.Load);
              const load2 = getLoadBadge(svc.NextBus2?.Load);

              return (
                <div
                  key={svc.ServiceNo}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs hover:border-[#00C365] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Bus Line Badge */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-11 bg-[#0B1528] rounded-lg flex items-center justify-center text-white font-display font-bold text-lg tracking-wider shadow-xs">
                        {svc.ServiceNo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-[#0B1528]">
                            Operator: {svc.Operator}
                          </span>
                          {svc.NextBus?.Feature === 'WAB' && (
                            <span className="text-[10px] font-semibold bg-[#EFF4FF] text-[#006d36] px-1.5 py-0.2 rounded border border-[#D9E2FD]">
                              Wheelchair (WAB)
                            </span>
                          )}
                          {svc.NextBus?.Type === 'DD' && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-[#0B1528] px-1.5 py-0.2 rounded">
                              Double Deck (DD)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5 font-sans-custom">
                          To Stop {svc.NextBus?.DestinationCode || 'Terminal'}
                        </p>
                      </div>
                    </div>

                    {/* Next 3 Bus Arrivals Countdown Tiles */}
                    <div className="flex items-center gap-2">
                      {/* Next Bus */}
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center min-w-[85px]">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Next Bus</span>
                        <span className="font-display text-lg font-bold text-[#00C365] tabular-nums">
                          {nextMins || '--'}
                        </span>
                        <div className="mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${load1.color}`}>
                            {load1.label}
                          </span>
                        </div>
                      </div>

                      {/* Next Bus 2 */}
                      {svc.NextBus2 && (
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center min-w-[85px] hidden sm:block">
                          <span className="text-[10px] uppercase font-bold text-[#64748B] block">2nd Bus</span>
                          <span className="font-display text-lg font-bold text-[#0B1528] tabular-nums">
                            {next2Mins || '--'}
                          </span>
                          <div className="mt-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${load2.color}`}>
                              {load2.label}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Next Bus 3 */}
                      {svc.NextBus3 && (
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center min-w-[85px] hidden md:block">
                          <span className="text-[10px] uppercase font-bold text-[#64748B] block">3rd Bus</span>
                          <span className="font-display text-lg font-bold text-[#64748B] tabular-nums">
                            {next3Mins || '--'}
                          </span>
                          <div className="mt-1">
                            <span className="text-[9px] font-medium text-slate-500">
                              {svc.NextBus3.Type || 'SD'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-[#64748B]">
          <Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-[#0B1528]">No arrivals found for this stop code</h4>
          <p className="text-xs mt-1">Please verify the 5-digit bus stop code.</p>
        </div>
      )}
    </div>
  );
};
