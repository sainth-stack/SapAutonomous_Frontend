import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { aiPowerSearchURL } from '../../const';
import '../../components/ChatBot/styles.css';
import './index.css';

const INITIAL_MESSAGE =
  "Hello! I'm your AI Power Search assistant. Describe your SAP issue and I'll search for suggested actions and fixes.";

function getBotReply(data) {
  if (typeof data?.answer === 'string' && data.answer.trim()) return data.answer.trim();
  if (typeof data?.response === 'string' && data.response.trim()) return data.response.trim();
  if (typeof data?.result === 'string' && data.result.trim()) return data.result.trim();
  return 'No results found.';
}

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return err?.message || 'Something went wrong. Please try again.';
}

const WebSuggestedActions = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ type: 'bot', text: INITIAL_MESSAGE }]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { type: 'user', text: trimmed }]);
    setMessage('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        aiPowerSearchURL,
        {
          session_id: sessionId || '',
          query: trimmed,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (data?.session_id) {
        setSessionId(String(data.session_id));
      }

      setMessages((prev) => [...prev, { type: 'bot', text: getBotReply(data) }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: `Error: ${getErrorMessage(err)}`, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container wsa-chat" style={{ maxWidth: '1400px' }}>
      <div className="chatbot-main">
        <div className="chatbot-header">
          <div className="header-content">
            <h1 className="chatbot-title">AI Power Search</h1>
            <p className="chatbot-subtitle">
              Search SAP community knowledge and get step-by-step suggested actions
            </p>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-container ${msg.type === 'user' ? 'user-message-container' : 'bot-message-container'}`}
            >
              <div className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'} ${msg.isError ? 'wsa-error' : ''}`}>
                {msg.type === 'user' ? (
                  <span>{msg.text}</span>
                ) : (
                  <div className="text-response wsa-markdown">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-container bot-message-container">
              <div className="message bot-message loading-message">
                <span>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chatbot-input-form">
          <div className="input-container">
            <input
              type="text"
              className="chatbot-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue (Context for 20 conversations(Questions))"
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading || !message.trim()}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebSuggestedActions;
