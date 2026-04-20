import PropTypes from 'prop-types';
import { useState } from 'react';

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
