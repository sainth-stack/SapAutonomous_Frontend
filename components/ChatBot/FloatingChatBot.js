import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, InputAdornment, CircularProgress, Button } from '@mui/material';
import { IoMdClose, IoMdSend, IoMdAttach } from 'react-icons/io';
import { Table } from 'antd';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { baseURL } from '../../const';
import './FloatingChatBot.css';
const testUrl = 'http://54.169.213.200:4006';
const FloatingChatBot = ({
  title = "AI Assistant",
  subtitle = "How can I help you today?",
  placeholder = "Type your message...",
  endpoint = "/Explore_sla/",
  initialMessage = "Hello! How can I assist you today?",
  showFileInfo = true,
  showSessionInfo = true,
  className = "",
  supportFileUpload = false,
  fileUploadEndpoint = "/predict_incident/",
  acceptedFileTypes = ".csv,.xlsx,.xls",
  dataset = null, // optional: pass processed report dataset (array of objects)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: initialMessage }
  ]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check for uploaded file from localStorage on component mount
  useEffect(() => {
    const fileInfo = localStorage.getItem('uploadedFile');
    if (fileInfo && showFileInfo) {
      setUploadedFile(JSON.parse(fileInfo));
    }
  }, [showFileInfo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
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
    setMessage('');

    // Prepare payloads depending on endpoint type
    const formData = new FormData();
    if(endpoint === "/predict/" || endpoint === "/predict") {
      formData.append('description', userMessage);
    } else if (endpoint !== "/classification/" && endpoint !== "/classification") {
      // For normal chat endpoints
      formData.append('query', userMessage);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }
    }

    try {
      let data;
      if (endpoint === "/classification/" || endpoint === "/classification") {
        // External classifier API: return only z_review
        const classifierUrl = 'https://ams-classifier.cfapps.us10-001.hana.ondemand.com/v1/classification/sentence';
        const response = await axios.post(classifierUrl, { sentence: userMessage }, {
          headers: { 'Content-Type': 'application/json' }
        });
        data = response.data;
      } else {
        const apiEndpoint = (endpoint === "/predict/" ? testUrl : baseURL) + endpoint;
        // Explore_sla: JSON body (query + optional session_id + optional dataset). Multipart Form+File breaks FastAPI binding for `query`.
        if (/Explore_sla/i.test(endpoint)) {
          const jsonBody = { query: userMessage };
          if (sessionId) jsonBody.session_id = sessionId;
          if (dataset && Array.isArray(dataset) && dataset.length > 0) {
            jsonBody.dataset = dataset;
          }
          const response = await axios.post(apiEndpoint, jsonBody, {
            headers: { 'Content-Type': 'application/json' },
          });
          data = response.data;
        } else {
          if (dataset && Array.isArray(dataset) && dataset.length > 0) {
            try {
              const blob = new Blob([JSON.stringify(dataset)], { type: 'application/json' });
              formData.append('dataset_file', blob, 'dataset.json');
            } catch (e) {
              console.warn('Failed to attach dataset file for chat request:', e);
            }
          }
          const response = await axios.post(apiEndpoint, formData);
          data = response.data;
        }
      }
      console.log('Backend response:', data);
    
      // Update session_id if we received one
      if (data?.session_id && showSessionInfo) {
        setSessionId(data.session_id);
      }
    
      // Remove loading message and add actual response
      let responseMessage;
      
      // Special handling for /classification and /predict endpoints
      if (endpoint === "/classification/" || endpoint === "/classification") {
        // Column order: department, area, brand, location, site, review
        const tableRow = {
          department: data?.department ?? '',
          area: data?.subfunctional_area ?? '',
          brand: data?.brand ?? '',
          location: data?.location ?? '',
          site: data?.site ?? '',
          review: data?.z_review ?? ''
        };
        responseMessage = {
          type: 'bot',
          responseType: 'table',
          content: 'Classification Result',
          explanation: 'Mapped fields from classifier response',
          tableData: [tableRow]
        };
      } else if (endpoint === "/predict/" || endpoint === "/predict") {
        // Check if data is a direct object (the case we're handling)
        if (data && typeof data === 'object' && !data.type && !data.payload) {
          // Convert the object to horizontal table format (single row with keys as columns)
          const tableData = [data]; // Single row with the data object
          
          responseMessage = {
            type: 'bot',
            responseType: 'table',
            content: 'Prediction Results:',
            explanation: 'Here are the prediction results for your request.',
            tableData: tableData
          };
        } else {
          // Fallback to existing logic for other response structures
          responseMessage = {
            type: 'bot', 
            responseType: data?.type || 'text',
            content: data?.payload || data?.message || data?.detail || JSON.stringify(data, null, 2),
            explanation: data?.explanation || data?.message || data?.detail,
            plotlyData: data?.type === 'plotly' ? data?.payload : null,
            tableData: data?.type === 'table' ? data?.payload : null
          };
        }
      } else {
        // Original logic for other endpoints
        responseMessage = {
          type: 'bot', 
          responseType: data?.type || 'text',
          content: data?.payload || data?.message || data?.detail,
          explanation: data?.explanation || data?.message || data?.detail,
          plotlyData: data?.type === 'plotly' ? data?.payload : null,
          tableData: data?.type === 'table' ? data?.payload : null
        };
      }
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat([responseMessage]));
      
    } catch (error) {
      console.error('Error:', error);
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat([{ 
        type: 'bot', 
        content: 'Sorry, there was an error processing your request. Please try again.',
        responseType: 'text'
      }]));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsFileUploading(true);
    setIsLoading(true);

    // Add user message showing file upload
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: `📎 Uploaded file: ${file.name}`,
      isFile: true
    }]);
    
    // Add loading message
    setMessages(prev => [...prev, {
      type: 'bot',
      isLoading: true
    }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiEndpoint = baseURL + fileUploadEndpoint;
      
      const response = await axios.post(apiEndpoint, formData);
      const data = response.data;
      console.log('File upload response:', data);
    
      // Remove loading message and add actual response
      let responseData = data?.data || data;
      let tableData = [];
      
      // Handle different response structures
      if (Array.isArray(responseData)) {
        tableData = responseData;
      } else if (responseData?.records && Array.isArray(responseData.records)) {
        tableData = responseData.records;
      } else if (typeof responseData === 'object' && responseData !== null) {
        tableData = [responseData];
      }

      setMessages(prev => prev.filter(msg => !msg.isLoading).concat([{ 
        type: 'bot', 
        responseType: tableData.length > 0 ? 'table' : 'text',
        content: tableData.length > 0 ? `File "${file.name}" processed successfully.` : JSON.stringify(responseData, null, 2),
        explanation: `File "${file.name}" processed successfully. ${tableData.length > 0 ? `Found ${tableData.length} records.` : 'Results:'}`,
        tableData: tableData
      }]));
      
    } catch (error) {
      console.error('File upload error:', error);
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat([{ 
        type: 'bot', 
        content: `Sorry, there was an error processing the file "${file.name}". Please try again.`,
        responseType: 'text'
      }]));
    } finally {
      setIsLoading(false);
      setIsFileUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const renderMessage = (msg, index) => {
    if (msg.isLoading) {
      return (
        <Box sx={{
          alignSelf: "flex-start",
          maxWidth: "80%",
          backgroundColor: "#fff",
          padding: "12px",
          borderRadius: "12px 12px 12px 0",
          border: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CircularProgress size={16} sx={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '14px', color: '#666' }}>Thinking...</span>
        </Box>
      );
    }

    const isUser = msg.type === 'user';
    
    return (
      <div key={index} style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "16px",
        width: "100%"
      }}>
        {/* User Message */}
        {isUser && (
          <Box sx={{
            alignSelf: "flex-end",
            maxWidth: "80%",
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "12px",
            borderRadius: "12px 12px 0 12px",
            fontSize: "14px",
            textAlign: "left",
            lineHeight: 1.4
          }}>
            {msg.content}
          </Box>
        )}

        {/* AI Response */}
        {!isUser && (
          <Box sx={{
            alignSelf: "flex-start",
            maxWidth: "95%",
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "12px 12px 12px 0",
            border: "1px solid #e0e0e0",
            width: "100%",
            textAlign: "left"
          }}>
            {/* Handle different response types */}
            {msg.responseType === 'text' && msg.content && (
              <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                {typeof msg.content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  <p>{JSON.stringify(msg.content)}</p>
                )}
              </div>
            )}

            {msg.responseType === 'table' && msg.tableData && (
              <div style={{ margin: '8px -12px', width: 'calc(100% + 24px)' }}>
                <Table
                  columns={generateTableColumns(msg.tableData)}
                  dataSource={msg.tableData.map((item, idx) => ({ ...item, key: idx }))}
                  scroll={{ x: true }}
                  size="small"
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  style={{ fontSize: '12px', width: '100%' }}
                />
              </div>
            )}

            {msg.responseType === 'plotly' && msg.plotlyData && (
              <div style={{ margin: '8px -12px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <Plot
                  data={msg.plotlyData.data}
                  layout={{
                    ...msg.plotlyData.layout,
                    autosize: true,
                    margin: { t: 30, r: 15, b: 30, l: 45 },
                    font: { size: 10 }
                  }}
                  config={{ 
                    responsive: true, 
                    displayModeBar: false,
                    displaylogo: false
                  }}
                  style={{
                    width: "100%",
                    height: "280px",
                  }}
                />
              </div>
            )}

            {/* Fallback for regular content */}
            {!msg.responseType && msg.content && (
              <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                {typeof msg.content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  <p>{JSON.stringify(msg.content)}</p>
                )}
              </div>
            )}
          </Box>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Box
          className="floating-chat-button"
          onClick={() => setIsOpen(true)}
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 1000,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 25px rgba(59, 130, 246, 0.4)"
            }
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3Z"/>
          </svg>
          {messages.length > 1 && (
            <Box sx={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#ff5546",
              color: "white",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}>
              {messages.length - 1}
            </Box>
          )}
        </Box>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <Box
          className={`floating-chat-modal ${className}`}
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "500px",
            height: "650px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            animation: "slideUpFadeIn 0.3s ease-out"
          }}
        >
          {/* Header */}
          <Box sx={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>
                {title}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>
                {subtitle}
              </span>
            </Box>
            
            {/* File and Session Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {uploadedFile && showFileInfo && (
                <Box sx={{ 
                  fontSize: '10px', 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Data Ready
                </Box>
              )}
              
              <IconButton
                onClick={() => setIsOpen(false)}
                sx={{ 
                  color: "white", 
                  padding: '8px',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <IoMdClose size={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Chat Messages Area - minHeight: 0 required for flex child to scroll */}
          <Box sx={{
            flex: "1 1 0",
            minHeight: 0,
            overflow: "auto",
            padding: "16px",
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column"
          }}>
            {messages.map((msg, index) => renderMessage(msg, index))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{
            padding: "16px",
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#fff"
          }}>
            {/* File Upload Section */}
            {supportFileUpload && (
              <Box sx={{ 
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept={acceptedFileTypes}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IoMdAttach />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isFileUploading}
                  sx={{
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    fontSize: "12px",
                    textTransform: "none",
                  
                    borderRadius: "16px",
                    '&:hover': {
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.05)"
                    }
                  }}
                >
                  {isFileUploading ? "Uploading..." : "Upload File"}
                </Button>
                <span style={{ 
                  fontSize: "11px", 
                  color: "#94a3b8",
                  fontStyle: "italic"
                }}>
                  {acceptedFileTypes.replace(/\./g, '').toUpperCase()} files only
                </span>
              </Box>
            )}

            <TextField
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              variant="outlined"
              size="small"
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "14px"
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      sx={{
                        color: (message.trim() && !isLoading) ? "#3b82f6" : "#bbb",
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                    >
                      {isLoading ? <CircularProgress size={20} sx={{ color: '#3b82f6' }} /> : <IoMdSend />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default FloatingChatBot;
