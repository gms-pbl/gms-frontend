import PropTypes from 'prop-types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SensorDashboard from '../dashboard/SensorDashboard';
import GlobalFeedStatus from '../dashboard/GlobalFeedStatus';
import DesktopSidebar from './DesktopSidebar';
import MobileNav from './MobileNav';
import AlertPanel from '../alerts/AlertPanel';
import AlertBadge from '../alerts/AlertBadge';

export default function AppShell({ siteName, readings, alerts, onAcknowledge, onDismiss }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unackedCritical = alerts.filter(
    a => a.severity === 'CRITICAL' && !a.acknowledged
  ).length;

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-12 border-b border-border bg-surface shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* GMS logo mark */}
          <span className="text-accent font-mono font-bold text-sm tracking-widest">GMS</span>
          <span className="text-border">|</span>
          <span className="text-[11px] font-mono tracking-wide text-ink hidden sm:block">{siteName}</span>
        </div>

        <div className="flex items-center gap-3">
          <GlobalFeedStatus readings={readings} />

          {/* Alert bell — mobile top bar shortcut */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative lg:hidden text-muted hover:text-ink transition-colors p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open alerts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <AlertBadge count={unackedCritical} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <DesktopSidebar alerts={alerts} onAcknowledge={onAcknowledge} onDismiss={onDismiss} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <SensorDashboard readings={readings} />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav
        unackedCriticalCount={unackedCritical}
        onOpenAlerts={() => setDrawerOpen(true)}
      />

      {/* Mobile slide-up drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border lg:hidden"
              style={{ maxHeight: '80vh' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <span className="w-8 h-0.5 bg-border rounded-full" />
              </div>
              <div style={{ height: 'calc(80vh - 20px)' }}>
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
  readings:      PropTypes.array.isRequired,
  alerts:        PropTypes.array.isRequired,
  onAcknowledge: PropTypes.func.isRequired,
  onDismiss:     PropTypes.func.isRequired,
};
