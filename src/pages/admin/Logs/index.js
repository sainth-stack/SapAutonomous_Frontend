import React, { useState, useCallback, useMemo, useEffect } from "react";
import { userActivityURL } from "../../../const";
import "../common.css";
import "./index.css";

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const LOG_TYPE_META = {
  s: { label: "Success", className: "log-badge success" },
  e: { label: "Error", className: "log-badge error" },
  i: { label: "Info", className: "log-badge info" },
  "page opened": { label: "Page Opened", className: "log-badge page" },
};

function getBadgeMeta(rawType) {
  const key = (rawType || "").toLowerCase().trim();
  return LOG_TYPE_META[key] || { label: rawType || "—", className: "log-badge default" };
}

/**
 * Parses a single log line.
 * Expected format: {module}_{program}_{user}_{ISO_timestamp}_{log_type}::{content}
 */
function parseLogLine(line, idx) {
  if (!line.trim()) return null;

  const sepIdx = line.indexOf("::");
  if (sepIdx === -1) return { raw: line, idx };

  const meta = line.substring(0, sepIdx);
  const content = line.substring(sepIdx + 2);

  // Anchor on ISO timestamp
  const tsMatch = meta.match(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/);
  if (!tsMatch) return { raw: line, content, idx };

  const timestamp = tsMatch[1];
  const tsStart = meta.indexOf(timestamp);

  const beforeTs = meta.substring(0, tsStart).replace(/_$/, "");
  const afterTs = meta.substring(tsStart + timestamp.length).replace(/^_/, "");

  const logType = afterTs;

  // Try to extract email (user field)
  const emailMatch = beforeTs.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
  let moduleName = beforeTs;
  let programName = "";
  let user = "";

  if (emailMatch) {
    user = emailMatch[1];
    const emailIdx = beforeTs.indexOf(user);
    const prefix = beforeTs.substring(0, emailIdx).replace(/_$/, "");
    // prefix = module_name_program_name — split on last underscore segment that isn't part of a name
    // Use first underscore as module/program boundary
    const firstUs = prefix.indexOf("_");
    if (firstUs !== -1) {
      moduleName = prefix.substring(0, firstUs);
      programName = prefix.substring(firstUs + 1);
    } else {
      moduleName = prefix;
      programName = "";
    }
  } else {
    // No email — split on first underscore
    const firstUs = beforeTs.indexOf("_");
    if (firstUs !== -1) {
      moduleName = beforeTs.substring(0, firstUs);
      programName = beforeTs.substring(firstUs + 1);
    }
  }

  return { idx, moduleName, programName, user, timestamp, logType, content, raw: line };
}

function formatTimestamp(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

const AdminLogs = () => {
  const [fromDate, setFromDate] = useState(YESTERDAY);
  const [toDate, setToDate] = useState(TODAY);
  const [rawLines, setRawLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError("Please select both From date and To date.");
      return;
    }
    setLoading(true);
    setError("");
    setRawLines([]);
    setFetched(false);
    try {
      const url = `${userActivityURL}?from_date=${fromDate}&to_date=${toDate}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const text = await res.text();
      const lines = text.split("\n").filter((l) => l.trim());
      setRawLines(lines);
      setFetched(true);
    } catch (err) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Auto-load on mount
  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = useMemo(() => {
    return rawLines.map((line, idx) => parseLogLine(line, idx + 1)).filter(Boolean);
  }, [rawLines]);

  const allTypes = useMemo(() => {
    const types = new Set(parsed.map((r) => (r.logType || "").toLowerCase().trim()).filter(Boolean));
    return Array.from(types).sort();
  }, [parsed]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return parsed.filter((row) => {
      if (typeFilter !== "all" && (row.logType || "").toLowerCase().trim() !== typeFilter) return false;
      if (q) {
        const haystack = [row.moduleName, row.programName, row.user, row.content, row.timestamp, row.logType]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [parsed, search, typeFilter]);

  const downloadUrl = `${userActivityURL}?from_date=${fromDate}&to_date=${toDate}`;

  return (
    <div className="admin-page-container">
      <div className="admin-page-content logs-content">
        <div className="header-section">
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">View user activity across all modules with date-range filtering</p>
        </div>

        {/* Date filter bar */}
        <div className="logs-filter-bar">
          <div className="logs-date-group">
            <label className="logs-label">From date</label>
            <input
              type="date"
              className="admin-input logs-date-input"
              value={fromDate}
              max={toDate || TODAY}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="logs-date-group">
            <label className="logs-label">To date</label>
            <input
              type="date"
              className="admin-input logs-date-input"
              value={toDate}
              min={fromDate || undefined}
              max={TODAY}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-btn primary logs-fetch-btn"
            onClick={fetchLogs}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load Logs"}
          </button>
          {fetched && (
            <a
              href={downloadUrl}
              download={`logs-${fromDate}-to-${toDate}.txt`}
              className="admin-btn secondary logs-download-btn"
            >
              Download Raw
            </a>
          )}
        </div>

        {error && <div className="logs-error">{error}</div>}

        {/* Search + type filter */}
        {fetched && (
          <div className="logs-search-bar">
            <input
              type="text"
              className="admin-input logs-search-input"
              placeholder="Search by module, user, content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="admin-input logs-type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All types</option>
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {getBadgeMeta(t).label}
                </option>
              ))}
            </select>
            <span className="logs-count">
              Showing <strong>{filtered.length}</strong> of <strong>{parsed.length}</strong> entries
            </span>
          </div>
        )}

        {loading && (
          <div className="logs-state-msg">
            <div className="logs-spinner" />
            <span>Fetching logs…</span>
          </div>
        )}

        {fetched && !loading && filtered.length === 0 && (
          <p className="admin-empty">No log entries match the current filters.</p>
        )}

        {fetched && !loading && filtered.length > 0 && (
          <div className="admin-table-wrap logs-table-wrap">
            <table className="admin-table logs-table">
              <thead>
                <tr>
                  <th className="logs-th-num">#</th>
                  <th>Timestamp</th>
                  <th>Module</th>
                  <th>Program</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const badge = getBadgeMeta(row.logType);
                  const isError = (row.logType || "").toLowerCase() === "e";
                  return (
                    <tr key={row.idx} className={isError ? "log-row-error" : ""}>
                      <td className="logs-td-num">{row.idx}</td>
                      <td className="logs-td-ts">{row.timestamp ? formatTimestamp(row.timestamp) : "—"}</td>
                      <td className="logs-td-module">{row.moduleName || "—"}</td>
                      <td className="logs-td-program">{row.programName || "—"}</td>
                      <td className="logs-td-user">{row.user || "—"}</td>
                      <td className="logs-td-type">
                        <span className={badge.className}>{badge.label}</span>
                      </td>
                      <td className="logs-td-content">{row.content || row.raw || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!fetched && !loading && (
          <div className="logs-empty-state">
            <div className="logs-empty-icon">📋</div>
            <p>Select a date range and click <strong>Load Logs</strong> to view activity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
