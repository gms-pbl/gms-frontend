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
  const readings = useSensorData();
  const { alerts, acknowledge, dismiss } = useAlerts();

  if (pathname.startsWith('/zones')) {
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
