import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { CircularProgress } from '@mui/material';
import { Table } from 'antd';
import { baseURL } from '../../const';
import { getLogMetaFromPath } from '../../utils/logger';
import './styles.css';

const ChatBot = ({ 
  title = "AI Assistant",
  subtitle = "How can I help you today?",
  placeholder = "Type your message...",
  endpoint = "/Explore_sla/",
  initialMessage = "Hello! How can I assist you today?",
  showFileInfo = true,
  showRecentChats = true,
  showSessionInfo = true,
  className = "",
  maxWidth = "1200px",
  isKnowledgeBase = false,
  onApiStatusLog = null
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: initialMessage }
  ]);
  const [recentChats, setRecentChats] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Check for uploaded file from localStorage on component mount
  useEffect(() => {
    const fileInfo = localStorage.getItem('uploadedFile');
    if (fileInfo && showFileInfo) {
      setUploadedFile(JSON.parse(fileInfo));
    }
  }, [showFileInfo]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: message,
      question: true
    }]);
    
    // Add loading message
    setMessages(prev => [...prev, {
      type: 'bot',
      isLoading: true
    }]);
    
    setIsLoading(true);
    const userMessage = message;

    try {
      let apiEndpoint, requestBody, headers, response, data;

      if (isKnowledgeBase) {
        // Route KB queries to provided endpoint (supports absolute URL) with JSON body
        const isAbsolute = typeof endpoint === 'string' && /^https?:\/\//i.test(endpoint);
        apiEndpoint = isAbsolute
          ? endpoint
          : (baseURL + (endpoint || '/vector_search/'));

        headers = {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        };
        requestBody = JSON.stringify({ query: userMessage });

        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers,
          body: requestBody
        });
      } else {
        // Original API configuration
        const formData = new FormData();
        formData.append('query', userMessage);
        
        // Include session_id if we have one
        if (sessionId) {
          formData.append('session_id', sessionId);
        }

        apiEndpoint = baseURL + endpoint;
        
        response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });
      }
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      data = await response.json();
      console.log('Backend response:', data);

      if (isKnowledgeBase && typeof onApiStatusLog === 'function') {
        const { moduleName } = getLogMetaFromPath(window.location.pathname);
        onApiStatusLog({
          pathname: window.location.pathname,
          logType: 'S',
          content: `${moduleName} — query API success`
        });
      }

      if (isKnowledgeBase) {
        // Expect SAP-style response: { request, response, metadata? }
        const responseText = typeof data?.response === 'string' ? data.response : (typeof data?.payload === 'string' ? data.payload : '');
        const formattedResponse = responseText
          ? responseText.replace(/\n/g, '<br/>')
          : 'No response returned.';

        setMessages(prev => prev.filter(msg => !msg.isLoading).concat([{ 
          type: 'bot', 
          responseType: 'text',
          content: formattedResponse
        }]));

        if (showRecentChats) {
          setRecentChats(prev => [...prev, { 
            question: userMessage, 
            answer: 'Knowledge Base search completed' 
          }]);
        }
      } else {
        // Handle original API response format
        // Update session_id if we received one
        if (data?.session_id && showSessionInfo) {
          setSessionId(data.session_id);
        }
      
        // Remove loading message and add actual response
        setMessages(prev => prev.filter(msg => !msg.isLoading).concat([{ 
          type: 'bot', 
          responseType: data?.type || 'text',
          content: data?.payload,
          explanation: data?.explanation,
          plotlyData: data?.type === 'plotly' ? data?.payload : null,
          tableData: data?.type === 'table' ? data?.payload : null
        }]));
      
        if (showRecentChats) {
          setRecentChats(prev => [...prev, { 
            question: userMessage, 
            answer: data?.explanation || 'Processed successfully' 
          }]);
        }
      }
    } catch (error) {
      console.error('Error:', error);

      if (isKnowledgeBase && typeof onApiStatusLog === 'function') {
        const { moduleName } = getLogMetaFromPath(window.location.pathname);
        onApiStatusLog({
          pathname: window.location.pathname,
          logType: 'E',
          content: `${moduleName} — query API failed: ${error.message || 'Unknown error'}`
        });
      }
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat([{ 
        type: 'bot', 
        content: 'Sorry, there was an error processing your request. Please try again.',
        responseType: 'text'
      }]));
    } finally {
      setIsLoading(false);
      setMessage(''); 
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to generate table columns from data
  const generateTableColumns = (data) => {
    if (!data || data.length === 0) return [];
    
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    
    return columns.map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      sorter: false,
      width: 120,
      render: (text) => (
        <div style={{ wordWrap: 'break-word', fontSize: '12px' }}>
          {text}
        </div>
      )
    }));
  };

  // Clear chat function
  const clearChat = () => {
    setMessages([{ type: 'bot', content: initialMessage }]);
    setRecentChats([]);
    setSessionId(null);
  };

  return (
    <div className={`chatbot-container ${className}`} style={{ maxWidth }}>
      
      <div className="chatbot-main">
        <div className="chatbot-header">
          <div className="header-content">
            <h1 className="chatbot-title">{title}</h1>
            <p className="chatbot-subtitle">{subtitle}</p>
            
            <div className="header-info">
              {uploadedFile && showFileInfo && (
                <div className="file-info">
                  <div className="info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span>File: {uploadedFile.originalName || uploadedFile.name}</span>
                  </div>
                  {uploadedFile.recordCount && (
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z"/>
                      </svg>
                      <span>Records: {uploadedFile.recordCount}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-container ${msg.question ? 'user-message-container' : 'bot-message-container'}`}
            >
              <div className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'} ${msg.isLoading ? 'loading-message' : ''}`}>
                {msg.isLoading ? (
                  <div className="loading-container">
                    <CircularProgress size={20} className="loading-spinner" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <>
                    {/* Handle different response types */}
                    {msg.responseType === 'text' && msg.content && (
                      <div className="text-response">
                        {typeof msg.content === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                        ) : (
                          <p>{JSON.stringify(msg.content)}</p>
                        )}
                      </div>
                    )}

                    {msg.responseType === 'table' && msg.tableData && (
                      <div className="table-response">
                        <Table
                          columns={generateTableColumns(msg.tableData)}
                          dataSource={msg.tableData.map((item, idx) => ({ ...item, key: idx }))}
                          scroll={{ x: true, y: 400 }}
                          size="small"
                          // pagination={{ 
                          //   pageSize: 10, 
                          //   showSizeChanger: true,
                          //   showQuickJumper: true,
                          //   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                          // }}
                          className="chatbot-table"
                          bordered
                        />
                      </div>
                    )}

                    {msg.responseType === 'plotly' && msg.plotlyData && (
                      <div className="plotly-response" style={{width:'90%'}}>
                        <Plot
                          data={msg.plotlyData.data}
                          layout={{
                            ...msg.plotlyData.layout,
                            autosize: true,
                            responsive: true,
                            margin: { t: 50, r: 50, b: 50, l: 60 },
                            font: { size: 12 }
                          }}
                          config={{ 
                            responsive: true, 
                            displayModeBar: true,
                            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                            displaylogo: false,
                            toImageButtonOptions: {
                              format: 'png',
                              filename: 'chart',
                              height: 500,
                              width: 700,
                              scale: 1
                            }
                          }}
                          style={{
                            width: "100%",
                            height: "450px"
                          }}
                          useResizeHandler={true}
                          className="plotly-chart"
                        />
                      </div>
                    )}

                    {/* Fallback for regular content */}
                    {!msg.responseType && msg.content && (
                      <div className="default-response">
                        {typeof msg.content === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                        ) : (
                          <p>{JSON.stringify(msg.content)}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Message timestamp */}
              <div className="message-timestamp">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="chatbot-input-form">
          <div className="input-container">
            <input
              type="text"
              className="chatbot-input"
              value={message}
              onChange={handleMessageChange}
              placeholder={placeholder}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-button" 
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
