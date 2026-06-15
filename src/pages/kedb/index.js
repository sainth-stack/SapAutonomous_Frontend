import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { MdAttachFile, MdClose } from 'react-icons/md';
import { contextSearchQueryURL } from '../../const';
import { sendAppLog, getLogMetaFromPath } from '../../utils/logger';
import { MAX_IMAGE_SIZE_MB, prepareImageAttachment } from '../../utils/imageUpload';
import '../../components/ChatBot/styles.css';
import './index.css';

const INITIAL_MESSAGE =
  "Hello! I'm your Knowledge Base assistant. Ask me about any errors, incidents, or issues you need help with. I can search through historical data to find similar cases and solutions.";

function getBotReply(data) {
  if (typeof data?.result === 'string' && data.result.trim()) return data.result.trim();
  if (typeof data?.response === 'string' && data.response.trim()) return data.response.trim();
  if (typeof data?.payload === 'string' && data.payload.trim()) return data.payload.trim();
  if (typeof data?.answer === 'string' && data.answer.trim()) return data.answer.trim();
  return 'No results found.';
}

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return err?.message || 'Something went wrong. Please try again.';
}

function logApiStatus(success, apiLabel, err) {
  const { moduleName } = getLogMetaFromPath(window.location.pathname);
  if (success) {
    sendAppLog({
      pathname: window.location.pathname,
      logType: 'S',
      content: `${moduleName} — ${apiLabel} API success`,
    });
    return;
  }

  const errMsg = getErrorMessage(err);
  sendAppLog({
    pathname: window.location.pathname,
    logType: 'E',
    content: `${moduleName} — ${apiLabel} API failed: ${errMsg}`,
  });
}

const KEDB = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ type: 'bot', text: INITIAL_MESSAGE }]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Thinking…');
  const [sessionId, setSessionId] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const removePendingImage = () => {
    setPendingImage(null);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if ((!trimmed && !pendingImage) || isLoading) return;

    if (pendingImage) {
      const { file, previewUrl, name } = pendingImage;
      const userMsg = { type: 'user', imageUrl: previewUrl, imageName: name };
      if (trimmed) userMsg.text = trimmed;

      setPendingImage(null);
      setMessage('');
      setMessages((prev) => [...prev, userMsg]);
      setLoadingLabel('Analyzing image…');
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append('image', file);
        if (sessionId) {
          formData.append('session_id', sessionId);
        }

        const { data } = await axios.post(contextSearchQueryURL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        logApiStatus(true, 'image upload');

        if (data?.session_id) {
          setSessionId(String(data.session_id));
        }

        setMessages((prev) => [...prev, { type: 'bot', text: getBotReply(data) }]);
      } catch (err) {
        logApiStatus(false, 'image upload', err);
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: `Error: ${getErrorMessage(err)}`, isError: true },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setMessages((prev) => [...prev, { type: 'user', text: trimmed }]);
    setMessage('');
    setLoadingLabel('Thinking…');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', trimmed);

      const { data } = await axios.post(contextSearchQueryURL, formData);

      logApiStatus(true, 'query');

      if (data?.session_id) {
        setSessionId(String(data.session_id));
      }

      setMessages((prev) => [...prev, { type: 'bot', text: getBotReply(data) }]);
    } catch (err) {
      logApiStatus(false, 'query', err);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: `Error: ${getErrorMessage(err)}`, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const processImageFile = async (file, fallbackType) => {
    if (!file || isLoading) return;

    try {
      const result = await prepareImageAttachment(file, fallbackType);

      if (!result) return;

      if (result.error === 'type') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: 'Error: Please upload a valid image file (JPEG, PNG, GIF, WebP, or BMP).',
            isError: true,
          },
        ]);
        return;
      }

      if (result.error === 'size') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: `Error: Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`,
            isError: true,
          },
        ]);
        return;
      }

      setPendingImage(result);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: 'Error: Could not read the pasted image. Please try again.',
          isError: true,
        },
      ]);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    processImageFile(file);
  };

  const handleInputPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        processImageFile(item.getAsFile(), item.type);
        return;
      }
    }
  };

  const openFilePicker = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="chatbot-container kedb-chat" style={{ maxWidth: '1400px' }}>
      <div className="chatbot-main">
        <div className="chatbot-header">
          <div className="header-content">
            <h1 className="chatbot-title">AI Content Search</h1>
            <p className="chatbot-subtitle">
              Search for solutions to similar incidents and issues
            </p>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-container ${msg.type === 'user' ? 'user-message-container' : 'bot-message-container'}`}
            >
              <div
                className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'} ${msg.isError ? 'kedb-error' : ''} ${msg.imageUrl ? 'kedb-user-image-bubble' : ''}`}
              >
                {msg.type === 'user' ? (
                  msg.imageUrl ? (
                    <div className="kedb-user-image-message">
                      <img
                        src={msg.imageUrl}
                        alt={msg.imageName || 'Uploaded image'}
                        className="kedb-uploaded-image"
                      />
                      {msg.imageName && (
                        <span className="kedb-image-filename">{msg.imageName}</span>
                      )}
                      {msg.text && <span className="kedb-image-caption">{msg.text}</span>}
                    </div>
                  ) : (
                    <span>{msg.text}</span>
                  )
                ) : (
                  <div className="text-response kedb-markdown">
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
                <div className="kedb-loading">
                  <span className="kedb-spinner" aria-hidden="true" />
                  <span>{loadingLabel}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chatbot-input-form">
          {pendingImage && (
            <div className="kedb-pending-attachment">
              <img
                src={pendingImage.previewUrl}
                alt=""
                className="kedb-pending-thumb"
              />
              <span className="kedb-pending-name" title={pendingImage.name}>
                {pendingImage.name}
              </span>
              <button
                type="button"
                className="kedb-pending-remove"
                onClick={removePendingImage}
                disabled={isLoading}
                aria-label="Remove image"
              >
                <MdClose size={18} />
              </button>
            </div>
          )}
          <div className="input-container">
            <input
              ref={fileInputRef}
              type="file"
              className="kedb-file-input"
              accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
              onChange={handleImageSelect}
              disabled={isLoading}
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              type="button"
              className="kedb-attach-button"
              onClick={openFilePicker}
              disabled={isLoading}
              aria-label="Upload image"
              title="Upload image"
            >
              <MdAttachFile size={22} />
            </button>
            <input
              type="text"
              className="chatbot-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPaste={handleInputPaste}
              placeholder="Ask about errors, issues, or search for solutions..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || (!message.trim() && !pendingImage)}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KEDB;
