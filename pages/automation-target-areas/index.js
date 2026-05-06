import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAccountTree } from 'react-icons/md';
import {
  CLASSIFICATION_RECORDS_URL,
  CLASSIFICATION_TARGET_AREAS_CACHE_KEY,
  computeAndPersistTargetAreas,
} from '../incident-management';
import '../incident-management/index.css';
import './index.css';

const AutomationTargetAreas = () => {
  const [loading, setLoading] = useState(true);
  const [targetAreas, setTargetAreas] = useState([]);
  const [error, setError] = useState(null);
  const [view, setView] = useState('tiles'); // 'tiles' | 'table'

  useEffect(() => {
    let cancelled = false;

    const loadTargetAreas = async () => {
      setLoading(true);
      setError(null);

      try {
        const cachedRaw = localStorage.getItem(CLASSIFICATION_TARGET_AREAS_CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached?.data && Array.isArray(cached.data) && cached.data.length > 0) {
            const sorted = [...cached.data].sort((a, b) => {
              const countA = a.uniqueTicketsCount ?? 0;
              const countB = b.uniqueTicketsCount ?? 0;
              if (countB !== countA) return countB - countA;
              const deptCmp = (a.department ?? '').localeCompare(b.department ?? '', undefined, { sensitivity: 'base' });
              if (deptCmp !== 0) return deptCmp;
              return (a.subfunctional_area ?? '').localeCompare(b.subfunctional_area ?? '', undefined, { sensitivity: 'base' });
            });
            setTargetAreas(sorted);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Target areas cache read failed:', e);
      }

      try {
        const response = await axios.get(CLASSIFICATION_RECORDS_URL);
        if (cancelled) return;

        const result = response.data;
        let records = [];
        if (result?.response && Array.isArray(result.response)) {
          records = result.response;
        } else if (result?.success && result?.data) {
          records = Array.isArray(result.data) ? result.data : result.data?.records ?? [];
        } else if (Array.isArray(result)) {
          records = result;
        } else if (result?.records && Array.isArray(result.records)) {
          records = result.records;
        } else {
          records = typeof result === 'object' ? [result] : [];
        }

        const data = computeAndPersistTargetAreas(records);
        if (!cancelled) setTargetAreas(data); // already sorted by count descending
      } catch (err) {
        if (!cancelled) setError(`Failed to load classification data: ${err.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTargetAreas();
    return () => { cancelled = true; };
  }, []);

  const renderTable = () => {
    if (targetAreas.length === 0) {
      return <div className="target-areas-no-data">No target areas data to display</div>;
    }

    const headers = [
      { display: 'Department', key: 'department' },
      { display: 'Sub Functional Area', key: 'subfunctional_area' },
      { display: 'Unique Tickets count', key: 'uniqueTicketsCount' },
      { display: 'Avg Response Time', key: 'avgResponseTime', empty: true },
    ];

    return (
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h.display}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {targetAreas.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((h, colIndex) => (
                    <td key={colIndex}>
                      {h.empty
                        ? '--'
                        : row[h.key] !== null && row[h.key] !== undefined && row[h.key] !== ''
                        ? String(row[h.key])
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

  const renderTiles = () => (
    <div className="target-areas-tiles">
      <div
        className="target-areas-tile target-areas-tile-active"
        onClick={() => setView('table')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setView('table')}
      >
        <div className="target-areas-tile-icon-wrap">
          <MdAccountTree size={40} className="target-areas-tile-icon" />
        </div>
        <span className="target-areas-tile-name">Work stream wise</span>
        <span className="target-areas-tile-action">View table →</span>
      </div>
    </div>
  );

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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Loading target areas from classification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-page-container">
      <div className="text-page-content">
        <div className="page-header">
          <h1>Target Areas</h1>
          <p>
            {view === 'tiles'
              ? 'Select a view to see department and subfunction breakdown'
              : 'Department and subfunction breakdown by unique ticket count (from classification)'}
          </p>
        </div>

        <div className="data-section">
          {error && <div className="error-message">{error}</div>}
        </div>

        {!error && view === 'tiles' && renderTiles()}
        {!error && view === 'table' && (
          <>
            <button
              type="button"
              className="target-areas-back-btn"
              onClick={() => setView('tiles')}
            >
              ← Back to tiles
            </button>
            {renderTable()}
          </>
        )}
      </div>
    </div>
  );
};

export default AutomationTargetAreas;
