import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  systemMonitoringHistoryURL,
  configurationApplicationsURL,
  configurationGlobalIntervalsURL,
} from '../../const';
import { parseIntervalToMs } from '../../utils/parseIntervalTime';
import './index.css';

const DEFAULT_POLL_MS = 60 * 1000;

function SystemMonitoring() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configuredAppNames, setConfiguredAppNames] = useState([]);
  const [appIntervalText, setAppIntervalText] = useState('');
  const [appNameFilter, setAppNameFilter] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const pollIntervalMs = useMemo(
    () => parseIntervalToMs(appIntervalText, DEFAULT_POLL_MS),
    [appIntervalText]
  );

  const loadApplicationConfiguration = useCallback(async () => {
    try {
      const [appsRes, globalRes] = await Promise.all([
        fetch(configurationApplicationsURL),
        fetch(configurationGlobalIntervalsURL),
      ]);
      if (appsRes.ok) {
        const apps = await appsRes.json();
        const names = (Array.isArray(apps) ? apps : [])
          .map((a) => (a.app_name || '').trim())
          .filter(Boolean);
        setConfiguredAppNames(names);
      }
      if (globalRes.ok) {
        const g = await globalRes.json();
        setAppIntervalText(g.application_interval_time ?? '');
      }
    } catch {
      /* ignore */
    } finally {
      setConfigLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadApplicationConfiguration();
  }, [loadApplicationConfiguration]);

  const fetchHistory = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const res = await fetch(systemMonitoringHistoryURL);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
        const now = new Date();
        setLastRefreshed(now);
        setNextRefresh(new Date(now.getTime() + pollIntervalMs));
      } catch (err) {
        setError(err.message || 'Failed to load history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [pollIntervalMs]
  );

  useEffect(() => {
    fetchHistory(true);
    const interval = setInterval(() => fetchHistory(false), pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchHistory, pollIntervalMs]);

  const appNameOptions = useMemo(() => {
    if (!configLoaded) return [];
    if (configuredAppNames.length > 0) return [...configuredAppNames].sort();
    const set = new Set();
    history.forEach((row) => {
      const n = (row.app_name || '').trim();
      if (n) set.add(n);
    });
    return Array.from(set).sort();
  }, [configLoaded, configuredAppNames, history]);

  useEffect(() => {
    if (
      appNameFilter &&
      configuredAppNames.length > 0 &&
      !configuredAppNames.includes(appNameFilter)
    ) {
      setAppNameFilter('');
    }
  }, [configuredAppNames, appNameFilter]);

  const filteredHistory = useMemo(() => {
    const getApp = (row) => String(row.app_name ?? '').trim();
    let rows = history;
    if (configLoaded && configuredAppNames.length > 0) {
      const allow = new Set(configuredAppNames);
      rows = rows.filter((row) => allow.has(getApp(row)));
    }
    if (appNameFilter) {
      rows = rows.filter((row) => getApp(row) === appNameFilter);
    }
    return rows;
  }, [history, configLoaded, configuredAppNames, appNameFilter]);

  const formatTime = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? String(date) : d.toLocaleString();
  };

  return (
    <div className="system-monitoring-page">
      <header className="system-monitoring-header">
        <h1 className="system-monitoring-title">System Monitoring</h1>
        <div className="system-monitoring-filters">
          <label className="system-monitoring-filter-label">
            Filter by application
            <select
              className="system-monitoring-filter-select"
              value={appNameFilter}
              onChange={(e) => setAppNameFilter(e.target.value)}
              disabled={!configLoaded}
            >
              <option value="">
                {!configLoaded
                  ? 'Loading configuration…'
                  : configuredAppNames.length > 0
                    ? 'All configured applications'
                    : 'All applications'}
              </option>
              {appNameOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="system-monitoring-refresh-btn"
            onClick={() => fetchHistory(true)}
          >
            Refresh
          </button>
        </div>
      </header>

      {lastRefreshed != null && (
        <div className="system-monitoring-refresh-status">
          <span className="system-monitoring-refresh-status-item">
            Last refreshed: {formatTime(lastRefreshed)}
          </span>
          <span className="system-monitoring-refresh-status-item">
            Next refresh: {formatTime(nextRefresh)}
          </span>
        </div>
      )}

      <div className="system-monitoring-card">
        {loading && (
          <div className="system-monitoring-loading">
            <span className="loading-spinner" />
            Loading events…
          </div>
        )}
        {error && (
          <div className="system-monitoring-error">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className="system-monitoring-table-scroll">
            <table className="system-monitoring-table">
              <thead>
                <tr>
                  <th className="col-time">Time (Local)</th>
                  <th className="col-app">Application Name</th>
                  <th className="col-status">Event Status</th>
                  <th className="col-details">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="system-monitoring-empty">
                      {configuredAppNames.length > 0 && history.length > 0
                        ? 'No events match your Job Configuration application list.'
                        : 'No events'}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((row, idx) => (
                    <tr key={idx}>
                      <td className="col-time">{formatTime(row.time)}</td>
                      <td className="col-app">{row.app_name ?? '—'}</td>
                      <td className="col-status">
                        <span className={`event-status ${(row.status || '').toUpperCase() === 'STOPPED' ? 'event-status-stopped' : ''}`}>
                          {row.status ?? '—'}
                        </span>
                      </td>
                      <td className="col-details">{row.details ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemMonitoring;
