import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SensorDashboard from '../dashboard/SensorDashboard';
import GlobalFeedStatus from '../dashboard/GlobalFeedStatus';
import MobileNav from './MobileNav';
import AlertPanel from '../alerts/AlertPanel';
import IrrigationControlPanel from '../irrigation/IrrigationControlPanel';
import { useTheme } from '../../hooks/useTheme';
import { useSensorData } from '../../hooks/useSensorData';
import { useAlerts } from '../../hooks/useAlerts';
import { useIrrigation } from '../../hooks/useIrrigation';
import { useZoneRegistry } from '../../hooks/useZoneRegistry';

function useClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function AppShell({ greenhouseId }) {
  const [activeView, setActiveView] = useState('sensors');
  const [manualZoneId, setManualZoneId] = useState('');
  const time = useClock();
  const { isDark, toggleTheme } = useTheme();

  const { registry } = useZoneRegistry({ greenhouseId });
  const assignedZones = useMemo(
    () => registry.assigned_zones ?? [],
    [registry.assigned_zones],
  );

  // Build zone_id → zone_name map for alert enrichment
  const zoneNameMap = useMemo(
    () => Object.fromEntries(assignedZones.map(z => [z.zone_id, z.zone_name])),
    [assignedZones],
  );

  // If manual pick exists in current zone list use it; otherwise first zone (or '' for all)
  const selectedZone = assignedZones.find(z => z.zone_id === manualZoneId) ?? assignedZones[0] ?? null;
  const selectedZoneId = selectedZone?.zone_id ?? '';

  // Always fetch for the greenhouse; zone_id narrows it when a zone exists
  const readings = useSensorData({
    greenhouseId,
    zoneId: selectedZoneId,
    enabled: !!greenhouseId,
  });

  const { alerts, acknowledge, dismiss } = useAlerts();
  const { zones: irrigationZones, loading: irrigationLoading, toggleZone, manualOverride, emergencyStop } = useIrrigation(greenhouseId);

  const unackedCritical = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  const tabCls = (view) =>
    `px-4 h-full text-[9px] tracking-widest uppercase border-b-2 transition-colors ${
      activeView === view
        ? 'text-accent border-accent'
        : 'text-muted border-transparent hover:text-ink'
    }`;

  return (
    <div className="flex flex-col h-full min-h-screen">

      {/* ── Header ─────────────────────────────────── */}
      <header className="shrink-0 z-20 border-b border-border bg-surface">
        <div className="flex items-center justify-between px-5 sm:px-8 h-16">
          <div className="flex flex-col justify-center">
            <span
              className="text-ink font-semibold leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)' }}
            >
              Greenhouse Management System
            </span>
            <span
              className="text-muted text-[10px] tracking-[0.16em] uppercase mt-0.5 hidden sm:block"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              {greenhouseId ? `greenhouse / ${greenhouseId}` : 'sensor dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a href="/g" className="hidden sm:inline-flex min-h-[38px] items-center rounded border border-border px-3 text-[10px] uppercase tracking-[0.14em] text-ink transition hover:bg-surface2" style={{ fontFamily: "'Source Code Pro', monospace" }}>
              Greenhouses
            </a>
            {greenhouseId && (
              <a href={`/g/${encodeURIComponent(greenhouseId)}/zones`} className="hidden sm:inline-flex min-h-[38px] items-center rounded border border-border px-3 text-[10px] uppercase tracking-[0.14em] text-ink transition hover:bg-surface2" style={{ fontFamily: "'Source Code Pro', monospace" }}>
                Zones
              </a>
            )}
            <GlobalFeedStatus readings={readings} />
          </div>
        </div>

        {/* Sub-bar */}
        <div className="flex items-center gap-5 px-5 sm:px-8 h-7 border-t border-border/50 bg-surface2">
          <span className="text-muted text-[9px] ml-auto" style={{ fontFamily: "'Source Code Pro', monospace" }}>
            {time}
          </span>
          <button onClick={toggleTheme} className="text-muted hover:text-ink transition-colors flex items-center justify-center w-5 h-5 shrink-0" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Main tab bar */}
        <div className="flex items-stretch px-5 sm:px-8 h-9 border-t border-border/40 bg-surface gap-1">
          <button className={tabCls('sensors')} onClick={() => setActiveView('sensors')} style={{ fontFamily: "'Source Code Pro', monospace" }}>
            Sensors
          </button>
          <button className={tabCls('irrigation')} onClick={() => setActiveView('irrigation')} style={{ fontFamily: "'Source Code Pro', monospace" }}>
            Irrigation
          </button>
          <button className={`${tabCls('notifications')} relative`} onClick={() => setActiveView('notifications')} style={{ fontFamily: "'Source Code Pro', monospace" }}>
            Notifications
            {unackedCritical > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] rounded-full bg-crit text-white font-bold leading-none">
                {unackedCritical}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            {activeView === 'sensors' && (
              <motion.div key="sensors" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                <SensorDashboard
                  readings={readings}
                  greenhouseId={greenhouseId}
                  zones={assignedZones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setManualZoneId}
                />
              </motion.div>
            )}
            {activeView === 'irrigation' && (
              <motion.div key="irrigation" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                <IrrigationControlPanel
                  zones={irrigationZones}
                  loading={irrigationLoading}
                  onToggle={toggleZone}
                  onManualOverride={manualOverride}
                  onEmergencyStop={emergencyStop}
                />
              </motion.div>
            )}
            {activeView === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="h-full">
                <AlertPanel alerts={alerts} onAcknowledge={acknowledge} onDismiss={dismiss} zoneNameMap={zoneNameMap} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileNav
        unackedCriticalCount={unackedCritical}
        onOpenAlerts={() => setActiveView('notifications')}
        activeView={activeView}
        onSetView={setActiveView}
      />

    </div>
  );
}

AppShell.propTypes = { greenhouseId: PropTypes.string };
AppShell.defaultProps = { greenhouseId: '' };
