import React, { useState, useEffect } from 'react';
import './index.css';
import FloatingChatBot from '../../components/ChatBot/FloatingChatBot';
import { baseURL } from '../../const';

const IncidentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  // Check for uploaded file and then fetch incident data
  useEffect(() => {
    const checkFileAndFetchData = async () => {
      setLoading(true);
      setError(null);

      // First check if user has uploaded a file
      const uploadedFileInfo = localStorage.getItem('uploadedFile');
      if (!uploadedFileInfo) {
        setHasUploadedFile(false);
        setLoading(false);
        return;
      }

      try {
        const fileInfo = JSON.parse(uploadedFileInfo);
        if (!fileInfo.name) {
          setHasUploadedFile(false);
          setLoading(false);
          return;
        }
        setHasUploadedFile(true);
      } catch (error) {
        console.error('Error parsing uploaded file info:', error);
        setHasUploadedFile(false);
        setLoading(false);
        return;
      }

      // If file exists, fetch incident data (with caching)
      try {
        // Build cache key using endpoint and file identity
        const cacheKey = 'incident_data_cache_v1';
        const cacheTTLms = 5 * 60 * 1000; // 5 minutes TTL
        const now = Date.now();

        // Attempt cache read
        try {
          const cachedRaw = localStorage.getItem(cacheKey);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.timestamp && (now - cached.timestamp) < cacheTTLms && cached.data) {
              setData(cached.data);
              // set filtered
              if (Array.isArray(cached.data)) {
                setFilteredData(cached.data);
              } else if (cached.data?.records && Array.isArray(cached.data.records)) {
                setFilteredData(cached.data.records);
              } else if (typeof cached.data === 'object') {
                setFilteredData([cached.data]);
              }
              setLoading(false);
              return; // serve from cache
            }
          }
        } catch (e) {
          console.warn('Incident cache read failed:', e);
        }

        // No valid cache; fetch fresh
        const response = await fetch(`${baseURL}/predict_incident/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Extract the actual data based on the API response structure
        let processedData;
        if (result.success && result.data) {
          processedData = result.data;
        } else {
          processedData = result;
        }
        
        setData(processedData);
        
        // Set initial filtered data
        if (Array.isArray(processedData)) {
          setFilteredData(processedData);
        } else if (processedData?.records && Array.isArray(processedData.records)) {
          setFilteredData(processedData.records);
        } else if (typeof processedData === 'object') {
          setFilteredData([processedData]);
        }

        // Write to cache (best-effort)
        try {
          const cachePayload = {
            timestamp: now,
            data: processedData
          };
          localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
        } catch (e) {
          console.warn('Incident cache write failed:', e);
        }
      } catch (err) {
        setError(`Failed to load incident data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkFileAndFetchData();
  }, []);

  // Filter data based on search term (search in first column - request ID)
  useEffect(() => {
    if (!data) return;
    
    let tableData = [];
    if (Array.isArray(data)) {
      tableData = data;
    } else if (data.records && Array.isArray(data.records)) {
      tableData = data.records;
    } else if (typeof data === 'object') {
      tableData = [data];
    }

    if (!searchTerm.trim()) {
      setFilteredData(tableData);
      return;
    }

    // Filter based on first column (request ID)
    if (tableData.length > 0) {
      const firstColumnKey = Object.keys(tableData[0])[0];
      const filtered = tableData.filter(row => {
        const firstColumnValue = row[firstColumnKey];
        return firstColumnValue && 
               String(firstColumnValue).toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [data, searchTerm]);

  const renderTable = () => {
    if (!data || filteredData.length === 0) {
      return <div className="no-data">No data to display</div>;
    }

    // Get headers from the first record
    const headers = Object.keys(filteredData[0]);
    const firstColumnKey = headers[0]; // For search label

    return (
      <div className="table-container">
        {/* <div className="table-header">
          <h3>Incident Data Analysis</h3>
          <span className="record-count">
            {filteredData.length} of {Array.isArray(data) ? data.length : (data.records ? data.records.length : 1)} records
          </span>
        </div> */}
        
        <div className="table-controls">
          <label htmlFor="search-input" style={{ fontWeight: '500', color: '#374151' }}>
            Search by {firstColumnKey}:
          </label>
          <input
            id="search-input"
            type="text"
            placeholder={`Enter ${firstColumnKey} to search...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="record-info">
            {searchTerm && `Found ${filteredData.length} matching records`}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>
                      {row[header] !== null && row[header] !== undefined 
                        ? String(row[header]) 
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking for uploaded data...</p>
        </div>
      </div>
    );
  }

  if (!hasUploadedFile) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">Please upload data to analyze before using Incident Management features.</p>
          <button
            onClick={() => window.location.href = '/data-source'}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold"
          >
            Upload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-page-container">
      <div className="text-page-content">
        <div className="page-header">
          <h1>Incident Management</h1>
          <p>Comprehensive incident management for SLA compliance and prediction</p>
        </div>

        <div className="data-section">
          {error && <div className="error-message">{error}</div>}
        </div>

        {!error && data && renderTable()}
      </div>
      
      {/* Add the floating chatbot */}
      {hasUploadedFile && (
        <FloatingChatBot
          title="Incident Analysis Bot"
          subtitle="Ask questions about incident data"
          placeholder="Type a sentence to classify (z_review)"
          endpoint="/classification/"
          initialMessage="Hello! Send me a sentence and I'll classify it and show the z_review."
          showFileInfo={true}
          showSessionInfo={true}
          supportFileUpload={true}
          fileUploadEndpoint="/upload_and_predict/"
          acceptedFileTypes=".csv,.xlsx,.xls"
        />
      )}
    </div>
  );
};

export default IncidentManagement;
