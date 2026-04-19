import { useEffect, useState } from 'react';
import { useSensorData } from './hooks/useSensorData';
import { useAlerts } from './hooks/useAlerts';
import { MOCK_SITE } from './services/mockData';
import AppShell from './components/layout/AppShell';
import ZoneManagementPage from './components/zones/ZoneManagementPage';

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopstate = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  return pathname;
}

export default function App() {
  const pathname = usePathname();
  const zonesRoute = pathname.startsWith('/zones');
  const readings = useSensorData({ enabled: !zonesRoute });
  const { alerts, acknowledge, dismiss } = useAlerts({ enabled: !zonesRoute });

  if (zonesRoute) {
    return <ZoneManagementPage />;
  }

  return (
    <AppShell
      siteName={MOCK_SITE.name}
      siteId={MOCK_SITE.id}
      readings={readings}
      alerts={alerts}
      onAcknowledge={acknowledge}
      onDismiss={dismiss}
    />
  );
}
