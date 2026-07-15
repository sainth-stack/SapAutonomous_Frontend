/**
 * Failed IDOC Monitoring (/process-monitor/failed-idocs)
 * API: failedIdocMonitorFeedURL → { result: [...] } or array / OData shapes
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  failedIdocMonitorFeedURL,
  configurationFailedIdocsURL,
  configurationGlobalIntervalsURL,
} from '../../const';
import { parseIntervalToMs } from '../../utils/parseIntervalTime';
import SearchModal from '../../components/SearchModal';
import RetriggerIdocModal from '../../components/RetriggerIdocModal';
import FailedIdocFilters from './FailedIdocFilters';
import FailedIdocPagination from './FailedIdocPagination';
import '../batch-monitor/index.css';
import './index.css';
import { getStoredUser } from '../../utils/authSession';
import { addAppLog } from '../../utils/logger';


const INITIAL_FILTERS = {
  status: [],
  messageType: [],
  sender: [],
  receiver: [],
  errorCategory: [],
};

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

const getRowField = (row, field) => String(row[field] ?? '').trim();

const getSortValue = (row, key) => {
  if (key === 'creation_date') {
    return parseDateValueToMs(row.creation_date);
  }
  if (key === 'idoc_number') {
    const raw = getRowField(row, key);
    const num = Number(raw);
    if (raw !== '' && !Number.isNaN(num)) return num;
    return raw.toLowerCase();
  }
  return getRowField(row, key).toLowerCase();
};

const compareSortValues = (aVal, bVal, direction) => {
  const dir = direction === 'asc' ? 1 : -1;
  const aEmpty = aVal == null || aVal === '';
  const bEmpty = bVal == null || bVal === '';
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return (aVal - bVal) * dir;
  }
  return String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) * dir;
};

const DEFAULT_POLL_MS = 3 * 60 * 1000;
const ITEMS_PER_PAGE = 10;

/** True when a feed row matches a configured Failed IDOC entry (non-empty config fields must match). */
const rowMatchesFailedIdocConfig = (row, config) => {
  const pairs = [
    ['message_type', config.message_type],
    ['sender', config.sender],
    ['receiver', config.receiver],
  ];
  return pairs.every(([field, expected]) => {
    const exp = String(expected ?? '').trim();
    if (!exp) return true;
    return getRowField(row, field) === exp;
  });
};

