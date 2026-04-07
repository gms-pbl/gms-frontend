import { useSensorData } from './hooks/useSensorData';
import { useAlerts } from './hooks/useAlerts';
import { MOCK_SITE } from './services/mockData';
import AppShell from './components/layout/AppShell';

export default function App() {
  const readings = useSensorData();
  const { alerts, acknowledge, dismiss } = useAlerts();

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
