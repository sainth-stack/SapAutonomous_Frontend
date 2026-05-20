import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { vectorizerProblemDescriptionURL, vectorizerSimilarTicketsURL, powerSearchURL } from '../../const';
import './index.css';

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
            let response;

            if (searchType === 'similarity') {
                response = await axios.post(
                    vectorizerSimilarTicketsURL,
                    { query: queryText },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            } else if (searchType === 'webSearch') {
                let problemForWebSearch = queryText;
                try {
                    const probRes = await axios.post(
                        vectorizerProblemDescriptionURL,
                        { query: queryText },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    const summarized = probRes?.data?.description;
                    if (summarized != null && String(summarized).trim() !== '') {
                        problemForWebSearch = String(summarized).trim();
                    }
                } catch (e) {
                    console.warn('get-problem-description failed, using raw Request - Text Request', e);
                }
                response = await axios.post(
                    powerSearchURL,
                    { query: problemForWebSearch },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }

            if (response && response.data) {
                // Handle response based on API
                const resultData = response.data.response || response.data.result || 'No results found.';
                setResults(resultData);
            } else {
                setResults('No results found.');
            }
        } catch (err) {
            console.error('Error fetching results:', err);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const getModalTitle = () => {
        if (searchType === 'similarity') {
            return 'AI Context Lookup';
        } else if (searchType === 'webSearch') {
            return 'AI Power Search';
        }
        return 'Search Results';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{getModalTitle()}</h2>
                    </div>
                    <button onClick={onClose} className="modal-close-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

   

                <div className="modal-body">
                    {isLoading ? (
                        <div className="modal-loader">
                            <div className="loader-spinner"></div>
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
                                                {searchType === 'webSearch' && props.href && ` (${props.href})`}
                                            </a>
                                        )
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
