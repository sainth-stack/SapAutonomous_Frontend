import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { batchMonitorURL } from '../../const';
import './index.css';

const BatchMonitor = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('1d'); // Default to 24h as per screenshot

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(batchMonitorURL);
      if (!response.ok) throw new Error('Failed to fetch IDoc data');
      const jsonData = await response.json();

      const processedData = jsonData.flatMap(entry => {
        const timestamp = Object.keys(entry)[0];
        return entry[timestamp].map(item => ({
          ...item,
          timestamp: timestamp,
          fullDate: parseDate(timestamp)
        }));
      });

      setData(processedData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const parseDate = (dateStr) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const filteredData = data.filter(item => {
    const now = new Date();
    const diffMs = now - item.fullDate;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (timeFilter === '2h') return diffHours <= 2;
    if (timeFilter === '1d') return diffHours <= 24;
    return true;
  });

  // Aggregate by Status
  const getStatusCount = (status) => {
    return filteredData
      .filter(item => (item["Status Text"] || "").toLowerCase() === status.toLowerCase())
      .length;
  };

  const statusCounts = {
    Success: getStatusCount("Success"),
    Error: getStatusCount("Error"),
    Pending: getStatusCount("Pending")
  };

  const totalEntries = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const chartData = [
    {
      x: ['Success', 'Error', 'Pending'],
      y: [statusCounts.Success, statusCounts.Error, statusCounts.Pending],
      type: 'bar',
      marker: {
        color: ['#2e4a7d', '#e67e22', '#95a5a6'], // Matching screenshot colors roughly
      },
      text: [statusCounts.Success, statusCounts.Error, statusCounts.Pending].map(String),
      textposition: 'auto',
      hoverinfo: 'none',
    },
  ];

  const layout = {
    title: {
      font: { size: 20, color: '#2c3e50', family: 'Arial, sans-serif' }
    },
    autosize: true,
    height: 450,
    margin: { l: 50, r: 50, b: 50, t: 80, pad: 4 },
    xaxis: {
      tickfont: { size: 14, weight: 'bold' },
    },
    yaxis: {
      gridcolor: '#f0f0f0',
      title: {
        text: 'Object Count'
      }
    },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
  };

  return (
    <div className="batch-monitor-page">
      <header className="batch-monitor-header">
        <h1 className="batch-monitor-title">Batch Monitoring</h1>
        <div className="filter-section">
          <button
            className={`filter-btn ${timeFilter === '2h' ? 'active' : ''}`}
            onClick={() => setTimeFilter('2h')}
          >
            Last 2 hours
          </button>
          <button
            className={`filter-btn ${timeFilter === '1d' ? 'active' : ''}`}
            onClick={() => setTimeFilter('1d')}
          >
            Last one day
          </button>
        </div>
      </header>


      <div className="chart-container" style={{ height: 'auto' }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching latest batch data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="filter-btn" onClick={fetchData}>Retry</button>
          </div>
        ) : (
          <Plot
            data={chartData}
            layout={layout}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: true, responsive: true }}
          />
        )}
      </div>
    </div>
  );
};

export default BatchMonitor;
