import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SensorDashboard from '../dashboard/SensorDashboard';
import GlobalFeedStatus from '../dashboard/GlobalFeedStatus';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import AlertPanel from '../alerts/AlertPanel';
import AlertBadge from '../alerts/AlertBadge';

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

export default function AppShell({ siteName, siteId, readings, alerts, onAcknowledge, onDismiss }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const time = useClock();

  const unackedCritical = alerts.filter(
    a => a.severity === 'CRITICAL' && !a.acknowledged
  ).length;

  return (
    <div className="flex flex-col h-full min-h-screen">

      {/* ── Primary header band ───────────────────────────── */}
      <header className="shrink-0 z-20">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 bg-surface border-b border-border">

          {/* Left: system identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-mono font-bold text-accent tracking-[0.25em] text-xs uppercase select-none">
              GMS
            </span>
            <span className="text-border select-none">/</span>
            <div className="flex flex-col leading-none">
              <span className="font-mono font-semibold text-ink text-sm tracking-wide">{siteName}</span>
              <span className="font-mono text-[9px] text-muted tracking-[0.2em] uppercase mt-0.5 hidden sm:block">
                {siteId}
              </span>
            </div>
          </div>

          {/* Right: status + mobile alert trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalFeedStatus readings={readings} />

            <button
              onClick={() => setDrawerOpen(true)}
              className="relative lg:hidden text-muted hover:text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open alerts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <AlertBadge count={unackedCritical} />
            </button>
          </div>
        </div>

        {/* ── System info sub-bar ───────────────────────── */}
        <div className="flex items-center gap-6 px-4 sm:px-6 h-6 bg-bg border-b border-border/40">
          <span className="font-mono text-[9px] text-muted tracking-[0.2em] uppercase">
            {readings.length} nodes
          </span>
          <span className="font-mono text-[9px] text-border select-none">·</span>
          <span className="font-mono text-[9px] text-muted tracking-[0.2em] uppercase hidden sm:block">
            SN-3002 // SHT10
          </span>
          <span className="font-mono text-[9px] text-border select-none hidden sm:block">·</span>
          <span className="font-mono text-[9px] text-muted tracking-[0.15em] ml-auto">
            {time}
          </span>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar alerts={alerts} onAcknowledge={onAcknowledge} onDismiss={onDismiss} />

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <SensorDashboard readings={readings} />
        </main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <MobileNav
        unackedCriticalCount={unackedCritical}
        onOpenAlerts={() => setDrawerOpen(true)}
      />

      {/* ── Mobile slide-up drawer ──────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-border lg:hidden"
              style={{ maxHeight: '80vh' }}
            >
              <div className="flex justify-center pt-2.5 pb-1">
                <span className="w-10 h-0.5 bg-border" />
              </div>
              <div style={{ height: 'calc(80vh - 24px)' }}>
                <AlertPanel
                  alerts={alerts}
                  onAcknowledge={onAcknowledge}
                  onDismiss={onDismiss}
                  onClose={() => setDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

AppShell.propTypes = {
  siteName:      PropTypes.string.isRequired,
  siteId:        PropTypes.string.isRequired,
  readings:      PropTypes.array.isRequired,
  alerts:        PropTypes.array.isRequired,
  onAcknowledge: PropTypes.func.isRequired,
  onDismiss:     PropTypes.func.isRequired,
};
