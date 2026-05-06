import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const SLAMonitor = () => {
  const [slaData, setSlaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSLAMonitorData();
  }, []);

  const fetchSLAMonitorData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/SLA_Monitor`);
      
      const data = response.data;
      
      if (data.sla_data) {
        setSlaData(data.sla_data);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching SLA monitor data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setSlaData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getSLAStatusColor = (resolRem) => {
    if (resolRem < 0) {
      return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }; // Red for overdue
    } else if (resolRem < 24) {
      return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' }; // Yellow for critical
    } else if (resolRem < 72) {
      return { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' }; // Blue for warning
    } else {
      return { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' }; // Green for safe
    }
  };

  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading SLA monitor data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && slaData.length === 0) {
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
              Unable to Load SLA Monitor Data
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchSLAMonitorData}
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
            <h2 className="report-title">SLA Monitor</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Real-time SLA monitoring with resolution time tracking
          </p>
        </div>

        {/* SLA Status Legend */}
        <div style={{ 
          padding: '0 24px 20px 24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <span style={{ color: '#dc2626' }}>Overdue (&lt; 0 hrs)</span>
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <span style={{ color: '#d97706' }}>Critical (&lt; 24 hrs)</span>
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <span style={{ color: '#2563eb' }}>Warning (&lt; 72 hrs)</span>
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <span style={{ color: '#059669' }}>Safe (&ge; 72 hrs)</span>
          </div>
        </div>

        {/* Main Data Table */}
        <div style={{ padding: '0 24px' }}>
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              overflowX: 'auto',
              overflowY: 'visible',
              maxWidth: '100%'
            }}>
              <table style={{ 
                width: '100%',
                minWidth: '800px',
                borderCollapse: 'collapse',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'left', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '200px'
                    }}>Request - Resource<br/>Assigned To - Name</th>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '120px'
                    }}>Request - ID</th>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '120px'
                    }}>ResolRem<br/>(Hours)</th>
                  </tr>
                </thead>
                <tbody>
                  {slaData.length > 0 ? (
                    slaData.map((row, index) => {
                      const slaColor = getSLAStatusColor(row.resolRem);
                      
                      return (
                        <tr key={index} style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => e.target.closest('tr').style.backgroundColor = '#e6f3ff'}
                        onMouseOut={e => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                        >
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: '#17a2b8', 
                                borderRadius: '50%',
                                marginRight: '8px'
                              }}></div>
                              {row.consultant || 'Unassigned'}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '12px',
                            color: '#007bff'
                          }}>{row.requestId || 'N/A'}</td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '700',
                            fontSize: '14px',
                            backgroundColor: slaColor.bg,
                            color: slaColor.text,
                            border: `1px solid ${slaColor.border}`,
                            borderRadius: '4px'
                          }}>
                            {row.resolRem !== null && row.resolRem !== undefined ? row.resolRem.toFixed(2) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#6c757d',
                        fontSize: '16px',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        No SLA monitor data available from API
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer with Summary */}
            {summary && (
              <div style={{ 
                padding: '16px 24px', 
                backgroundColor: '#e6f3ff', 
                borderTop: '2px solid #17a2b8',
                fontSize: '12px', 
                color: '#0c5460',
                fontWeight: '600',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div><strong>Total Records:</strong> {slaData.length}</div>
                {summary.overdue_count !== undefined && (
                  <div><strong>Overdue:</strong> {summary.overdue_count}</div>
                )}
                {summary.critical_count !== undefined && (
                  <div><strong>Critical:</strong> {summary.critical_count}</div>
                )}
                {summary.warning_count !== undefined && (
                  <div><strong>Warning:</strong> {summary.warning_count}</div>
                )}
                {summary.safe_count !== undefined && (
                  <div><strong>Safe:</strong> {summary.safe_count}</div>
                )}
                {summary.avg_resol_rem !== undefined && (
                  <div><strong>Avg Resolution Time:</strong> {summary.avg_resol_rem.toFixed(2)} hrs</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLAMonitor;
