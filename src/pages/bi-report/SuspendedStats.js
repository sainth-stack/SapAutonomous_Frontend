import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const SuspendedStats = () => {
  const [suspendedData, setSuspendedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSuspendedStats();
  }, []);

  const fetchSuspendedStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Suspended_Stats`);
      
      const data = response.data;
      
      if (data.suspended_data) {
        setSuspendedData(data.suspended_data);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching suspended stats:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setSuspendedData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading suspended statistics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && suspendedData.length === 0) {
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
              Unable to Load Suspended Statistics
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchSuspendedStats}
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
              backgroundColor: '#dc3545', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
            <h2 className="report-title">Suspended Statistics</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Summary of suspended tickets by priority and month
          </p>
        </div>

        {/* Priority Legend */}
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
            <span style={{ color: '#dc2626' }}>P1 - Critical</span>
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
            <span style={{ color: '#d97706' }}>P2 - High</span>
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
            <span style={{ color: '#2563eb' }}>P3 - Normal</span>
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
            <span style={{ color: '#059669' }}>P4 - Low</span>
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
                      minWidth: '150px'
                    }}>Request - Priority<br/>Description</th>
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
                    }}>ReqCrYM</th>
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
                      minWidth: '140px'
                    }}>Count of Request - ID</th>
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
                      minWidth: '160px'
                    }}>Count of Historical<br/>Status - Status From</th>
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
                      minWidth: '140px'
                    }}>Sum of RefinedPreDt</th>
                  </tr>
                </thead>
                <tbody>
                  {suspendedData.length > 0 ? (
                    suspendedData.map((row, index) => {
                      // Determine priority color
                      let priorityColor = { bg: '#f8f9fa', text: '#495057', border: '#dee2e6' };
                      if (row.priority && row.priority.includes('P1')) {
                        priorityColor = { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
                      } else if (row.priority && row.priority.includes('P2')) {
                        priorityColor = { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
                      } else if (row.priority && row.priority.includes('P3')) {
                        priorityColor = { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
                      } else if (row.priority && row.priority.includes('P4')) {
                        priorityColor = { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' };
                      }
                      
                      return (
                        <tr key={index} style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => e.target.closest('tr').style.backgroundColor = '#e3f2fd'}
                        onMouseOut={e => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                        >
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef',
                            fontWeight: '600',
                            backgroundColor: priorityColor.bg,
                            color: priorityColor.text,
                            border: `1px solid ${priorityColor.border}`
                          }}>{row.priority || 'Unknown'}</td>
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#495057'
                          }}>{row.reqCrYM || 'N/A'}</td>
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>{row.countRequestId || 0}</td>
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>{row.countHistoricalStatus || 0}</td>
                          <td style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: '#059669'
                          }}>{row.sumRefinedPreDt ? row.sumRefinedPreDt.toFixed(2) : '0.00'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#6c757d',
                        fontSize: '16px',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        No suspended statistics available from API
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
                        padding: '16px 12px', 
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '800'
                      }}>Total</td>
                      <td style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>-</td>
                      <td style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>{summary.total_requests || 0}</td>
                      <td style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>{summary.total_historical_status || 0}</td>
                      <td style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>{summary.total_refined_predt ? summary.total_refined_predt.toFixed(2) : '0.00'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer with Note */}
            <div style={{ 
              padding: '16px 24px', 
              backgroundColor: '#fff3cd', 
              borderTop: '2px solid #ffeaa7',
              fontSize: '12px', 
              color: '#856404',
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              <strong>PS:</strong> This may not include tickets that are currently in "Suspended" status.<br/>
              Please refer to "Open_Tkts" for the same.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspendedStats;
