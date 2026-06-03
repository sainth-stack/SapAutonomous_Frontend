import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const OpenTktsL2 = () => {
  const [agingData, setAgingData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchOpenTktsL2Data();
  }, []);

  const fetchOpenTktsL2Data = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Open_Tkts_L2`);
      
      const data = response.data;
      
      if (data.aging_data) {
        setAgingData(data.aging_data);
      }
      
      if (data.chart_data) {
        setChartData(data.chart_data);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching Open Tkts L2 data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setAgingData([]);
      setChartData(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!chartData || !chartData.months || chartData.months.length === 0) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6',
          margin: '20px 0'
        }}>
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>Chart</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Chart Data Available</div>
            <div style={{ fontSize: '12px', marginBottom: '20px', lineHeight: '1.5' }}>
              Chart will appear when API data is loaded.
            </div>
            <button 
              onClick={fetchOpenTktsL2Data}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={e => e.target.style.backgroundColor = '#007bff'}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    const traces = [
      {
        x: chartData.months,
        y: chartData.counts,
        name: 'Count of Request - ID',
        type: 'bar',
        marker: { 
          color: '#3498db',
          line: { width: 1, color: '#2980b9' }
        },
        text: chartData.counts.map(val => val.toString()),
        textposition: 'outside',
        textfont: { size: 12, color: '#333', weight: 'bold' }
      }
    ];

    const layout = {
      title: {
        text: 'Aging of Open Tickets (Chart)',
        font: { size: 16, color: '#333', family: 'Arial, sans-serif' },
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        title: {
          text: 'ReqCrYM',
          font: { size: 12, color: '#333' }
        },
        tickangle: -45,
        tickfont: { size: 10, color: '#666' },
        gridcolor: '#f0f0f0',
        showgrid: true
      },
      yaxis: {
        title: {
          text: 'Count of Request - ID',
          font: { size: 12, color: '#333' }
        },
        gridcolor: '#f0f0f0',
        showgrid: true
      },
      margin: { l: 60, r: 60, t: 60, b: 80 },
      plot_bgcolor: 'rgba(248,249,250,0.5)',
      paper_bgcolor: 'white',
      bargap: 0.4,
      autosize: true,
      font: { family: 'Inter, Arial, sans-serif', size: 12 }
    };

    return (
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
            filename: 'aging_open_tickets_chart',
            height: 400,
            width: 600,
            scale: 1
          }
        }}
        style={{ 
          width: '100%', 
          height: '400px'
        }}
        useResizeHandler={true}
      />
    );
  };

  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading aging data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && agingData.length === 0) {
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
              Unable to Load Aging Data
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchOpenTktsL2Data}
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
      <div className="report-card" style={{ overflow: 'visible' }}>
        <div className="report-header" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ 
              width: '4px', 
              height: '24px', 
              backgroundColor: '#17a2b8', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
            <h2 className="report-title">Open Tickets L2 - Aging Analysis</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Visual and tabular analysis of aging open tickets
          </p>
        </div>

        {/* Two Column Layout - Chart and Table */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          padding: '0 24px',
          alignItems: 'flex-start'
        }}>
          
          {/* Left Column - Chart */}
          <div style={{ 
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef',
            padding: '20px'
          }}>
            {renderChart()}
          </div>

          {/* Right Column - Table */}
          <div style={{ 
            width: '300px',
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <div style={{ 
              padding: '16px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Aging of Open Tickets (Table)
            </div>
            
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    fontWeight: '600', 
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>ReqCrYM</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    fontWeight: '600', 
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Count of<br/>Request - ID</th>
                </tr>
              </thead>
              <tbody>
                {agingData.length > 0 ? (
                  agingData.map((row, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={e => e.target.closest('tr').style.backgroundColor = '#e3f2fd'}
                    onMouseOut={e => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                    >
                      <td style={{ 
                        padding: '10px 16px', 
                        borderBottom: '1px solid #e9ecef', 
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#495057'
                      }}>{row.reqCrYM}</td>
                      <td style={{ 
                        padding: '10px 16px', 
                        borderBottom: '1px solid #e9ecef', 
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#17a2b8'
                      }}>{row.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ 
                      textAlign: 'center', 
                      padding: '30px', 
                      color: '#6c757d',
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      No aging data available
                    </td>
                  </tr>
                )}
                
                {/* Total Row */}
                {summary && (
                  <tr style={{ 
                    backgroundColor: '#495057', 
                    color: 'white',
                    fontWeight: '700'
                  }}>
                    <td style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>Total</td>
                    <td style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center',
                      fontSize: '12px'
                    }}>{summary.total_count || 0}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenTktsL2;
