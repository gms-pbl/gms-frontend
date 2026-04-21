import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 text-muted hover:text-ink transition-colors flex items-center justify-center w-8 h-8 rounded border border-border bg-surface"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function SignupPage({ onSignup, onGoLogin }) {
  const [tenantName, setTenantName] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!tenantName.trim() || !username.trim() || password.length < 8) {
      setError('Tenant name, username, and password (8+ chars) are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSignup({
        tenantName: tenantName.trim(),
        tenantId: tenantId.trim() || undefined,
        username: username.trim(),
        password,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-8">
      <ThemeToggle />
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Create Tenant Admin</h1>
          <p className="mt-1 text-sm text-muted">
            This creates a new tenant/organization and your initial admin account.
          </p>
        </div>

        {error && (
          <p className="rounded border border-crit/30 bg-crit/10 px-3 py-2 text-sm text-crit">{error}</p>
        )}

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm text-ink">
            Tenant name
            <input
              className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
              type="text"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
              placeholder="Example: Acme Farms"
              required
            />
          </label>

          <label className="grid gap-1 text-sm text-ink">
            Tenant id (optional)
            <input
              className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
              type="text"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="example: acme-farms"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-ink">
              Username
              <input
                className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="grid gap-1 text-sm text-ink">
              Password
              <input
                className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 min-h-[42px] rounded bg-accent px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {submitting ? 'Creating...' : 'Create Tenant'}
          </button>
        </form>

        <div className="flex items-center justify-end border-t border-border pt-3">
          <button
            type="button"
            onClick={onGoLogin}
            className="text-xs font-semibold uppercase tracking-[0.08em] text-accent hover:brightness-90"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

SignupPage.propTypes = {
  onSignup: PropTypes.func.isRequired,
  onGoLogin: PropTypes.func.isRequired,
};