const FailedIdocMonitoring = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [failedIdocIntervalText, setFailedIdocIntervalText] = useState('3');
  const [configuredFailedIdocs, setConfiguredFailedIdocs] = useState([]);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isRetriggerModalOpen, setIsRetriggerModalOpen] = useState(false);
  const [selectedIdocIds, setSelectedIdocIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'creation_date', direction: 'desc' });

  const pollIntervalMs = useMemo(
    () => parseIntervalToMs(failedIdocIntervalText, DEFAULT_POLL_MS),
    [failedIdocIntervalText]
  );

  const loadGlobalConfiguration = useCallback(async () => {
    try {
      const [globalRes, configRes] = await Promise.all([
        fetch(configurationGlobalIntervalsURL),
        fetch(configurationFailedIdocsURL),
      ]);
      if (globalRes.ok) {
        const g = await globalRes.json();
        setFailedIdocIntervalText(g.failed_idoc_interval_time ?? '3');
      }
      if (configRes.ok) {
        const rows = await configRes.json();
        setConfiguredFailedIdocs(Array.isArray(rows) ? rows : []);
      }
    } catch {
      /* keep defaults */
    } finally {
      setConfigLoaded(true);
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

  const getUniqueValues = useCallback(
    (field) => {
      const set = new Set();
      data.forEach((row) => {
        const value = getRowField(row, field);
        if (value) set.add(value);
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },
    [data]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

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

    let rows = data;
    if (configLoaded && configuredFailedIdocs.length > 0) {
      rows = rows.filter((row) =>
        configuredFailedIdocs.some((cfg) => rowMatchesFailedIdocConfig(row, cfg))
      );
    }

    return rows.filter((row) => {
      const creationMs = parseDateValueToMs(row.creation_date);
      if (creationMs == null) {
        if (fromMs || toMs) return false;
      } else {
        if (fromMs != null && creationMs < fromMs) return false;
        if (toMs != null && creationMs > toMs) return false;
      }

      if (filters.status.length > 0 && !filters.status.includes(getRowField(row, 'status'))) {
        return false;
      }
      if (
        filters.messageType.length > 0 &&
        !filters.messageType.includes(getRowField(row, 'message_type'))
      ) {
        return false;
      }
      if (filters.sender.length > 0 && !filters.sender.includes(getRowField(row, 'sender'))) {
        return false;
      }
      if (filters.receiver.length > 0 && !filters.receiver.includes(getRowField(row, 'receiver'))) {
        return false;
      }
      if (
        filters.errorCategory.length > 0 &&
        !filters.errorCategory.includes(getRowField(row, 'error_category'))
      ) {
        return false;
      }

      return true;
    });
  }, [data, fromDate, toDate, filters, configLoaded, configuredFailedIdocs]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) =>
      compareSortValues(getSortValue(a, key), getSortValue(b, key), direction)
    );
  }, [filteredData, sortConfig]);

  const { paginatedData, totalPages } = useMemo(() => {
    const total = sortedData.length;
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, pages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return {
      paginatedData: sortedData.slice(start, start + ITEMS_PER_PAGE),
      totalPages: pages,
    };
  }, [sortedData, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatDateTime = (d) => (d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : '—');

  const handlePowerSearchClick = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const getRowIdocNumber = (row) => getRowField(row, 'idoc_number');

  const handleRowSelect = (idocNumber) => {
    const id = String(idocNumber ?? '').trim();
    if (!id) return;
    setSelectedIdocIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const pageIdocNumbers = useMemo(
    () => paginatedData.map(getRowIdocNumber).filter(Boolean),
    [paginatedData]
  );

  const allPageSelected =
    pageIdocNumbers.length > 0 && pageIdocNumbers.every((id) => selectedIdocIds.includes(id));
  const somePageSelected =
    !allPageSelected && pageIdocNumbers.some((id) => selectedIdocIds.includes(id));

  const handleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIdocIds((prev) => prev.filter((id) => !pageIdocNumbers.includes(id)));
    } else {
      setSelectedIdocIds((prev) => {
        const next = [...prev];
        pageIdocNumbers.forEach((id) => { if (!next.includes(id)) next.push(id); });
        return next;
      });
    }
  };

  const handleRetriggerSelected = () => {
    if (selectedIdocIds.length === 0) return;
    setIsRetriggerModalOpen(true);
  };

  const handleCloseRetriggerModal = () => {
    setIsRetriggerModalOpen(false);
  };

  useEffect(() => {
    setSelectedIdocIds([]);
  }, [currentPage, fromDate, toDate, filters]);

  const totalColumns = DISPLAY_COLUMNS.length + 2;

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

      <FailedIdocFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        getUniqueValues={getUniqueValues}
      />

      <div className="failed-idoc-table-toolbar">
        <FailedIdocPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
        <div className="failed-idoc-toolbar-actions">
          {selectedIdocIds.length > 0 && (
            <span className="failed-idoc-selection-pill">
              {selectedIdocIds.length} IDOC{selectedIdocIds.length === 1 ? '' : 's'} selected
            </span>
          )}
          <button
            type="button"
            className="failed-idoc-retrigger-btn"
            onClick={handleRetriggerSelected}
            disabled={loading || selectedIdocIds.length === 0}
          >
            Retrigger IDOC
          </button>
        </div>
      </div>

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
                  <th className="failed-idoc-select-th" scope="col">
                    <div className="failed-idoc-select-cell-inner">
                      <label className="failed-idoc-checkbox-label">
                        <input
                          type="checkbox"
                          className="failed-idoc-row-checkbox"
                          checked={allPageSelected}
                          ref={(el) => { if (el) el.indeterminate = somePageSelected; }}
                          onChange={handleSelectAll}
                          disabled={loading || pageIdocNumbers.length === 0}
                          aria-label="Select all IDOCs on this page"
                        />
                        <span className="failed-idoc-checkbox-custom failed-idoc-checkbox-custom--header" aria-hidden="true">
                          <svg viewBox="0 0 12 10" fill="none" className="failed-idoc-checkbox-icon">
                            <path d="M1 5.5L4.5 9L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </label>
                    </div>
                  </th>
                  {DISPLAY_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="failed-idoc-sortable-th"
                      onClick={() => !loading && handleSort(col.key)}
                      aria-sort={
                        sortConfig.key === col.key
                          ? sortConfig.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <span className="failed-idoc-th-label">
                        {col.label}
                        {sortConfig.key === col.key && (
                          <span className="failed-idoc-sort-indicator" aria-hidden="true">
                            {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="failed-idoc-action-th">Power Search</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={totalColumns} className="empty-cell">
                      No data
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => {
                    const idocNumber = getRowIdocNumber(row);
                    const isSelected = idocNumber && selectedIdocIds.includes(idocNumber);
                    const rowClass = [
                      String(row.error_category ?? '').toLowerCase() === 'failed'
                        ? 'row-failed'
                        : '',
                      isSelected ? 'failed-idoc-row-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                    <tr
                      key={`${row.idoc_number ?? 'row'}-${idx}`}
                      className={rowClass || undefined}
                    >
                      <td className="failed-idoc-select-cell">
                        {idocNumber ? (
                          <div className="failed-idoc-select-cell-inner">
                            <label className="failed-idoc-checkbox-label">
                            <input
                              type="checkbox"
                              className="failed-idoc-row-checkbox"
                              checked={isSelected}
                              onChange={() => handleRowSelect(idocNumber)}
                              aria-label={`Select IDOC ${idocNumber}`}
                            />
                            <span className="failed-idoc-checkbox-custom" aria-hidden="true">
                              <svg viewBox="0 0 12 10" fill="none" className="failed-idoc-checkbox-icon">
                                <path
                                  d="M1 5.5L4.5 9L11 1"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </label>
                          </div>
                        ) : (
                          <div className="failed-idoc-select-cell-inner">
                            <span className="failed-idoc-select-empty">—</span>
                          </div>
                        )}
                      </td>
                      {DISPLAY_COLUMNS.map((col) => (
                        <td key={col.key}>{formatDisplayCell(row, col)}</td>
                      ))}
                      <td className="failed-idoc-action-cell">
                        {row.status_text != null && String(row.status_text).trim() !== '' ? (
                          <button
                            type="button"
                            onClick={() => handlePowerSearchClick(row)}
                            className="failed-idoc-power-search-link"
                          >
                            Click here
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRow && (
        <SearchModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          description={String(selectedRow.status_text ?? '')}
          ticketId={selectedRow.idoc_number}
          searchType="webSearch"
          identifierLabel="IDOC Number"
          directPowerSearch
        />
      )}

      {isRetriggerModalOpen && selectedIdocIds.length > 0 && (
        <RetriggerIdocModal
          isOpen={isRetriggerModalOpen}
          onClose={handleCloseRetriggerModal}
          idocIds={selectedIdocIds}
        />
      )}
    </div>
  );
};

export default FailedIdocMonitoring;
