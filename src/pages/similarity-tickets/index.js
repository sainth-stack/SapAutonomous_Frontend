import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { similarityTicketsQueryURL } from '../../const';
import './index.css';

const INITIAL_MESSAGE =
  "Hello! I'm your Similarity Tickets assistant. Describe an error, incident or issue and I'll search the historical ticket data for similar cases, likely causes and fixes. You can also paste a ticket ID, or ask things like \"how many critical tickets in 2025?\".";

const SUGGESTIONS = [
  'POS card payments timing out at multiple stores',
  'Tax calculation on checkout differs from jurisdiction rules',
  'Show critical tickets in 2025',
  'Ticket count by year and priority',
];

const SECTIONS = [
  ['problem_description', 'Problem Description'],
  ['sap_area', 'SAP Area'],
  ['cause', 'Cause of the problem'],
  ['suggested_solution', 'Suggested Solution (if applicable)'],
];

const GROUP_LABELS = {
  year: 'Year',
  month: 'Month',
  system: 'System',
  category: 'Category',
  business_team: 'Business team',
  location: 'Location/Channel',
  impact: 'Impact',
};

const priorityClass = (p) => `sim-priority sim-priority-${String(p || '').toLowerCase()}`;

const TicketTable = ({ tickets }) => (
  <div className="sim-table-wrap">
    <table className="sim-table">
      <thead>
        <tr>
          <th>Ticket Creation Date</th>
          <th>Time</th>
          <th>Ticket ID</th>
          <th>Priority</th>
          <th>Ticket Description</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.ticket_id}>
            <td className="sim-nowrap">{t.date}</td>
            <td className="sim-nowrap">{t.time}</td>
            <td className="sim-nowrap sim-ticket-id">{t.ticket_id}</td>
            <td>
              <span className={priorityClass(t.priority)}>{t.priority}</span>
            </td>
            <td className="sim-desc">{t.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatsTable = ({ stats }) => {
  if (!stats?.rows?.length) return null;
  const { columns, rows, totals, group_by: groupBy } = stats;
  return (
    <div className="sim-table-wrap">
      <table className="sim-table sim-stats-table">
        <thead>
          <tr>
            <th>{GROUP_LABELS[groupBy] || 'Group'}</th>
            {columns.map((c) => (
              <th key={c} className="sim-num">
                {c}
              </th>
            ))}
            <th className="sim-num">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.group}>
              <td className="sim-nowrap">{r.group}</td>
              {columns.map((c) => (
                <td key={c} className="sim-num">
                  {r[c]}
                </td>
              ))}
              <td className="sim-num sim-strong">{r.Total}</td>
            </tr>
          ))}
          {rows.length > 1 && (
            <tr className="sim-total-row">
              <td>Total</td>
              {columns.map((c) => (
                <td key={c} className="sim-num">
                  {totals[c]}
                </td>
              ))}
              <td className="sim-num sim-strong">{totals.Total}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const BotResponse = ({ data }) => {
  const hasSections = data.sections && Object.keys(data.sections).length > 0;
  return (
    <div className="sim-response">
      {data.note && <p className="sim-note">{data.note}</p>}

      {hasSections ? (
        <>
          {SECTIONS.map(([key, label]) =>
            data.sections[key] ? (
              <div className="sim-section" key={key}>
                <div className="sim-section-label">{label}:</div>
                <div className="sim-section-body">
                  <ReactMarkdown>{data.sections[key]}</ReactMarkdown>
                </div>
              </div>
            ) : null
          )}
          {data.referenced?.length > 0 && (
            <div className="sim-section">
              <div className="sim-section-label">Referenced Ticket IDs:</div>
              <div className="sim-section-body">
                {data.referenced.map((r) => `${r.ticket_id} (${r.percentage}%)`).join(', ')}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="sim-section-body">
          <ReactMarkdown>{data.answer}</ReactMarkdown>
        </div>
      )}

      {data.stats && <StatsTable stats={data.stats} />}

      {/* Ticket table only for "list/show tickets" queries; similarity answers
          show just the sections + referenced ticket IDs. */}
      {data.intent === 'browse' && data.tickets?.length > 0 && (
        <div className="sim-section">
          <div className="sim-section-label">Tickets ({data.tickets.length}):</div>
          <TicketTable tickets={data.tickets} />
        </div>
      )}
    </div>
  );
};

const SimilarityTickets = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ type: 'bot', text: INITIAL_MESSAGE }]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const ask = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { type: 'user', text: trimmed }]);
    setMessage('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(similarityTicketsQueryURL, { query: trimmed });
      setMessages((prev) => [...prev, { type: 'bot', data }]);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const text =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg).join('; ')
          : err.message || 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { type: 'bot', text: `Error: ${text}`, isError: true }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    ask(message);
  };

  const showSuggestions = messages.length === 1 && !isLoading;

  return (
    <div className="sim-page">
      <div className="sim-header">
        <h1 className="sim-title">Similarity Tickets</h1>
        <p className="sim-subtitle">Search historical tickets for similar incidents, causes and solutions</p>
      </div>

      <div className="sim-chat-area">
        <div className="sim-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`sim-msg ${msg.type}${msg.isError ? ' error' : ''}`}>
              {msg.data ? (
                <BotResponse data={msg.data} />
              ) : (
                <span className="sim-text">{msg.text}</span>
              )}
            </div>
          ))}

          {showSuggestions && (
            <div className="sim-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="sim-chip" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="sim-msg bot">
              <span className="sim-text sim-loading">Searching similar tickets…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="sim-input-bar" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="sim-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe an issue, paste a ticket ID, or ask for ticket counts…"
            disabled={isLoading}
            maxLength={1000}
            autoComplete="off"
          />
          <button
            type="submit"
            className="sim-send"
            disabled={isLoading || !message.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SimilarityTickets;
