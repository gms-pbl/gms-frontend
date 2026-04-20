import PropTypes from 'prop-types';
import { useState } from 'react';

export default function LoginPage({ onLogin, onGoSignup, infoMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onLogin({ username: username.trim(), password });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tenant Login</h1>
          <p className="mt-1 text-sm text-muted">Sign in with your admin/operator account.</p>
        </div>

        {infoMessage && (
          <p className="rounded border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink">{infoMessage}</p>
        )}

        {error && (
          <p className="rounded border border-crit/30 bg-crit/10 px-3 py-2 text-sm text-crit">{error}</p>
        )}

        <form className="grid gap-3" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 min-h-[42px] rounded bg-accent px-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            {submitting ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <a href="/" className="text-xs text-muted underline underline-offset-2 hover:text-ink">
            View demo dashboard
          </a>
          <button
            type="button"
            onClick={onGoSignup}
            className="text-xs font-semibold uppercase tracking-[0.08em] text-accent hover:brightness-90"
            style={{ fontFamily: "'Source Code Pro', monospace" }}
          >
            Create tenant
          </button>
        </div>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onGoSignup: PropTypes.func.isRequired,
  infoMessage: PropTypes.string,
};

LoginPage.defaultProps = {
  infoMessage: '',
};
