import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const TktsSLAsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Tkts_SLAs_Chart`);
      
      const data = response.data;
      
      if (data.chart_data) {
        setChartData(data.chart_data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(`Failed to fetch chart data: ${err.message}`);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    // Ensure we're only rendering a chart, not table data
    if (!chartData || !chartData.months || chartData.months.length === 0) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '700px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6',
          margin: '20px 0'
        }}>
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>Chart</div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No Chart Data Available</div>
            <div style={{ fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
              Chart will appear when API data is loaded.<br/>
              Please ensure the backend API is running and accessible.
            </div>
            <button 
              onClick={fetchChartData}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#0056b3';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Refresh Chart Data
            </button>
          </div>
        </div>
      );
    }

    console.log('Rendering chart with data:', chartData); // Debug log to ensure chart data is used, not table data

    const traces = [
      {
        x: chartData.months,
        y: chartData.ticketsCreated,
        name: 'TicketsCreated',
        type: 'bar',
        marker: { 
          color: '#5DADE2',  // Light blue matching the image
          line: { width: 1, color: '#3498db' }
        },
        text: chartData.ticketsCreated.map(val => val.toString()),
        textposition: 'outside',
        textfont: { size: 10, color: '#333' },
        yaxis: 'y',
      },
      {
        x: chartData.months,
        y: chartData.totalTicketsInclRollover,
        name: 'TotalTicketsInclRollover',
        type: 'bar',
        marker: { 
          color: '#2E4C7E',  // Dark blue matching the image
          line: { width: 1, color: '#1f2937' }
        },
        text: chartData.totalTicketsInclRollover.map(val => val.toString()),
        textposition: 'outside',
        textfont: { size: 10, color: '#333' },
        yaxis: 'y',
      },
      {
        x: chartData.months,
        y: chartData.responseSLA,
        name: 'ResponseSLA %',
        type: 'scatter',
        mode: 'lines+markers+text',
        line: { color: '#E67E22', width: 3 },  // Orange matching the image
        marker: { 
          size: 14, 
          color: '#FFFFFF',  // White center for visibility on blue background
          line: { color: '#E67E22', width: 3 },  // Thick orange border for visibility on white background
          symbol: 'circle'
        },
        text: chartData.responseSLA.map(val => Math.round(val).toString()),
        textposition: 'top center',
        textfont: { 
          size: 12, 
          color: '#000000',  // Black text for maximum visibility
          family: 'Arial, sans-serif',
          weight: 'bold'
        },
        texttemplate: '%{text}',
        cliponaxis: false,
        yaxis: 'y2',
      },
      {
        x: chartData.months,
        y: chartData.resolutionSLA,
        name: 'ResolutionSLA %',
        type: 'scatter',
        mode: 'lines+markers+text',
        line: { color: '#8E44AD', width: 3 },  // Purple matching the image
        marker: { 
          size: 14, 
          color: '#FFFFFF',  // White center for visibility on blue background
          line: { color: '#8E44AD', width: 3 },  // Thick violet border for visibility on white background
          symbol: 'circle'
        },
        text: chartData.resolutionSLA.map(val => Math.round(val).toString()),
        textposition: 'top center',
        textfont: { 
          size: 12, 
          color: '#000000',  // Black text for maximum visibility
          family: 'Arial, sans-serif',
          weight: 'bold'
        },
        texttemplate: '%{text}',
        cliponaxis: false,
        yaxis: 'y2',
      }
    ];

    const layout = {
      title: {
        text: 'Tickets - Inflow, Incl. Rollover, SLAs',
        font: { size: 16, color: '#333', family: 'Arial, sans-serif' },
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        title: {
          text: 'Month',
          font: { size: 12, color: '#333' }
        },
        tickangle: -45,
        tickfont: { size: 10, color: '#666' },
        gridcolor: '#f0f0f0',
        showgrid: true
      },
      yaxis: {
        title: {
          text: 'TicketsCreated and TotalTicketsInclRollover',
          font: { size: 12, color: '#2E4C7E' }
        },
        side: 'left',
        color: '#2E4C7E',
        tickfont: { color: '#2E4C7E' },
        gridcolor: '#f0f0f0',
        showgrid: true,
        range: [0, Math.max(...chartData.totalTicketsInclRollover) * 1.2]
      },
      yaxis2: {
        title: {
          text: 'ResponseSLA % and ResolutionSLA %',
          font: { size: 12, color: '#8E44AD' }
        },
        side: 'right',
        overlaying: 'y',
        color: '#8E44AD',
        tickfont: { color: '#8E44AD' },
        range: [0, 110],
        dtick: 20
      },
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: '#ddd',
        borderwidth: 1,
        font: { size: 11 }
      },
      margin: { l: 80, r: 80, t: 100, b: 120 },
      constraintext: 'none',
      plot_bgcolor: 'rgba(248,249,250,0.5)',
      paper_bgcolor: 'white',
      bargap: 0.3,
      bargroupgap: 0.1,
      autosize: true,
      font: { family: 'Inter, Arial, sans-serif', size: 12 },
      showlegend: true
    };

    return (
      <div style={{
        width: '100%',
        minHeight: '700px',
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '2px solid #e3f2fd',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chart Header */}

        {/* Plotly Chart */}
        <div style={{ flex: 1, minHeight: '600px' }}>
          <Plot
            data={traces}
            layout={layout}
            config={{ 
              responsive: true, 
              displayModeBar: true,
              staticPlot: false,
              displaylogo: false,
              toImageButtonOptions: {
                format: 'png',
                filename: 'ticket_statistics_chart',
                height: 600,
                width: 800,
                scale: 1
              },
              modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d']
            }}
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '600px'
            }}
            useResizeHandler={true}
          />
        </div>

        {/* Chart Footer Info */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#495057',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          <strong>Chart Data:</strong> {chartData.months.length} months • 
          <strong> Total Tickets Created:</strong> {chartData.ticketsCreated.reduce((a, b) => a + b, 0).toLocaleString()} • 
          <strong> Avg Response SLA:</strong> {(chartData.responseSLA.reduce((a, b) => a + b, 0) / chartData.responseSLA.length).toFixed(1)}%
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading chart data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="error-container" style={{ 
            padding: '40px 24px', 
            textAlign: 'center',
            color: '#dc3545'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#dc3545', 
              marginBottom: '10px' 
            }}>
              Unable to Load Chart Data
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchChartData}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={e => e.target.style.backgroundColor = '#007bff'}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-report-container" style={{ paddingBottom: '40px' }}>
      {/* Chart Header */}
      <div className="report-card" style={{ overflow: 'visible', marginBottom: '20px' }}>
        {/* <div className="report-header" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ 
              width: '4px', 
              height: '24px', 
              backgroundColor: '#007bff', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
            <h2 className="report-title">Interactive Chart Dashboard</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Visual representation of ticket trends and SLA performance over time
          </p>
        </div> */}
      </div>

      {/* Chart Section */}
      <div style={{ 
        backgroundColor: 'white',
        overflow: 'visible',
        minHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ 
          // padding: '24px',
          minHeight: '750px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default TktsSLAsChart;