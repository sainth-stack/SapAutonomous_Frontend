/**
 * Background Job Monitoring (/process-monitor/thanksgiving)
 * API: backgroundJobMonitorFeedURL → JSON array or OData { d: { results } } (same row shape: JobName, RunTimeSeconds, …)
 * - Table columns: Jobname, Runtime, Avg run time, Scheduled start date, Execution time (ExecutionStartDate), Actual end date, Status, Scheduled by
 * - Row highlight when runtime exceeds 15-day avg + tolerance (stats computed in background)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { backgroundJobMonitorFeedURL, configurationJobsURL, configurationGlobalIntervalsURL } from '../../const';
import { parseIntervalToMs } from '../../utils/parseIntervalTime';
import './index.css';

/** Parse OData /Date(ms)/, ISO date string, or epoch number → ms since epoch, or null */
const parseDateValueToMs = (val) => {
  if (val == null || val === '') return null;
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const s = String(val);
  const m = s.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
  if (m) return parseInt(m[1], 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.getTime();
};

/** SAP-style HHMMSS (e.g. "093020") combined with date-only ms → local timestamp ms */
const applySapTimeToMs = (dateMs, timeStr) => {
  if (dateMs == null) return null;
  if (timeStr == null || String(timeStr).trim() === '') return dateMs;
  const t = String(timeStr).replace(/\D/g, '');
  if (t.length < 4) return dateMs;
  const h = parseInt(t.slice(0, 2), 10) || 0;
  const min = parseInt(t.slice(2, 4), 10) || 0;
  const sec = t.length >= 6 ? parseInt(t.slice(4, 6), 10) || 0 : 0;
  const d = new Date(dateMs);
  d.setHours(h, min, sec, 0);
  return d.getTime();
};

const getRowTimestampMs = (row, dateKey, timeKey) => {
  const base = parseDateValueToMs(row[dateKey]);
  if (base == null) return null;
  if (timeKey != null && row[timeKey] != null && row[timeKey] !== '') {
    return applySapTimeToMs(base, row[timeKey]);
  }
  return base;
};

const getRowExecutionOrScheduleMs = (row) =>
  getRowTimestampMs(row, 'ExecutionStartDate', 'ExecutionStartTime') ??
  getRowTimestampMs(row, 'ScheduledStartDate', 'ScheduledStartTime') ??
  getRowTimestampMs(row, 'ActualEndDate', 'ActualEndTime');

/** Compute mean of numbers */
const mean = (arr) => {
  if (!arr?.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

/** Compute standard deviation */
const stdDev = (arr) => {
  if (!arr?.length) return 0;
  const m = mean(arr);
  const sqDiffs = arr.map((x) => (x - m) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / arr.length);
};

/** Get run duration in seconds from a row (API uses RunTimeSeconds) */
const getRuntimeSeconds = (row) => {
  const v =
    row.RunTimeSeconds ??
    row.durationInSeconds ??
    row.runtimeSeconds ??
    row.runtime ??
    row.duration;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  return 0;
};

/** Visible columns for /process-monitor/thanksgiving (requested headers only) */
const DISPLAY_COLUMNS = [
  { key: 'JobName', label: 'Jobname' },
  { key: 'RunTimeSeconds', label: 'Runtime' },
  { key: '_avgRunTime', label: 'Avg run time' },
  { key: '_scheduledStart', label: 'Scheduled start date' },
  { key: '_executionTime', label: 'Execution time' },
  { key: '_actualEnd', label: 'Actual end date' },
  { key: 'JobStatus', label: 'Status' },
  { key: 'ScheduledBy', label: 'Scheduled by' },
];

const formatScheduledStart = (row) => {
  const ms = getRowTimestampMs(row, 'ScheduledStartDate', 'ScheduledStartTime');
  if (ms == null) return '—';
  return new Date(ms).toLocaleString();
};

const formatActualEnd = (row) => {
  const ms = getRowTimestampMs(row, 'ActualEndDate', 'ActualEndTime');
  if (ms == null) return '—';
  return new Date(ms).toLocaleString();
};

/** Execution start: OData /Date()/ or ISO date + optional ExecutionStartTime */
const formatExecutionStart = (row) => {
  const ms = getRowTimestampMs(row, 'ExecutionStartDate', 'ExecutionStartTime');
  if (ms == null) return '—';
  return new Date(ms).toLocaleString();
};

const formatJobStatus = (row) => {
  const raw = row.JobStatus ?? row.jobStatus;
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  if (s.toUpperCase() === 'F') return 'Failed';
  if (s.toUpperCase() === 'A') return 'Failed';
  return s;
};

const formatDisplayCell = (row, col) => {
  if (col.key === 'JobName') {
    const n = row.JobName ?? row.jobName;
    return n != null && String(n).trim() !== '' ? String(n) : '—';
  }
  if (col.key === '_avgRunTime') {
    return typeof row._avgRunTime === 'number' ? `${row._avgRunTime.toFixed(2)}s` : '—';
  }
  if (col.key === '_scheduledStart') return formatScheduledStart(row);
  if (col.key === '_actualEnd') return formatActualEnd(row);
  if (col.key === '_executionTime') return formatExecutionStart(row);
  if (col.key === 'JobStatus') return formatJobStatus(row);
  if (col.key === 'RunTimeSeconds') {
    const s = getRuntimeSeconds(row);
    return s > 0 ? `${s}` : String(row.RunTimeSeconds ?? '—');
  }
  const val = row[col.key];
  if (val == null || val === '') return '—';
  return String(val);
};

const DEFAULT_POLL_MS = 5 * 60 * 1000;

const BackgroundJobMonitoring = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobNameFilter, setJobNameFilter] = useState('');
  const [configuredJobNames, setConfiguredJobNames] = useState([]);
  const [jobIntervalText, setJobIntervalText] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const pollIntervalMs = useMemo(
    () => parseIntervalToMs(jobIntervalText, DEFAULT_POLL_MS),
    [jobIntervalText]
  );

  const loadJobConfiguration = useCallback(async () => {
    try {
      const [jobsRes, globalRes] = await Promise.all([
        fetch(configurationJobsURL),
        fetch(configurationGlobalIntervalsURL),
      ]);
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        const names = (Array.isArray(jobs) ? jobs : [])
          .map((j) => (j.job_name || '').trim())
          .filter(Boolean);
        setConfiguredJobNames(names);
      }
      if (globalRes.ok) {
        const g = await globalRes.json();
        setJobIntervalText(g.job_interval_time ?? '');
      }
    } catch {
      /* keep defaults */
    } finally {
      setConfigLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadJobConfiguration();
  }, [loadJobConfiguration]);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await axios.get(backgroundJobMonitorFeedURL);
      let list = response.data;
      if (Array.isArray(list)) {
        setData(list);
      } else if (list?.d?.results) {
        setData(list.d.results);
      } else if (list?.results) {
        setData(list.results);
      } else if (list && typeof list === 'object' && !list.error) {
        setData(Array.isArray(list.value) ? list.value : [list]);
      } else {
        setData([]);
      }
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

  const runtimes = useMemo(
    () => data.map((row) => getRuntimeSeconds(row)).filter((n) => n > 0),
    [data]
  );

  const dailyAvg = useMemo(() => {
    if (!runtimes.length) return null;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastDay = data
      .filter((r) => {
        const ms = getRowExecutionOrScheduleMs(r);
        if (ms == null) return true;
        return now - ms <= oneDayMs;
      })
      .map(getRuntimeSeconds)
      .filter((n) => n > 0);
    return lastDay.length ? mean(lastDay) : mean(runtimes);
  }, [data, runtimes]);

  const fifteenDayAvg = useMemo(() => {
    if (!runtimes.length) return null;
    return mean(runtimes);
  }, [runtimes]);

  const standardDeviation = useMemo(() => {
    if (runtimes.length < 2) return null;
    return stdDev(runtimes);
  }, [runtimes]);

  const toleranceSeconds = useMemo(() => {
    if (standardDeviation == null || standardDeviation <= 0) return null;
    return Math.max(0.1, standardDeviation * 2);
  }, [standardDeviation]);

  const uniqueJobNamesFromApi = useMemo(() => {
    const set = new Set();
    data.forEach((row) => {
      const name = row.JobName ?? row.jobName ?? '';
      if (name !== '' && name != null) set.add(String(name));
    });
    return Array.from(set).sort();
  }, [data]);

  /** Dropdown: nothing until config API finishes; then configured names or names from feed */
  const jobNameOptions = useMemo(() => {
    if (!configLoaded) return [];
    if (configuredJobNames.length > 0) return [...configuredJobNames].sort();
    return uniqueJobNamesFromApi;
  }, [configLoaded, configuredJobNames, uniqueJobNamesFromApi]);

  useEffect(() => {
    if (
      jobNameFilter &&
      configuredJobNames.length > 0 &&
      !configuredJobNames.includes(jobNameFilter)
    ) {
      setJobNameFilter('');
    }
  }, [configuredJobNames, jobNameFilter]);

  const filteredData = useMemo(() => {
    const getName = (row) => String(row.JobName ?? row.jobName ?? '').trim();
    let rows = data;
    if (configLoaded && configuredJobNames.length > 0) {
      const allow = new Set(configuredJobNames);
      rows = rows.filter((row) => allow.has(getName(row)));
    }
    if (jobNameFilter) {
      rows = rows.filter((row) => getName(row) === jobNameFilter);
    }
    return rows;
  }, [data, configLoaded, configuredJobNames, jobNameFilter]);

  const rowsWithStats = useMemo(() => {
    return filteredData.map((row) => {
      const runtime = getRuntimeSeconds(row);
      const exceedsTolerance =
        fifteenDayAvg != null &&
        toleranceSeconds != null &&
        runtime > fifteenDayAvg + toleranceSeconds;
      return {
        ...row,
        _runtime: runtime,
        _avgRunTime: fifteenDayAvg,
        _avgRuntimeDaily: dailyAvg,
        _avgRuntime15Day: fifteenDayAvg,
        _standardDeviation: standardDeviation,
        _tolerance: toleranceSeconds,
        _exceedsTolerance: exceedsTolerance,
      };
    });
  }, [filteredData, dailyAvg, fifteenDayAvg, standardDeviation, toleranceSeconds]);

  const formatDateTime = (d) => (d && !isNaN(d.getTime()) ? d.toLocaleString() : '—');

  return (
    <div className="batch-monitor-page">
      <header className="batch-monitor-header">
        <h1 className="batch-monitor-title">Background Job Monitoring</h1>
        <div className="filter-section">
          <label className="filter-label">
            Filter by job name
            <select
              className="filter-select"
              value={jobNameFilter}
              onChange={(e) => setJobNameFilter(e.target.value)}
              disabled={!configLoaded}
            >
              <option value="">
                {!configLoaded
                  ? 'Loading configuration…'
                  : configuredJobNames.length > 0
                    ? 'All configured jobs'
                    : 'All job names'}
              </option>
              {jobNameOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="filter-btn" onClick={() => fetchData(true)}>
            Refresh
          </button>
        </div>
      </header>

      {lastRefreshed != null && (
        <div className="job-monitor-status">
          <span className="job-monitor-status-item">Last refreshed: {formatDateTime(lastRefreshed)}</span>
          <span className="job-monitor-status-item">Next refresh: {formatDateTime(nextRefresh)}</span>
        </div>
      )}

      <div className="chart-container table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading job data…</p>
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
                {rowsWithStats.length === 0 ? (
                  <tr>
                    <td colSpan={DISPLAY_COLUMNS.length} className="empty-cell">
                      No data
                    </td>
                  </tr>
                ) : (
                  rowsWithStats.map((row, idx) => (
                    <tr key={idx} className={row._exceedsTolerance ? 'row-exceeds' : ''}>
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

export default BackgroundJobMonitoring;
