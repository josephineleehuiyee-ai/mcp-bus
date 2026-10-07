import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { ServiceAlert, TransitRoute } from '../types/transit';

interface ServiceAlertsModalProps {
  alerts: ServiceAlert[];
  routes: TransitRoute[];
  onClose: () => void;
  onSelectRoute: (routeId: string) => void;
}

export const ServiceAlertsModal: React.FC<ServiceAlertsModalProps> = ({
  alerts,
  routes,
  onClose,
  onSelectRoute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B1528] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg tracking-tight text-white">
                Civic Transit Advisories
              </h3>
              <p className="text-xs text-slate-300">
                Live dispatch updates & infrastructure notices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {alerts.map((alert) => {
            const isWarning = alert.severity === 'warning';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                    : isWarning
                    ? 'bg-[#FFFBEB] border-[#FDE68A]'
                    : 'bg-[#EFF4FF] border-[#D9E2FD]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[#006d36] shrink-0" />
                    )}
                    <h4 className="font-display font-bold text-sm text-[#0B1528]">
                      {alert.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] shrink-0">
                    {alert.updatedAt}
                  </span>
                </div>

                <p className="text-xs text-[#3C4A3E] mt-2 leading-relaxed">
                  {alert.description}
                </p>

                {alert.actionRequired && (
                  <div className="mt-2.5 p-2 bg-white/80 rounded-lg border border-amber-200 text-xs text-[#855300] font-medium">
                    <strong>Action:</strong> {alert.actionRequired}
                  </div>
                )}

                {/* Affected routes chips */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-black/5">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase">Affected:</span>
                  {alert.routeIds.map((rid) => {
                    const r = routes.find((x) => x.id === rid);
                    return (
                      <button
                        key={rid}
                        onClick={() => {
                          onSelectRoute(rid);
                          onClose();
                        }}
                        style={{ backgroundColor: r?.color || '#0B1528', color: r?.textColor || '#ffffff' }}
                        className="font-display font-bold text-[10px] px-2 py-0.5 rounded cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        Line {rid}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B1528] text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
