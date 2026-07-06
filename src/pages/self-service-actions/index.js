import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import './index.css';

// Format SAP OData date values (/Date(ts)/ or ISO string)
const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'string' && val.startsWith('/Date(')) {
        const ts = parseInt(val.replace(/\/Date\(|\)\//g, '').split(/[+-]/)[0]);
        if (!isNaN(ts)) return new Date(ts).toLocaleDateString('en-GB', { dateStyle: 'medium' });
    }
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-GB', { dateStyle: 'medium' });
    }
    return String(val);
};

const humanizeColumn = (col) =>
    col.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

const HIDDEN_COLS = ['__metadata', 'url_used', 'intent_debug'];

const SapTable = ({ data }) => {
    const d = data?.response?.d;
    const results = Array.isArray(d?.results)
        ? d.results
        : d && !d.results
        ? [d]
        : null;
    if (!results || results.length === 0)
        return <p className="sap-empty">No records found.</p>;

    const rawColumns = Object.keys(results[0]).filter((c) => !HIDDEN_COLS.includes(c));
    const columns = rawColumns.length ? rawColumns : Object.keys(results[0]);

    return (
        <div className="sap-table-wrap">
            <table className="sap-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{humanizeColumn(col)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.map((row, i) => (
                        <tr key={i}>
                            {columns.map((col) => (
                                <td key={col}>{formatValue(row[col])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SapJoule = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hello! I am your SAP Joule assistant. Query Sales Orders, Purchase Orders and more in natural language.',
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (e) => {
        e?.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || isLoading) return;

        setMessages((prev) => [...prev, { type: 'user', text: trimmed }]);
        setMessage('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${baseURL}/sap/query`, { query: trimmed });
            setMessages((prev) => [...prev, { type: 'bot', sapData: res.data }]);
        } catch (err) {
            const detail =
                err?.response?.data?.detail || err.message || 'Something went wrong.';
            setMessages((prev) => [
                ...prev,
                { type: 'bot', text: `Error: ${detail}`, isError: true },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    return (
        <div className="joule-page">
            <div className="joule-header">
                <h1 className="joule-title">SAP Joule</h1>
                <p className="joule-subtitle">Query SAP S/4HANA data in natural language</p>
            </div>

            <div className="joule-chat-area">
                <div className="joule-messages">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`joule-msg ${msg.type}${msg.isError ? ' error' : ''}`}
                        >
                            {msg.sapData ? (
                                <div className="sap-response">
                                    {msg.sapData.friendlyAnswer && (
                                        <div
                                            className="sap-friendly-answer"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.sapData.friendlyAnswer,
                                            }}
                                        />
                                    )}
                                    {msg.sapData.showTable &&
                                    msg.sapData.response?.d?.results?.length > 0 ? (
                                        <SapTable data={msg.sapData} />
                                    ) : !msg.sapData.friendlyAnswer ? (
                                        <p className="sap-empty">No records found.</p>
                                    ) : null}
                                </div>
                            ) : (
                                <span>{msg.text}</span>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="joule-msg bot">
                            <span className="joule-loading">Thinking…</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="joule-input-bar" onSubmit={sendMessage}>
                    <input
                        ref={inputRef}
                        className="joule-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Show me sales order 4"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="joule-send"
                        disabled={isLoading || !message.trim()}
                        aria-label="Send message"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                        >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SapJoule;
