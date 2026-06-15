import React, { useState, useEffect, useRef } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { Table } from "antd";
import { MdAttachFile } from "react-icons/md";
import { baseURL, aiPowerSearchURL, aiPowerSearchImageURL } from "../../const";
import { getLogMetaFromPath } from "../../utils/logger";
import {
  getAiPowerSearchSessionId,
  setAiPowerSearchSessionId,
  parseAiPowerSearchResponse,
  formatAiPowerSearchHtml,
  getAiPowerSearchError,
  AI_POWER_SEARCH_SESSION_KEY,
} from "../../utils/aiPowerSearch";
import "./styles.css";

const MAX_IMAGE_SIZE_MB = 10;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
];

const JSON_HEADERS = { "Content-Type": "application/json" };

function isAbsoluteUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}

/** Never prefix baseURL when endpoint is already absolute (fixes double-URL in production). */
function resolveEndpoint(endpoint, fallback) {
  if (isAbsoluteUrl(endpoint)) return endpoint.trim();
  if (isAbsoluteUrl(fallback)) return fallback.trim();
  const base = baseURL.replace(/\/$/, "");
  const path = (endpoint || fallback || "").trim();
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

function isPowerSearchMode(isAiPowerSearch, endpoint) {
  if (isAiPowerSearch) return true;
  if (typeof endpoint === "string" && /ai-power-search/i.test(endpoint))
    return true;
  if (
    typeof window !== "undefined" &&
    window.location.pathname === "/web-suggested-actions"
  ) {
    return true;
  }
  return false;
}

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
  isAiPowerSearch = false,
  enableImageUpload = false,
  imageUploadURL = aiPowerSearchImageURL,
  onApiStatusLog = null,
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", content: initialMessage },
  ]);
  const [recentChats, setRecentChats] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check for uploaded file from localStorage on component mount
  useEffect(() => {
    const fileInfo = localStorage.getItem("uploadedFile");
    if (fileInfo && showFileInfo) {
      setUploadedFile(JSON.parse(fileInfo));
    }
  }, [showFileInfo]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isLoading) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          responseType: "text",
          content:
            "Error: Please upload a valid image file (JPEG, PNG, GIF, WebP, or BMP).",
        },
      ]);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          responseType: "text",
          content: `Error: Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", content: `Uploaded image: ${file.name}`, question: true },
      { type: "bot", isLoading: true, loadingLabel: "Analyzing image..." },
    ]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      const { data } = await axios.post(imageUploadURL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (
        typeof onApiStatusLog === "function" &&
        (isKnowledgeBase || isAiPowerSearch)
      ) {
        const { moduleName } = getLogMetaFromPath(window.location.pathname);
        onApiStatusLog({
          pathname: window.location.pathname,
          logType: "S",
          content: `${moduleName} — image upload API success`,
        });
      }

      if (data?.session_id) {
        setSessionId(String(data.session_id));
      }

      const parsed = parseAiPowerSearchResponse(data);
      const formattedResponse = formatAiPowerSearchHtml(parsed);

      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isLoading)
          .concat([
            {
              type: "bot",
              responseType: "text",
              content: formattedResponse,
            },
          ])
      );

      if (showRecentChats) {
        setRecentChats((prev) => [
          ...prev,
          {
            question: `Image: ${file.name}`,
            answer: "Image analysis completed",
          },
        ]);
      }
    } catch (error) {
      console.error("Image upload error:", error);

      if (
        typeof onApiStatusLog === "function" &&
        (isKnowledgeBase || isAiPowerSearch)
      ) {
        const { moduleName } = getLogMetaFromPath(window.location.pathname);
        onApiStatusLog({
          pathname: window.location.pathname,
          logType: "E",
          content: `${moduleName} — image upload API failed: ${getAiPowerSearchError(
            error
          )}`,
        });
      }

      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isLoading)
          .concat([
            {
              type: "bot",
              responseType: "text",
              content: `Error: ${getAiPowerSearchError(error)}`,
            },
          ])
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openFilePicker = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: message,
        question: true,
      },
    ]);

    // Add loading message
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        isLoading: true,
      },
    ]);

    setIsLoading(true);
    const userMessage = message;

    const powerSearchMode = isPowerSearchMode(isAiPowerSearch, endpoint);

    try {
      let data;

      if (powerSearchMode) {
        const url = resolveEndpoint(endpoint, aiPowerSearchURL);
        const res = await axios.post(
          url,
          {
            session_id: getAiPowerSearchSessionId(),
            query: userMessage,
          },
          { headers: JSON_HEADERS }
        );
        data = res.data;
      } else if (isKnowledgeBase) {
        const url = resolveEndpoint(endpoint, "/vector_search/");

        // ✅ Send as FormData (matches the API expectation)
        const kbForm = new FormData();
        kbForm.append("query", userMessage);

        const res = await axios.post(url, kbForm);
        data = res.data;
      } else {
        const formData = new FormData();
        formData.append("query", userMessage);
        if (sessionId) {
          formData.append("session_id", sessionId);
        }
        const url = resolveEndpoint(endpoint, "/Explore_sla/");
        const res = await axios.post(url, formData);
        data = res.data;
      }

      console.log("Backend response:", data);

      if (
        (isKnowledgeBase || powerSearchMode) &&
        typeof onApiStatusLog === "function"
      ) {
        const { moduleName } = getLogMetaFromPath(window.location.pathname);
        onApiStatusLog({
          pathname: window.location.pathname,
          logType: "S",
          content: `${moduleName} — query API success`,
        });
      }

      if (powerSearchMode) {
        const parsed = parseAiPowerSearchResponse(data);
        if (parsed.sessionId) {
          setAiPowerSearchSessionId(parsed.sessionId);
          setSessionId(parsed.sessionId);
        }
        const formattedResponse = formatAiPowerSearchHtml(parsed);

        setMessages((prev) =>
          prev
            .filter((msg) => !msg.isLoading)
            .concat([
              {
                type: "bot",
                responseType: "text",
                content: formattedResponse,
              },
            ])
        );

        if (showRecentChats) {
          setRecentChats((prev) => [
            ...prev,
            {
              question: userMessage,
              answer: "AI Power Search completed",
            },
          ]);
        }
      } else if (isKnowledgeBase) {
        const responseText =
          typeof data?.result === "string"
            ? data.result
            : typeof data?.response === "string"
            ? data.response
            : typeof data?.payload === "string"
            ? data.payload
            : "";
        const formattedResponse = responseText
          ? responseText.replace(/\n/g, "<br/>")
          : "No response returned.";

        setMessages((prev) =>
          prev
            .filter((msg) => !msg.isLoading)
            .concat([
              {
                type: "bot",
                responseType: "text",
                content: formattedResponse,
              },
            ])
        );

        if (showRecentChats) {
          setRecentChats((prev) => [
            ...prev,
            {
              question: userMessage,
              answer: "Knowledge Base search completed",
            },
          ]);
        }
      } else {
        // Handle original API response format
        // Update session_id if we received one
        if (data?.session_id && showSessionInfo) {
          setSessionId(data.session_id);
        }

        // Remove loading message and add actual response
        setMessages((prev) =>
          prev
            .filter((msg) => !msg.isLoading)
            .concat([
              {
                type: "bot",
                responseType: data?.type || "text",
                content: data?.payload,
                explanation: data?.explanation,
                plotlyData: data?.type === "plotly" ? data?.payload : null,
                tableData: data?.type === "table" ? data?.payload : null,
              },
            ])
        );

        if (showRecentChats) {
          setRecentChats((prev) => [
            ...prev,
            {
              question: userMessage,
              answer: data?.explanation || "Processed successfully",
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error:", error);

      if (
        (isKnowledgeBase || powerSearchMode) &&
        typeof onApiStatusLog === "function"
      ) {
        const { moduleName } = getLogMetaFromPath(window.location.pathname);
        const errMsg =
          error?.response?.data?.detail || error?.message || "Unknown error";
        onApiStatusLog({
          pathname: window.location.pathname,
          logType: "E",
          content: `${moduleName} — query API failed: ${errMsg}`,
        });
      }

      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isLoading)
          .concat([
            {
              type: "bot",
              content:
                "Sorry, there was an error processing your request. Please try again.",
              responseType: "text",
            },
          ])
      );
    } finally {
      setIsLoading(false);
      setMessage("");
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

    return columns.map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
      sorter: false,
      width: 120,
      render: (text) => (
        <div style={{ wordWrap: "break-word", fontSize: "12px" }}>{text}</div>
      ),
    }));
  };

  // Clear chat function
  const clearChat = () => {
    setMessages([{ type: "bot", content: initialMessage }]);
    setRecentChats([]);
    setSessionId(null);
    if (isPowerSearchMode(isAiPowerSearch, endpoint)) {
      try {
        sessionStorage.removeItem(AI_POWER_SEARCH_SESSION_KEY);
      } catch {
        /* ignore */
      }
    }
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    <span>
                      File: {uploadedFile.originalName || uploadedFile.name}
                    </span>
                  </div>
                  {uploadedFile.recordCount && (
                    <div className="info-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z" />
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
              className={`message-container ${
                msg.question
                  ? "user-message-container"
                  : "bot-message-container"
              }`}
            >
              <div
                className={`message ${
                  msg.type === "user" ? "user-message" : "bot-message"
                } ${msg.isLoading ? "loading-message" : ""}`}
              >
                {msg.isLoading ? (
                  <div className="loading-container">
                    <CircularProgress size={20} className="loading-spinner" />
                    <span>{msg.loadingLabel || "Thinking..."}</span>
                  </div>
                ) : (
                  <>
                    {/* Handle different response types */}
                    {msg.responseType === "text" && msg.content && (
                      <div className="text-response">
                        {typeof msg.content === "string" ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: msg.content }}
                          />
                        ) : (
                          <p>{JSON.stringify(msg.content)}</p>
                        )}
                      </div>
                    )}

                    {msg.responseType === "table" && msg.tableData && (
                      <div className="table-response">
                        <Table
                          columns={generateTableColumns(msg.tableData)}
                          dataSource={msg.tableData.map((item, idx) => ({
                            ...item,
                            key: idx,
                          }))}
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

                    {msg.responseType === "plotly" && msg.plotlyData && (
                      <div className="plotly-response" style={{ width: "90%" }}>
                        <Plot
                          data={msg.plotlyData.data}
                          layout={{
                            ...msg.plotlyData.layout,
                            autosize: true,
                            responsive: true,
                            margin: { t: 50, r: 50, b: 50, l: 60 },
                            font: { size: 12 },
                          }}
                          config={{
                            responsive: true,
                            displayModeBar: true,
                            modeBarButtonsToRemove: [
                              "pan2d",
                              "lasso2d",
                              "select2d",
                            ],
                            displaylogo: false,
                            toImageButtonOptions: {
                              format: "png",
                              filename: "chart",
                              height: 500,
                              width: 700,
                              scale: 1,
                            },
                          }}
                          style={{
                            width: "100%",
                            height: "450px",
                          }}
                          useResizeHandler={true}
                          className="plotly-chart"
                        />
                      </div>
                    )}

                    {/* Fallback for regular content */}
                    {!msg.responseType && msg.content && (
                      <div className="default-response">
                        {typeof msg.content === "string" ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: msg.content }}
                          />
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
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chatbot-input-form">
          <div className="input-container">
            {enableImageUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="chatbot-file-input"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                  onChange={handleImageSelect}
                  disabled={isLoading}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  className="chatbot-attach-button"
                  onClick={openFilePicker}
                  disabled={isLoading}
                  aria-label="Upload image"
                  title="Upload image"
                >
                  <MdAttachFile size={22} />
                </button>
              </>
            )}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
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
