import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { baseURL } from '../../const'; // Assuming baseURL is exported from const.js
import './index.css';

const WebSuggestedActions = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const response = await axios.post(`${baseURL}/web_search`, {
                problem: query
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data && response.data.result) {
                setResult(response.data.result);
            } else {
                setResult('No results found.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="web-suggested-actions-container">
            <div className="search-header">
                <h1>Web Search for SAP Knowledge Base</h1>
            </div>

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-input-group">
                    <textarea
                        className="search-textarea"
                        placeholder="Describe your issue (e.g., How to fix SAP BTP destination authentication issue?)"
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
                                <div className="loading-spinner"></div>
                                Searching...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                Search
                            </>
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="error-message" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {result && (
                <div className="results-section">
                    <div className="results-content">
                        <ReactMarkdown
                            components={{
                                a: ({ node, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer">
                                        {props.children} ({props.href})
                                    </a>
                                )
                            }}
                        >
                            {result}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebSuggestedActions;
