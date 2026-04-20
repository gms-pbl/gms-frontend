import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AppShell from './components/layout/AppShell';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import GreenhouseListPage from './components/greenhouse/GreenhouseListPage';
import ZoneManagementPage from './components/zones/ZoneManagementPage';
import { MOCK_ALERTS, MOCK_SENSOR_READINGS, MOCK_SITE } from './services/mockData';
import { getMe, login, logout, signupTenantAdmin } from './services/authApi';

function navigate(pathname, { replace = false } = {}) {
  const target = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (replace) {
    window.history.replaceState({}, '', target);
  } else {
    window.history.pushState({}, '', target);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopstate = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  return pathname;
}

function LoadingScreen({ label }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-surface px-4 py-5 text-sm text-muted">
        {label}
      </div>
    </div>
  );
}

LoadingScreen.propTypes = {
  label: PropTypes.string.isRequired,
};

export default function App() {
  const pathname = usePathname();

  const [authLoading, setAuthLoading] = useState(true);
  const [authProfile, setAuthProfile] = useState(null);
  const [loginInfoMessage, setLoginInfoMessage] = useState('');

  const [demoAlerts, setDemoAlerts] = useState(MOCK_ALERTS);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      setAuthLoading(true);
      try {
        const profile = await getMe();
        if (!cancelled) {
          setAuthProfile(profile);
        }
      } catch {
        if (!cancelled) {
          setAuthProfile(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pathname.startsWith('/zones')) {
      return;
    }
    navigate('/g', { replace: true });
  }, [pathname]);

  const greenhouseRouteMatch = useMemo(() => pathname.match(/^\/g\/([^/]+)$/), [pathname]);
  const greenhouseId = greenhouseRouteMatch ? decodeURIComponent(greenhouseRouteMatch[1]) : '';

  const handleLogin = async ({ username, password }) => {
    await login({ username, password });
    const profile = await getMe();
    setAuthProfile(profile);
    setLoginInfoMessage('');
    navigate('/g', { replace: true });
  };

  const handleSignup = async ({ username, password, tenantName, tenantId }) => {
    await signupTenantAdmin({ username, password, tenantName, tenantId });
    setLoginInfoMessage('Tenant created. You can now login with your new credentials.');
    navigate('/login', { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setAuthProfile(null);
      navigate('/login', { replace: true });
    }
  };

  const acknowledgeDemoAlert = (id) => {
    setDemoAlerts((current) => current.map((item) => (item.id === id ? { ...item, acknowledged: true } : item)));
  };

  const dismissDemoAlert = (id) => {
    setDemoAlerts((current) => current.filter((item) => item.id !== id));
  };

  if (pathname === '/login') {
    return (
      <LoginPage
        infoMessage={loginInfoMessage}
        onLogin={handleLogin}
        onGoSignup={() => navigate('/signup')}
      />
    );
  }

  if (pathname === '/signup') {
    return (
      <SignupPage
        onSignup={handleSignup}
        onGoLogin={() => navigate('/login')}
      />
    );
  }

  if (pathname === '/g') {
    if (authLoading) {
      return <LoadingScreen label="Loading session..." />;
    }
    if (!authProfile) {
      return (
        <LoginPage
          infoMessage="Please login to access tenant greenhouses."
          onLogin={handleLogin}
          onGoSignup={() => navigate('/signup')}
        />
      );
    }

    return (
      <GreenhouseListPage
        profile={authProfile}
        onLogout={handleLogout}
        onOpenGreenhouse={(id) => navigate(`/g/${encodeURIComponent(id)}`)}
      />
    );
  }

  if (greenhouseRouteMatch) {
    if (authLoading) {
      return <LoadingScreen label="Loading session..." />;
    }
    if (!authProfile) {
      return (
        <LoginPage
          infoMessage="Please login to open greenhouse controls."
          onLogin={handleLogin}
          onGoSignup={() => navigate('/signup')}
        />
      );
    }

    return <ZoneManagementPage greenhouseId={greenhouseId} />;
  }

  if (pathname === '/') {
    return (
      <AppShell
        siteName={MOCK_SITE.name}
        readings={MOCK_SENSOR_READINGS}
        alerts={demoAlerts}
        onAcknowledge={acknowledgeDemoAlert}
        onDismiss={dismissDemoAlert}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-surface px-4 py-5">
        <p className="text-sm text-muted">Route not found.</p>
        <div className="mt-3 flex gap-3 text-sm">
          <a className="text-accent underline underline-offset-2" href="/">
            Demo dashboard
          </a>
          <a className="text-accent underline underline-offset-2" href="/g">
            Greenhouses
          </a>
        </div>
      </div>
    </div>
  );
}
