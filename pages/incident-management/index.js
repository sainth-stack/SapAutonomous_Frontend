import React, { useState, useEffect } from 'react';
import './index.css';
import FloatingChatBot from '../../components/ChatBot/FloatingChatBot';
import axios from 'axios';
import { classificationRecordsURL } from '../../const';

// Classification API and cache keys (shared with Target Areas page)
export const CLASSIFICATION_RECORDS_URL = classificationRecordsURL;
export const CLASSIFICATION_RECORDS_CACHE_KEY = 'classification_records_cache_v1';
export const CLASSIFICATION_TARGET_AREAS_CACHE_KEY = 'classification_target_areas_v1';

/**
 * Compute department + subfunction + unique ticket count from classification records.
 * Stores result in localStorage for Target Areas page.
 */
export function computeAndPersistTargetAreas(records) {
  if (!Array.isArray(records) || records.length === 0) return [];
  const deptKey = 'department';
  const subKey = 'subfunctional_area';
  const ticketKey = 'd_ticket_id';

  const countByKey = new Map();
  for (const row of records) {
    const dept = row[deptKey] ?? '';
    const sub = row[subKey] ?? '';
    const key = `${dept}\n${sub}`;
    if (!countByKey.has(key)) countByKey.set(key, { uniqueTickets: new Set() });
    const ticketId = row[ticketKey];
    if (ticketId != null && ticketId !== '') countByKey.get(key).uniqueTickets.add(String(ticketId));
  }

  const data = [];
  countByKey.forEach((v, k) => {
    const [department, subfunctional_area] = k.split('\n');
    data.push({
      department,
      subfunctional_area,
      uniqueTicketsCount: v.uniqueTickets.size,
    });
  });
  data.sort((a, b) => {
    const countA = a.uniqueTicketsCount ?? 0;
    const countB = b.uniqueTicketsCount ?? 0;
    if (countB !== countA) return countB - countA;
    const deptCmp = (a.department ?? '').localeCompare(b.department ?? '', undefined, { sensitivity: 'base' });
    if (deptCmp !== 0) return deptCmp;
    return (a.subfunctional_area ?? '').localeCompare(b.subfunctional_area ?? '', undefined, { sensitivity: 'base' });
  });
  try {
    localStorage.setItem(
      CLASSIFICATION_TARGET_AREAS_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (e) {
    console.warn('Target areas cache write failed:', e);
  }
  return data;
}

const IncidentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Always fetch incident data from API when page loads (no dependency on uploaded file)
  useEffect(() => {
    let cancelled = false;

    const fetchIncidentData = async () => {
      setLoading(true);
      setError(null);

      // Use cache whenever it exists (avoids API call when navigating back to this page)
      const cacheKeyToTry = CLASSIFICATION_RECORDS_CACHE_KEY;
      const fallbackCacheKey = 'incident_data_cache_v1';
      const cachedRaw =
        localStorage.getItem(cacheKeyToTry) || localStorage.getItem(fallbackCacheKey);

      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          const cachedData = cached?.data != null ? cached.data : cached;
          if (cachedData != null) {
            let records = [];
            if (Array.isArray(cachedData)) records = cachedData;
            else if (cachedData?.records && Array.isArray(cachedData.records)) records = cachedData.records;
            else records = typeof cachedData === 'object' ? [cachedData] : [];
            setData(cachedData);
            setFilteredData(records);
            computeAndPersistTargetAreas(records);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Classification cache read failed:', e);
        }
      }

      // No valid cache: fetch from classification API
      try {
        const response = await axios.get(CLASSIFICATION_RECORDS_URL);
        if (cancelled) return;

        const result = response.data;
        let processedData;
        if (result?.response && Array.isArray(result.response)) {
          processedData = result.response;
        } else if (result?.success && result?.data) {
          processedData = result.data;
        } else if (Array.isArray(result)) {
          processedData = result;
        } else {
          processedData = result;
        }

        const records = Array.isArray(processedData)
          ? processedData
          : processedData?.records && Array.isArray(processedData.records)
            ? processedData.records
            : typeof processedData === 'object' ? [processedData] : [];

        setData(processedData);
        setFilteredData(records);

        computeAndPersistTargetAreas(records);

        try {
          localStorage.setItem(
            CLASSIFICATION_RECORDS_CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: processedData })
          );
        } catch (e) {
          console.warn('Classification cache write failed:', e);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Failed to load incident data: ${err.message}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchIncidentData();
    return () => { cancelled = true; };
  }, []);

  // Filter data based on search term (search in Ticket Id)
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

    // Filter based on Ticket Id (d_ticket_id)
    if (tableData.length > 0) {
      const filtered = tableData.filter(row => {
        const ticketId = row['d_ticket_id'];
        return ticketId && 
               String(ticketId).toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [data, searchTerm]);

  const renderTable = () => {
    if (!data || filteredData.length === 0) {
      return <div className="no-data">No data to display</div>;
    }

    // Define header order and mapping
    const primaryHeaders = [
      { display: 'SNo', key: 'sno', isGenerated: true },
      { display: 'Ticket ID', key: 'd_ticket_id' },
      { display: 'Brand', key: 'brand' },
      { display: 'Department', key: 'department' },
      { display: 'Location', key: 'location' },
      { display: 'Site', key: 'site' },
      { display: 'Sub Functional Area', key: 'subfunctional_area' }
    ];

    // Column display name mapping
    const columnDisplayMap = {
      'text': 'Summary',
      'z_review': 'Review'
    };

    // Get all keys from the first record
    const allKeys = Object.keys(filteredData[0]);
    
    // Get the keys that are already in primary headers
    const primaryKeys = primaryHeaders.map(h => h.key).filter(k => k !== 'sno');
    
    // Get remaining keys (not in primary headers, excluding count)
    const remainingKeys = allKeys.filter(key => !primaryKeys.includes(key) && key !== 'count');
    
    // Create final headers array with display name mapping
    const headers = [
      ...primaryHeaders,
      ...remainingKeys.map(key => ({ 
        display: columnDisplayMap[key] || key, 
        key: key 
      }))
    ];

    const firstColumnKey = 'Ticket Id'; // For search label

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
                  <th key={index}>{header.display}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => {
                    let cellValue;
                    if (header.isGenerated && header.key === 'sno') {
                      cellValue = rowIndex + 1;
                    } else {
                      cellValue = row[header.key];
                    }
                    return (
                      <td key={colIndex}>
                        {cellValue !== null && cellValue !== undefined 
                          ? String(cellValue) 
                          : '-'}
                      </td>
                    );
                  })}
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
          <p className="text-gray-600">Loading incident data…</p>
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
    </div>
  );
};

export default IncidentManagement;
