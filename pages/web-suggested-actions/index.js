import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { aiPowerSearchURL } from '../../const';
import {
  getAiPowerSearchSessionId,
  setAiPowerSearchSessionId,
  parseAiPowerSearchResponse,
  getAiPowerSearchError,
} from '../../utils/aiPowerSearch';
import './index.css';

const markdownLinkComponent = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {props.children}
      {props.href ? ` (${props.href})` : null}
    </a>
  ),
};

const WebSuggestedActions = () => {
  const [query, setQuery] = useState('');
  const [markdownResult, setMarkdownResult] = useState('');
  const [suggestedActions, setSuggestedActions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setMarkdownResult('');
    setSuggestedActions(null);

    try {
      const response = await axios.post(
        aiPowerSearchURL,
        {
          session_id: getAiPowerSearchSessionId(),
          query: trimmed,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const parsed = parseAiPowerSearchResponse(response.data);
      if (parsed.sessionId) {
        setAiPowerSearchSessionId(parsed.sessionId);
      }

      if (parsed.actions?.length) {
        setSuggestedActions(parsed.actions);
      } else if (parsed.markdown) {
        setMarkdownResult(parsed.markdown);
      } else {
        setMarkdownResult('No results found.');
      }
    } catch (err) {
      console.error('AI power search error:', err);
      setError(getAiPowerSearchError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const hasResults = Boolean(markdownResult) || (suggestedActions && suggestedActions.length > 0);

  return (
    <div className="web-suggested-actions-container">
      <div className="search-header">
        <h1>AI Power Search</h1>
        <p>Search SAP community knowledge and get step-by-step suggested actions for your issue.</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-input-group">
          <textarea
            className="search-textarea"
            placeholder="Describe your issue (e.g., SAP BTP connectivity failed with S/4HANA)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            disabled={isLoading}
            rows={4}
          />
          <button type="submit" className="search-button" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                Searching...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </>
            )}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {hasResults && (
        <div className="results-section">
          {suggestedActions?.length > 0 ? (
            <div className="suggested-actions-list">
              {suggestedActions.map((item, index) => (
                <article key={`${item.title}-${index}`} className="suggested-action-card">
                  <h3 className="suggested-action-title">{item.title}</h3>
                  {item.url && (
                    <a
                      href={item.url}
                      className="suggested-action-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View reference
                    </a>
                  )}
                  <div className="suggested-action-body results-content">
                    <ReactMarkdown components={markdownLinkComponent}>
                      {item.body || '_No details provided._'}
                    </ReactMarkdown>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="results-content">
              <ReactMarkdown components={markdownLinkComponent}>{markdownResult}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSuggestedActions;
