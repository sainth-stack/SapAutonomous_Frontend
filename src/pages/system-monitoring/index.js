import React, { useState, useEffect, useCallback } from 'react';
import { systemMonitoringHistoryURL } from '../../const';
import './index.css';

function SystemMonitoring() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(systemMonitoringHistoryURL);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const formatTime = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleString();
  };

  return (
    <div className="system-monitoring-page">
      <header className="system-monitoring-header">
        <h1 className="system-monitoring-title">System Monitoring</h1>
      </header>

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
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="system-monitoring-empty">No events</td>
                  </tr>
                ) : (
                  history.map((row, idx) => (
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
