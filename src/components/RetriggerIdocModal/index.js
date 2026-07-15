import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { retriggerBulkIdocsURL } from '../../const';
import { getStoredUser } from '../../utils/authSession';
import './index.css';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function formatFieldValue(value) {
  if (value == null || String(value).trim() === '') return null;
  return String(value).trim();
}

function getApiError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join('; ');
  }
  const message = err?.response?.data?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  return err?.message || 'Failed to retrigger IDOC. Please try again.';
}

/**
 * Parse a SAP multipart HTTP response string into an array of result entries.
 * Each entry maps to one IDoc from resolvedIds (by position).
 *
 * Multipart format:
 *   --BOUNDARY\r\n
 *   Content-Type: application/http\r\n...\r\n
 *   \r\n
 *   HTTP/1.1 200 OK\r\n...\r\n
 *   \r\n
 *   {"@odata.context":"...","value":[...]}
 *   \r\n--BOUNDARY...
 */
function parseMultipartResult(raw, resolvedIds) {
  if (!raw) return [];

  // Not a string — already parsed JSON
  if (typeof raw !== 'string') {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return [raw];
    return [];
  }

  // Detect boundary from the first non-empty line (e.g. "--E19B9D5CFB1FF...")
  const firstLine = raw.split(/\r?\n/)[0]?.trim() ?? '';
  if (!firstLine.startsWith('--')) {
    // Not multipart — try plain JSON
    try { return [JSON.parse(raw)]; } catch { return []; }
  }
  const boundary = firstLine; // e.g. "--E19B9D5..."

  const parts = raw.split(boundary);
  const entries = [];
  let idocIndex = 0;

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === '--') continue;

    // The embedded HTTP response body starts after the second blank line (\r\n\r\n).
    // There are two blank lines: one after multipart headers, one after HTTP headers.
    const doubleCrLfIndex = part.indexOf('\r\n\r\n', part.indexOf('\r\n\r\n') + 4);
    let jsonStr = null;
    if (doubleCrLfIndex !== -1) {
      jsonStr = part.slice(doubleCrLfIndex + 4).trim();
    } else {
      // Fallback: grab the last { ... } block
      const match = part.match(/(\{[\s\S]*\})/);
      jsonStr = match ? match[1].trim() : null;
    }

    if (!jsonStr) continue;

    try {
      const json = JSON.parse(jsonStr);
      const valueArr = Array.isArray(json.value) ? json.value : [];
      const idocNumber = resolvedIds[idocIndex] ?? null;

      if (valueArr.length > 0) {
        valueArr.forEach((item) => {
          entries.push({
            idocNumber: formatFieldValue(item.IvDocnum) ?? idocNumber,
            message: formatFieldValue(item.EvMessage),
            status: formatFieldValue(item.EvStatus),
            hasData: true,
          });
        });
      } else {
        // Empty value array — no detail to show
        entries.push({ idocNumber, message: null, status: null, hasData: false });
      }
      idocIndex++;
    } catch {
      // Skip malformed parts
    }
  }

  return entries;
}

