import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createGreenhouse,
  deleteGreenhouse,
  getGreenhouseGatewayConfig,
  listGreenhouses,
  updateGreenhouse,
} from '../../services/greenhouseApi';
import { useTheme } from '../../hooks/useTheme';

const mono = { fontFamily: "'Source Code Pro', monospace" };
const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

function buildEnvText(config) {
  if (!config?.env || typeof config.env !== 'object') return '';
  return Object.entries(config.env).map(([k, v]) => `${k}=${v}`).join('\n');
}

export default function GreenhouseListPage({ profile, onLogout, onOpenGreenhouse }) {
  const { isDark, toggleTheme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expandedConfigFor, setExpandedConfigFor] = useState('');
  const [configByGreenhouse, setConfigByGreenhouse] = useState({});

  const [createName, setCreateName] = useState('');
  const [createGreenhouseId, setCreateGreenhouseId] = useState('');
  const [createGatewayId, setCreateGatewayId] = useState('');
  const [renameDrafts, setRenameDrafts] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextItems = await listGreenhouses();
      setItems(Array.isArray(nextItems) ? nextItems : []);
      setError('');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const runAction = useCallback(async (fn) => {
    setPending(true);
    setError('');
    setMessage('');
    try {
      await fn();
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      throw nextError;
    } finally {
      setPending(false);
    }
  }, [refresh]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!createName.trim()) { setError('Greenhouse name is required.'); return; }
    await runAction(async () => {
      const created = await createGreenhouse({
        name: createName.trim(),
        greenhouseId: createGreenhouseId.trim() || undefined,
        gatewayId: createGatewayId.trim() || undefined,
      });
      setCreateName('');
      setCreateGreenhouseId('');
      setCreateGatewayId('');
      setMessage(`Created greenhouse ${created?.greenhouse_id || 'successfully'}.`);
    });
  };

  const handleRename = async (greenhouse) => {
    const nextName = (renameDrafts[greenhouse.greenhouse_id] || '').trim();
    if (!nextName) { setError('Provide a new name before saving.'); return; }
    await runAction(async () => {
      await updateGreenhouse({ greenhouseId: greenhouse.greenhouse_id, name: nextName });
      setRenameDrafts((c) => ({ ...c, [greenhouse.greenhouse_id]: '' }));
      setMessage(`Renamed ${greenhouse.greenhouse_id}.`);
    });
  };

  const handleDelete = async (greenhouse) => {
    const confirmed = window.confirm(
      `Delete greenhouse '${greenhouse.name}' (${greenhouse.greenhouse_id})? This permanently removes its zone/telemetry/alert records.`
    );
    if (!confirmed) return;
    await runAction(async () => {
      await deleteGreenhouse({ greenhouseId: greenhouse.greenhouse_id });
      setExpandedConfigFor((c) => (c === greenhouse.greenhouse_id ? '' : c));
      setMessage(`Deleted greenhouse ${greenhouse.greenhouse_id}.`);
    });
  };

  const handleToggleConfig = async (greenhouseId) => {
    if (expandedConfigFor === greenhouseId) { setExpandedConfigFor(''); return; }
    setExpandedConfigFor(greenhouseId);
    if (configByGreenhouse[greenhouseId]) return;
    try {
      const config = await getGreenhouseGatewayConfig({ greenhouseId });
      setConfigByGreenhouse((c) => ({ ...c, [greenhouseId]: config }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  const activeConfigText = useMemo(
    () => (expandedConfigFor ? buildEnvText(configByGreenhouse[expandedConfigFor]) : ''),
    [configByGreenhouse, expandedConfigFor]
  );

  const copyActiveConfig = async () => {
    if (!activeConfigText) return;
    try {
      await navigator.clipboard.writeText(activeConfigText);
      setMessage('Gateway environment config copied to clipboard.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Page header ──────────────────────────── */}
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between px-5 sm:px-8 h-16">
          <div className="flex flex-col justify-center">
            <span className="text-ink leading-tight" style={{ ...serif, fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)' }}>
              Greenhouse Management System
            </span>
            <span className="text-muted text-[10px] tracking-[0.16em] uppercase mt-0.5" style={mono}>
              tenant / {profile?.tenant_id || 'n/a'} &nbsp;·&nbsp; role / {profile?.role || 'n/a'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={pending}
              className="min-h-[38px] border border-border px-3 text-[10px] uppercase tracking-[0.14em] text-ink hover:bg-surface2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={mono}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={pending}
              className="min-h-[38px] border border-crit/40 bg-crit/10 px-3 text-[10px] uppercase tracking-[0.14em] text-crit hover:bg-crit/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={mono}
            >
              Logout
            </button>
            <button
              onClick={toggleTheme}
              className="text-muted hover:text-ink transition-colors flex items-center justify-center w-9 h-9 border border-border shrink-0"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-5 sm:p-7">

        {/* Feedback banners */}
        {error && (
          <p className="border border-crit/30 bg-crit/10 px-3 py-2 text-[10px] tracking-wide text-crit" style={mono}>
            {error}
          </p>
        )}
        {!error && message && (
          <p className="border border-accent/30 bg-accent/10 px-3 py-2 text-[10px] tracking-wide text-ink" style={mono}>
            {message}
          </p>
        )}

        {/* ── Add Greenhouse ──────────────────────── */}
        <section className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-xl text-ink leading-none" style={serif}>Add Greenhouse</h2>
          </div>
          <form className="p-4 grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
            <input
              className="min-h-[40px] border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
              style={mono}
              type="text"
              placeholder="Greenhouse name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              required
            />
            <input
              className="min-h-[40px] border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
              style={mono}
              type="text"
              placeholder="greenhouse_id (optional)"
              value={createGreenhouseId}
              onChange={(e) => setCreateGreenhouseId(e.target.value)}
            />
            <input
              className="min-h-[40px] border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
              style={mono}
              type="text"
              placeholder="gateway_id (optional)"
              value={createGatewayId}
              onChange={(e) => setCreateGatewayId(e.target.value)}
            />
            <button
              type="submit"
              disabled={pending}
              className="min-h-[40px] border border-accent/40 bg-accent/10 px-3 text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={mono}
            >
              Create
            </button>
          </form>
        </section>

        {/* ── Greenhouse list ─────────────────────── */}
        <section className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3 flex items-end justify-between">
            <h2 className="text-xl text-ink leading-none" style={serif}>Registered Greenhouses</h2>
            <span className="text-[10px] tracking-widest uppercase text-muted" style={mono}>
              {loading ? '…' : `${items.length} total`}
            </span>
          </div>

          <div className="flex flex-col gap-0">
            {loading ? (
              <p className="px-4 py-6 text-[10px] tracking-widest uppercase text-muted" style={mono}>
                Loading greenhouses…
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-[10px] tracking-widest uppercase text-muted" style={mono}>
                No greenhouses yet — create your first one above.
              </p>
            ) : (
              items.map((greenhouse) => (
                <article
                  key={greenhouse.greenhouse_id}
                  className="border-b border-border/50 last:border-b-0 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-ink text-base leading-snug" style={serif}>
                        {greenhouse.name}
                      </p>
                      <p className="text-[10px] tracking-widest text-muted mt-0.5" style={mono}>
                        {greenhouse.greenhouse_id}
                      </p>
                      <p className="text-[10px] text-muted" style={mono}>
                        gateway / {greenhouse.gateway_id || 'none'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenGreenhouse(greenhouse.greenhouse_id)}
                        className="min-h-[34px] border border-accent/40 bg-accent/10 px-3 text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
                        style={mono}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleConfig(greenhouse.greenhouse_id)}
                        className="min-h-[34px] border border-border px-3 text-[10px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors"
                        style={mono}
                      >
                        {expandedConfigFor === greenhouse.greenhouse_id ? 'Hide' : 'Info'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(greenhouse)}
                        disabled={pending}
                        className="min-h-[34px] border border-crit/40 bg-crit/10 px-3 text-[10px] uppercase tracking-widest text-crit hover:bg-crit/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={mono}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Rename row */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={renameDrafts[greenhouse.greenhouse_id] || ''}
                      onChange={(e) => setRenameDrafts((c) => ({ ...c, [greenhouse.greenhouse_id]: e.target.value }))}
                      placeholder="Rename greenhouse"
                      className="min-h-[36px] flex-1 border border-border bg-bg px-3 text-sm text-ink outline-none focus:border-accent transition-colors"
                      style={mono}
                    />
                    <button
                      type="button"
                      onClick={() => void handleRename(greenhouse)}
                      disabled={pending}
                      className="min-h-[36px] border border-border px-3 text-[10px] uppercase tracking-widest text-ink hover:bg-surface2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      style={mono}
                    >
                      Rename
                    </button>
                  </div>

                  {/* Gateway config expand */}
                  {expandedConfigFor === greenhouse.greenhouse_id && (
                    <div className="mt-3 border border-border bg-bg px-3 py-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] tracking-widest uppercase text-muted" style={mono}>
                          Gateway Config
                        </span>
                        <button
                          type="button"
                          onClick={() => void copyActiveConfig()}
                          className="min-h-[28px] border border-border px-2 text-[10px] uppercase tracking-widest text-ink hover:bg-surface transition-colors"
                          style={mono}
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-all text-[11px] text-accent" style={mono}>
                        {buildEnvText(configByGreenhouse[greenhouse.greenhouse_id]) || 'Loading config…'}
                      </pre>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

GreenhouseListPage.propTypes = {
  profile: PropTypes.shape({
    tenant_id: PropTypes.string,
    role: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
  onOpenGreenhouse: PropTypes.func.isRequired,
};

GreenhouseListPage.defaultProps = {
  profile: null,
};
