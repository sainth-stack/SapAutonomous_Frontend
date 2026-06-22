import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { retriggerIdocsURL } from '../../const';
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

const RetriggerIdocModal = ({ isOpen, onClose, idocno }) => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const lastFetchKey = useRef('');

  const fetchRetrigger = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const idocNumber = String(idocno ?? '').trim();
    if (!idocNumber) {
      setError('No IDOC number available for this row.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        retriggerIdocsURL,
        { idocno: idocNumber },
        { headers: JSON_HEADERS }
      );
      setResult(data?.result ?? data);
    } catch (err) {
      console.error('RetriggerIdocModal error:', err);
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [idocno]);

  useEffect(() => {
    if (isOpen && idocno) {
      const fetchKey = String(idocno);
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
  }, [isOpen, idocno, fetchRetrigger]);

  if (!isOpen) return null;

  const idocNumber = formatFieldValue(result?.IvDocnum ?? idocno);
  const message = formatFieldValue(result?.EvMessage);
  const status = formatFieldValue(result?.EvStatus);

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
              <h2 id="retrigger-modal-title" className="retrigger-modal-title">Retrigger IDOC</h2>
              <p className="retrigger-modal-subtitle">Reprocess request result</p>
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
              <p className="retrigger-modal-loading-text">Please wait while we contact the SAP system…</p>
            </div>
          ) : error ? (
            <div className="retrigger-modal-alert retrigger-modal-alert--error">
              <div className="retrigger-modal-alert-icon" aria-hidden="true">!</div>
              <div>
                <p className="retrigger-modal-alert-title">Request failed</p>
                <p className="retrigger-modal-alert-text">{error}</p>
              </div>
            </div>
          ) : (
            <div className="retrigger-modal-details">
              <div className="retrigger-detail-card">
                <span className="retrigger-detail-label">IDOC Number</span>
                <span className="retrigger-detail-value retrigger-detail-value--mono">{idocNumber || '—'}</span>
              </div>

              <div className="retrigger-detail-card retrigger-detail-card--highlight">
                <span className="retrigger-detail-label">Response Message</span>
                <span className="retrigger-detail-value">{message || 'No message returned.'}</span>
              </div>

              {status && (
                <div className="retrigger-detail-card">
                  <span className="retrigger-detail-label">Status</span>
                  <span className="retrigger-detail-value">{status}</span>
                </div>
              )}
            </div>
          )}
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
