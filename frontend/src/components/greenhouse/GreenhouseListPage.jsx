import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createGreenhouse,
  deleteGreenhouse,
  getGreenhouseGatewayConfig,
  listGreenhouses,
  updateGreenhouse,
} from '../../services/greenhouseApi';

function buildEnvText(config) {
  if (!config?.env || typeof config.env !== 'object') {
    return '';
  }

  return Object.entries(config.env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

export default function GreenhouseListPage({ profile, onLogout, onOpenGreenhouse }) {
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
    if (!createName.trim()) {
      setError('Greenhouse name is required.');
      return;
    }

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
    if (!nextName) {
      setError('Provide a new name before saving.');
      return;
    }

    await runAction(async () => {
      await updateGreenhouse({ greenhouseId: greenhouse.greenhouse_id, name: nextName });
      setRenameDrafts((current) => ({ ...current, [greenhouse.greenhouse_id]: '' }));
      setMessage(`Renamed ${greenhouse.greenhouse_id}.`);
    });
  };

  const handleDelete = async (greenhouse) => {
    const confirmed = window.confirm(
      `Delete greenhouse '${greenhouse.name}' (${greenhouse.greenhouse_id})? This permanently removes its zone/telemetry/alert records.`
    );
    if (!confirmed) {
      return;
    }

    await runAction(async () => {
      await deleteGreenhouse({ greenhouseId: greenhouse.greenhouse_id });
      setExpandedConfigFor((current) => (current === greenhouse.greenhouse_id ? '' : current));
      setMessage(`Deleted greenhouse ${greenhouse.greenhouse_id}.`);
    });
  };

  const handleToggleConfig = async (greenhouseId) => {
    if (expandedConfigFor === greenhouseId) {
      setExpandedConfigFor('');
      return;
    }

    setExpandedConfigFor(greenhouseId);
    if (configByGreenhouse[greenhouseId]) {
      return;
    }

    try {
      const config = await getGreenhouseGatewayConfig({ greenhouseId });
      setConfigByGreenhouse((current) => ({ ...current, [greenhouseId]: config }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  const activeConfigText = useMemo(() => {
    if (!expandedConfigFor) {
      return '';
    }
    return buildEnvText(configByGreenhouse[expandedConfigFor]);
  }, [configByGreenhouse, expandedConfigFor]);

  const copyActiveConfig = async () => {
    if (!activeConfigText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(activeConfigText);
      setMessage('Gateway environment config copied to clipboard.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Greenhouses</h1>
            <p className="text-xs uppercase tracking-[0.14em] text-muted" style={{ fontFamily: "'Source Code Pro', monospace" }}>
              tenant `{profile?.tenant_id || 'n/a'}` / role `{profile?.role || 'n/a'}`
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              className="inline-flex min-h-[40px] items-center rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface2"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Demo Dashboard
            </a>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center rounded border border-crit px-3 text-xs font-semibold uppercase tracking-[0.12em] text-crit transition hover:bg-crit/10 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <p className="rounded border border-crit/30 bg-crit/10 px-3 py-2 text-sm text-crit">{error}</p>
        )}
        {!error && message && (
          <p className="rounded border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink">{message}</p>
        )}

        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-base font-semibold text-ink">Add Greenhouse</h2>
          <form className="mt-3 grid gap-3 md:grid-cols-4" onSubmit={handleCreate}>
            <input
              className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
              type="text"
              placeholder="Greenhouse name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              required
            />
            <input
              className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
              type="text"
              placeholder="greenhouse_id (optional)"
              value={createGreenhouseId}
              onChange={(event) => setCreateGreenhouseId(event.target.value)}
            />
            <input
              className="min-h-[40px] rounded border border-border bg-surface2 px-3 text-sm text-ink outline-none focus:border-accent"
              type="text"
              placeholder="gateway_id (optional)"
              value={createGatewayId}
              onChange={(event) => setCreateGatewayId(event.target.value)}
            />
            <button
              type="submit"
              disabled={pending}
              className="min-h-[40px] rounded bg-accent px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "'Source Code Pro', monospace" }}
            >
              Create
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Registered Greenhouses</h2>
            <p className="text-xs text-muted">Each greenhouse maps to one gateway for this MVP.</p>
          </div>

          <div className="grid gap-3 p-4">
            {loading ? (
              <p className="text-sm text-muted">Loading greenhouses...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted">No greenhouses yet. Create your first one above.</p>
            ) : (
              items.map((greenhouse) => (
                <article
                  key={greenhouse.greenhouse_id}
                  className="rounded border border-border/70 bg-surface2/40 px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">{greenhouse.name}</p>
                      <p className="text-xs text-muted">greenhouse_id: {greenhouse.greenhouse_id}</p>
                      <p className="text-xs text-muted">gateway_id: {greenhouse.gateway_id}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenGreenhouse(greenhouse.greenhouse_id)}
                        className="min-h-[34px] rounded border border-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleConfig(greenhouse.greenhouse_id)}
                        className="min-h-[34px] rounded border border-border px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        {expandedConfigFor === greenhouse.greenhouse_id ? 'Hide Info' : 'Info'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(greenhouse)}
                        disabled={pending}
                        className="min-h-[34px] rounded border border-crit px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-crit transition hover:bg-crit/10 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ fontFamily: "'Source Code Pro', monospace" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={renameDrafts[greenhouse.greenhouse_id] || ''}
                      onChange={(event) => setRenameDrafts((current) => ({
                        ...current,
                        [greenhouse.greenhouse_id]: event.target.value,
                      }))}
                      placeholder="Rename greenhouse"
                      className="min-h-[40px] flex-1 rounded border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => void handleRename(greenhouse)}
                      disabled={pending}
                      className="min-h-[40px] rounded border border-border px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ fontFamily: "'Source Code Pro', monospace" }}
                    >
                      Rename
                    </button>
                  </div>

                  {expandedConfigFor === greenhouse.greenhouse_id && (
                    <div className="mt-3 rounded border border-border bg-surface px-3 py-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Gateway Config</p>
                        <button
                          type="button"
                          onClick={() => void copyActiveConfig()}
                          className="min-h-[30px] rounded border border-border px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-surface2"
                          style={{ fontFamily: "'Source Code Pro', monospace" }}
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-all rounded border border-border/70 bg-surface2 p-2 text-[11px] text-ink">
                        {buildEnvText(configByGreenhouse[greenhouse.greenhouse_id]) || 'Loading config...'}
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
