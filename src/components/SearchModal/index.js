import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import {
  vectorizerProblemDescriptionURL,
  vectorizerSimilarTicketsURL,
  aiPowerSearchURL,
} from '../../const';
import './index.css';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function getSimilarityResultText(data) {
  if (typeof data?.response === 'string' && data.response.trim()) return data.response.trim();
  if (typeof data?.result === 'string' && data.result.trim()) return data.result.trim();
  if (typeof data?.payload === 'string' && data.payload.trim()) return data.payload.trim();
  return 'No results found.';
}

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

function getApiError(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join('; ');
  }
  return err?.message || fallback;
}

const SearchModal = ({ isOpen, onClose, description, ticketId, searchType }) => {
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const lastFetchKey = useRef('');

  useEffect(() => {
    if (isOpen && searchType) {
      const fetchKey = `${searchType}-${ticketId}`;
      if (fetchKey !== lastFetchKey.current || !hasFetchedRef.current) {
        lastFetchKey.current = fetchKey;
        hasFetchedRef.current = true;
        fetchResults();
      }
    } else if (!isOpen) {
      hasFetchedRef.current = false;
      lastFetchKey.current = '';
      setResults('');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, description, searchType, ticketId]);

  const fetchSimilarity = async (queryText) => {
    const { data } = await axios.post(
      vectorizerSimilarTicketsURL,
      { query: queryText },
      { headers: JSON_HEADERS }
    );
    return getSimilarityResultText(data);
  };

  const fetchWebSearch = async (queryText) => {
    let query = queryText;
    try {
      const { data: probData } = await axios.post(
        vectorizerProblemDescriptionURL,
        { query: queryText },
        { headers: JSON_HEADERS }
      );
      const summarized = probData?.description;
      if (summarized != null && String(summarized).trim() !== '') {
        query = String(summarized).trim();
      }
    } catch (e) {
      console.warn('get-problem-description failed, using raw request text', e);
    }

    const { data } = await axios.post(
      aiPowerSearchURL,
      { session_id: '', query },
      { headers: JSON_HEADERS }
    );
    return getPowerSearchResultText(data);
  };

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    setResults('');

    const queryText = String(description ?? '').trim();
    if (!queryText) {
      setError('No text in Request - Text Request for this ticket.');
      setIsLoading(false);
      return;
    }

    try {
      let text = 'No results found.';
      if (searchType === 'similarity') {
        text = await fetchSimilarity(queryText);
      } else if (searchType === 'webSearch') {
        text = await fetchWebSearch(queryText);
      }
      setResults(text);
    } catch (err) {
      console.error('SearchModal error:', err);
      const fallback = 'Failed to fetch results. Please try again.';
      setError(
        searchType === 'webSearch' ? getAiPowerSearchError(err) : getApiError(err, fallback)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle =
    searchType === 'similarity'
      ? 'AI Context Lookup'
      : searchType === 'webSearch'
        ? 'AI Power Search'
        : 'Search Results';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{modalTitle}</h2>
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
                <p className="modal-ticket-id">Ticket ID: {ticketId}</p>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer">
                        {props.children}
                        {searchType === 'webSearch' && props.href ? ` (${props.href})` : null}
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
