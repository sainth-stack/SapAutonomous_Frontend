import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { aiPowerSearchURL } from '../../const';
import './index.css';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function getPowerSearchResultText(data) {
  if (typeof data?.answer === 'string' && data.answer.trim()) return data.answer.trim();
  if (typeof data?.response === 'string' && data.response.trim()) return data.response.trim();
  if (typeof data?.result === 'string' && data.result.trim()) return data.result.trim();
  return 'No results found.';
}

function getAiPowerSearchError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return err?.message || 'Failed to fetch results. Please try again.';
}

const SearchModal = ({
  isOpen,
  onClose,
  description,
  ticketId,
  identifierLabel = 'Ticket ID',
}) => {
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const lastFetchKey = useRef('');

  useEffect(() => {
    if (isOpen) {
      const fetchKey = String(ticketId ?? '');
      if (fetchKey !== lastFetchKey.current || !hasFetchedRef.current) {
        lastFetchKey.current = fetchKey;
        hasFetchedRef.current = true;
        fetchResults();
      }
    } else {
      hasFetchedRef.current = false;
      lastFetchKey.current = '';
      setResults('');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, description, ticketId]);

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    setResults('');

    const queryText = String(description ?? '').trim();
    if (!queryText) {
      setError('No text available for this IDOC.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        aiPowerSearchURL,
        { session_id: '', query: queryText },
        { headers: JSON_HEADERS }
      );
      setResults(getPowerSearchResultText(data));
    } catch (err) {
      console.error('SearchModal error:', err);
      setError(getAiPowerSearchError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">AI Power Search</h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="modal-loader">
              <div className="loader-spinner" />
              <p>Fetching results...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="results-section">
              <div className="results-content">
                <p className="modal-ticket-id">{identifierLabel}: {ticketId}</p>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer">
                        {props.children}
                        {props.href ? ` (${props.href})` : null}
                      </a>
                    ),
                  }}
                >
                  {results || 'No results found.'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