const RetriggerIdocModal = ({ isOpen, onClose, idocno, idocIds }) => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const lastFetchKey = useRef('');

  const resolvedIds = useMemo(() => {
    if (Array.isArray(idocIds) && idocIds.length > 0) {
      return idocIds.map((id) => String(id).trim()).filter(Boolean);
    }
    const single = String(idocno ?? '').trim();
    return single ? [single] : [];
  }, [idocno, idocIds]);

  const fetchRetrigger = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (resolvedIds.length === 0) {
      setError('No IDOC number selected.');
      setIsLoading(false);
      return;
    }

    try {
      const user = getStoredUser();
      const email = user?.email ?? '';
      const { data } = await axios.post(
        retriggerBulkIdocsURL,
        { email, idocno: resolvedIds },
        { headers: JSON_HEADERS }
      );
      setResult(data?.result ?? data);
    } catch (err) {
      console.error('RetriggerIdocModal error:', err);
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [resolvedIds]);

  useEffect(() => {
    if (isOpen && resolvedIds.length > 0) {
      const fetchKey = resolvedIds.join(',');
      if (fetchKey !== lastFetchKey.current || !hasFetchedRef.current) {
        lastFetchKey.current = fetchKey;
        hasFetchedRef.current = true;
        fetchRetrigger();
      }
    } else if (!isOpen) {
      hasFetchedRef.current = false;
      lastFetchKey.current = '';
      setResult(null);
      setError(null);
    }
  }, [isOpen, resolvedIds, fetchRetrigger]);

  if (!isOpen) return null;

  const isBulk = resolvedIds.length > 1;
  const resultEntries = result != null ? parseMultipartResult(result, resolvedIds) : [];
  const detailedEntries = resultEntries.filter((e) => e.hasData);
  const hasAnyDetail = detailedEntries.length > 0;

  return (
    <div className="retrigger-modal-overlay" onClick={onClose}>
      <div className="retrigger-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="retrigger-modal-title">
        <div className="retrigger-modal-header">
          <div className="retrigger-modal-header-main">
            <div className="retrigger-modal-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </div>
            <div>
              <h2 id="retrigger-modal-title" className="retrigger-modal-title">Retrigger IDOC{isBulk ? 's' : ''}</h2>
              <p className="retrigger-modal-subtitle">
                {isBulk
                  ? `Bulk reprocess request for ${resolvedIds.length} IDOCs`
                  : 'Reprocess request result'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="retrigger-modal-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="retrigger-modal-body">
          {isLoading ? (
            <div className="retrigger-modal-loading">
              <div className="retrigger-modal-spinner" />
              <p className="retrigger-modal-loading-title">Processing retrigger request</p>
              <p className="retrigger-modal-loading-text">
                {isBulk
                  ? `Retriggering ${resolvedIds.length} IDOCs, please wait…`
                  : 'Please wait while we contact the SAP system…'}
              </p>
            </div>
          ) : error ? (
            <div className="retrigger-modal-alert retrigger-modal-alert--error">
              <div className="retrigger-modal-alert-icon" aria-hidden="true">!</div>
              <div>
                <p className="retrigger-modal-alert-title">Request failed</p>
                <p className="retrigger-modal-alert-text">{error}</p>
              </div>
            </div>
          ) : hasAnyDetail ? (
            <div className="retrigger-modal-details">
              {detailedEntries.map((entry, i) => (
                <div key={entry.idocNumber ?? i} className="retrigger-bulk-entry">
                  {detailedEntries.length > 1 && (
                    <p className="retrigger-bulk-entry-header">
                      IDOC {i + 1} of {detailedEntries.length}
                    </p>
                  )}
                  <div className="retrigger-detail-card">
                    <span className="retrigger-detail-label">IDOC Number</span>
                    <span className="retrigger-detail-value retrigger-detail-value--mono">
                      {entry.idocNumber || '—'}
                    </span>
                  </div>
                  {entry.message && (
                    <div className="retrigger-detail-card retrigger-detail-card--highlight">
                      <span className="retrigger-detail-label">Response Message</span>
                      <span className="retrigger-detail-value">{entry.message}</span>
                    </div>
                  )}
                  {entry.status && (
                    <div className="retrigger-detail-card">
                      <span className="retrigger-detail-label">Status</span>
                      <span className="retrigger-detail-value">{entry.status}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : result != null ? (
            <div className="retrigger-modal-alert retrigger-modal-alert--success">
              <div className="retrigger-modal-alert-icon" aria-hidden="true">✓</div>
              <div>
                <p className="retrigger-modal-alert-title">Request sent</p>
                <p className="retrigger-modal-alert-text">
                  {resolvedIds.length} IDOC{resolvedIds.length === 1 ? '' : 's'} submitted for reprocessing.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="retrigger-modal-footer">
          {error && (
            <button type="button" className="retrigger-btn retrigger-btn--secondary" onClick={fetchRetrigger}>
              Try again
            </button>
          )}
          <button type="button" className="retrigger-btn retrigger-btn--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetriggerIdocModal;
