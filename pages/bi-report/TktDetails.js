import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const TktDetails = () => {
  const [ticketDetails, setTicketDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Tkt_Details`);
      
      const data = response.data;
      
      if (data.ticket_details) {
        setTicketDetails(data.ticket_details);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setTicketDetails([]);
      setSummary(null);
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
            <div className="loading-spinner">Loading ticket details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && ticketDetails.length === 0) {
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
              Unable to Load Ticket Details
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchTicketDetails}
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
              backgroundColor: '#007bff', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
             <h2 className="report-title">Ticket Details</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Comprehensive ticket information with status history and assignments
          </p>
          <div style={{ 
            textAlign: 'right', 
            color: '#6c757d', 
            fontSize: '12px', 
            margin: '8px 0 0 0',
            fontStyle: 'italic'
          }}>
            Time Zone: CET
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
                    }}>Historical Status<br/>- Status From</th>
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
                    }}>Historical Status<br/>- Status To</th>
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
                  {ticketDetails.length > 0 ? (
                    ticketDetails.map((row, index) => {
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
                            fontWeight: '600',
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
                            backgroundColor: '#f0f8ff'
                          }}>{row.statusFrom || 'N/A'}</td>
                          <td style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '500',
                            fontSize: '11px',
                            backgroundColor: '#f0f8ff'
                          }}>{row.statusTo || 'N/A'}</td>
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
                      <td colSpan="7" style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#6c757d',
                        fontSize: '16px',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        No ticket details available from API
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
                        fontSize: '12px'
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
                      }}>{summary.total_refined_predt ? summary.total_refined_predt.toFixed(2) : '0.00'}</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>-</td>
                      <td style={{ 
                        padding: '12px 10px', 
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>-</td>
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
      </div>
    </div>
  );
};

export default TktDetails;
