/**
 * Failed IDOC Monitoring (/process-monitor/failed-idocs)
 * API: failedIdocMonitorFeedURL → { result: [...] } or array / OData shapes
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  failedIdocMonitorFeedURL,
  configurationGlobalIntervalsURL,
} from '../../const';
import { parseIntervalToMs } from '../../utils/parseIntervalTime';
import '../batch-monitor/index.css';
import './index.css';

/** Parse OData /Date(ms)/, ISO date string, or epoch number → ms since epoch, or null */
const parseDateValueToMs = (val) => {
  if (val == null || val === '') return null;
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const s = String(val);
  const m = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
  if (m) return parseInt(m[1], 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

const DISPLAY_COLUMNS = [
  { key: 'idoc_number', label: 'IDOC Number' },
  { key: 'status', label: 'Status' },
  { key: 'message_type', label: 'Message Type' },
  { key: 'status_text', label: 'Status Text' },
  { key: 'sender', label: 'Sender' },
  { key: 'receiver', label: 'Receiver' },
  { key: 'creation_date', label: 'Creation Date' },
  { key: 'error_category', label: 'Error Category' },
];

const formatCreationDate = (row) => {
  const ms = parseDateValueToMs(row.creation_date);
  if (ms == null) return '—';
  return new Date(ms).toLocaleString();
};

const formatDisplayCell = (row, col) => {
  if (col.key === 'creation_date') return formatCreationDate(row);
  const val = row[col.key];
  if (val == null || val === '') return '—';
  return String(val);
};

const parseFeedResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.result && Array.isArray(payload.result)) return payload.result;
  if (payload?.d?.results) return payload.d.results;
  if (payload?.results) return payload.results;
  if (payload && typeof payload === 'object' && !payload.error) {
    return Array.isArray(payload.value) ? payload.value : [payload];
  }
  return [];
};

const DEFAULT_POLL_MS = 5 * 60 * 1000;

const FailedIdocMonitoring = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [jobIntervalText, setJobIntervalText] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);

  const pollIntervalMs = useMemo(
    () => parseIntervalToMs(jobIntervalText, DEFAULT_POLL_MS),
    [jobIntervalText]
  );

  const loadGlobalConfiguration = useCallback(async () => {
    try {
      const globalRes = await fetch(configurationGlobalIntervalsURL);
      if (globalRes.ok) {
        const g = await globalRes.json();
        setJobIntervalText(g.job_interval_time ?? '');
      }
    } catch {
      /* keep defaults */
    }
  }, []);

  useEffect(() => {
    loadGlobalConfiguration();
  }, [loadGlobalConfiguration]);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await axios.get(failedIdocMonitorFeedURL);
      setData(parseFeedResponse(response.data));
      const now = new Date();
      setLastRefreshed(now);
      setNextRefresh(new Date(now.getTime() + pollIntervalMs));
    } catch (err) {
      const res = err.response;
      const message = res?.data?.error?.message?.value
        ? res.data.error.message.value
        : res
          ? `Request failed: ${res.status} ${res.statusText}`
          : err.message;
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pollIntervalMs]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchData, pollIntervalMs]);

  const filteredData = useMemo(() => {
    let fromMs = null;
    let toMs = null;

    if (fromDate) {
      const d = new Date(`${fromDate}T00:00:00`);
      fromMs = d.getTime();
    }
    if (toDate) {
      const d = new Date(`${toDate}T23:59:59.999`);
      toMs = d.getTime();
    }

    return data.filter((row) => {
      const creationMs = parseDateValueToMs(row.creation_date);
      if (creationMs == null) return !fromMs && !toMs;
      if (fromMs != null && creationMs < fromMs) return false;
      if (toMs != null && creationMs > toMs) return false;
      return true;
    });
  }, [data, fromDate, toDate]);

  const formatDateTime = (d) => (d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : '—');

  return (
    <div className="batch-monitor-page failed-idoc-page">
      <header className="batch-monitor-header">
        <h1 className="batch-monitor-title">Failed IDOC Monitoring</h1>
        <div className="filter-section">
          <label className="filter-label">
            From date
            <input
              type="date"
              className="filter-date-input"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="filter-label">
            To date
            <input
              type="date"
              className="filter-date-input"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <button type="button" className="filter-btn" onClick={() => fetchData(true)}>
            Refresh
          </button>
        </div>
      </header>

      {lastRefreshed != null && (
        <div className="job-monitor-status">
          <span className="job-monitor-status-item">
            Last refreshed: {formatDateTime(lastRefreshed)}
          </span>
          <span className="job-monitor-status-item">
            Next refresh: {formatDateTime(nextRefresh)}
          </span>
        </div>
      )}

      <div className="chart-container table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading IDOC data…</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button type="button" className="filter-btn" onClick={() => fetchData(true)}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="job-monitor-table">
              <thead>
                <tr>
                  {DISPLAY_COLUMNS.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={DISPLAY_COLUMNS.length} className="empty-cell">
                      No data
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => (
                    <tr
                      key={`${row.idoc_number ?? 'row'}-${idx}`}
                      className={
                        String(row.error_category ?? '').toLowerCase() === 'failed'
                          ? 'row-failed'
                          : ''
                      }
                    >
                      {DISPLAY_COLUMNS.map((col) => (
                        <td key={col.key}>{formatDisplayCell(row, col)}</td>
                      ))}
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
};

export default FailedIdocMonitoring;
