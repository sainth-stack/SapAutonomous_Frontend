import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const SuspendedL2 = () => {
  const [suspendedL2Data, setSuspendedL2Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [consultants, setConsultants] = useState([]);

  useEffect(() => {
    fetchSuspendedL2Data();
  }, []);

  const fetchSuspendedL2Data = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Suspended_L2`);
      
      const data = response.data;
      
      if (data.suspended_l2_data) {
        setSuspendedL2Data(data.suspended_l2_data);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      if (data.consultants) {
        setConsultants(data.consultants);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching suspended L2 data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setSuspendedL2Data([]);
      setSummary(null);
      setConsultants([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority && priority.includes('P1')) {
      return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
    } else if (priority && priority.includes('P2')) {
      return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
    } else if (priority && priority.includes('P3')) {
      return { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
    } else if (priority && priority.includes('P4')) {
      return { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' };
    }
    return { bg: '#f8f9fa', text: '#495057', border: '#dee2e6' };
  };

  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading suspended L2 details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && suspendedL2Data.length === 0) {
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
              Unable to Load Suspended L2 Data
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchSuspendedL2Data}
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
              backgroundColor: '#6f42c1', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
            <h2 className="report-title">Suspended L2 Details</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Detailed view of suspended tickets with consultant assignments
          </p>
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
                minWidth: '1400px',
                borderCollapse: 'collapse',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '100px'
                    }}>ReqCrYM</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '120px'
                    }}>Request - ID</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '140px'
                    }}>Request - Priority<br/>Description</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '120px'
                    }}>Count of Historical<br/>Status - Status From</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '120px'
                    }}>Sum of<br/>RefinedPreDt</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '140px'
                    }}>Last Historical Status<br/>- Status From</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '140px'
                    }}>Last Historical Status<br/>- Status To</th>
                    <th style={{ 
                      padding: '16px 10px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '180px'
                    }}>Request - Resource<br/>Assigned To - Name</th>
                  </tr>
                </thead>
                <tbody>
                  {suspendedL2Data.length > 0 ? (
                    suspendedL2Data.map((row, index) => {
                      const priorityColor = getPriorityColor(row.priority);
                      
                      return (
                        <tr key={index} style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => e.target.closest('tr').style.backgroundColor = '#e3f2fd'}
                        onMouseOut={e => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                        >
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '11px'
                          }}>{row.reqCrYM || 'N/A'}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '500',
                            fontSize: '11px',
                            color: '#007bff'
                          }}>{row.requestId || 'N/A'}</td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '11px',
                            backgroundColor: priorityColor.bg,
                            color: priorityColor.text,
                            border: `1px solid ${priorityColor.border}`
                          }}>{row.priority || 'Unknown'}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '500',
                            fontSize: '11px'
                          }}>{row.countHistoricalStatus || 0}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '11px',
                            color: '#059669'
                          }}>{row.sumRefinedPreDt ? row.sumRefinedPreDt.toFixed(2) : '0.00'}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '500',
                            fontSize: '11px',
                            backgroundColor: '#e8f5e8',
                            color: '#2e7d32'
                          }}>{row.lastStatusFrom || 'N/A'}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '500',
                            fontSize: '11px',
                            backgroundColor: '#e8f5e8',
                            color: '#2e7d32'
                          }}>{row.lastStatusTo || 'N/A'}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'left',
                            fontWeight: '600',
                            fontSize: '11px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: '#28a745', 
                                borderRadius: '50%',
                                marginRight: '8px'
                              }}></div>
                              {row.consultant || 'Unassigned'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#6c757d',
                        fontSize: '16px',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        No suspended L2 data available from API
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
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}>-</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}>Total</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>-</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>{summary.total_historical_status || 0}</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>{summary.total_refined_predt ? summary.total_refined_predt.toFixed(2) : '0.00'}</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>Work in progress</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>Work in progress</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Consultant Filter/Summary Section */}
        {consultants.length > 0 && (
          <div style={{ 
            margin: '24px 24px 0 24px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '16px 20px',
              backgroundColor: '#6f42c1',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Filter Options - Last Historical Status - Status From & Status To
            </div>
            
            <div style={{ 
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '20px',
              alignItems: 'start'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#495057',
                minWidth: '200px'
              }}>
                Last Historical Status - Status From:
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px'
              }}>
                {['Work in progress'].map((status, index) => (
                  <div key={index} style={{ 
                    padding: '8px 12px',
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#155724',
                    textAlign: 'center'
                  }}>
                    {status}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              padding: '0 20px 20px 20px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '20px',
              alignItems: 'start'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#495057',
                minWidth: '200px'
              }}>
                Request - Resource Assigned To - Name:
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '6px'
              }}>
                {consultants.map((consultant, index) => (
                  <div key={index} style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#495057',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => {
                    e.target.style.backgroundColor = '#e3f2fd';
                    e.target.style.borderColor = '#2196f3';
                  }}
                  onMouseOut={e => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e9ecef';
                  }}
                  >
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#28a745', 
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}></div>
                    {consultant}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspendedL2;
