import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

const mono = { fontFamily: "'Source Code Pro', monospace" };
const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 text-muted hover:text-ink transition-colors flex items-center justify-center w-8 h-8 border border-border bg-surface"
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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <ThemeToggle />
      <div className="w-full max-w-sm border border-border bg-surface">

        {/* Header bar */}
        <div className="border-b border-border px-5 py-4">
          <h1 className="text-2xl text-ink leading-none" style={serif}>
            Tenant Login
          </h1>
          <p className="text-[10px] tracking-widest uppercase text-muted mt-1.5" style={mono}>
            Sign in with your admin or operator account
          </p>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {infoMessage && (
            <p className="border border-accent/30 bg-accent/10 px-3 py-2 text-[10px] tracking-wide text-ink" style={mono}>
              {infoMessage}
            </p>
          )}

          {error && (
            <p className="border border-crit/30 bg-crit/10 px-3 py-2 text-[10px] tracking-wide text-crit" style={mono}>
              {error}
            </p>
          )}

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] tracking-widest uppercase text-muted" style={mono}>Username</span>
              <input
                className="min-h-[40px] border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
                style={mono}
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] tracking-widest uppercase text-muted" style={mono}>Password</span>
              <input
                className="min-h-[40px] border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
                style={mono}
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
              className="mt-1 min-h-[42px] border border-accent/40 bg-accent/10 px-4 text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={mono}
            >
              {submitting ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center justify-end border-t border-border pt-3">
            <button
              type="button"
              onClick={onGoSignup}
              className="text-[10px] uppercase tracking-widest text-accent hover:text-ink transition-colors"
              style={mono}
            >
              Create tenant →
            </button>
          </div>
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
