import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const OpenTkts = () => {
  const [openTickets, setOpenTickets] = useState([]);
  const [macroAreas, setMacroAreas] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchOpenTickets();
  }, []);

  const fetchOpenTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Open_Tkts`);
      
      const data = response.data;
      
      if (data.open_tickets) {
        setOpenTickets(data.open_tickets);
      }
      
      if (data.macro_areas) {
        setMacroAreas(data.macro_areas);
      }
      
      if (data.status_options) {
        setStatusOptions(data.status_options);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching open tickets:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setOpenTickets([]);
      setMacroAreas([]);
      setStatusOptions([]);
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
            <div className="loading-spinner">Loading open tickets...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && openTickets.length === 0) {
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
              Unable to Load Open Tickets
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchOpenTickets}
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
              backgroundColor: '#28a745', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
            <h2 className="report-title">Open Tickets</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Open tickets by macro area and consultant priority breakdown
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          padding: '0 24px',
          minHeight: '600px'
        }}>
          
          {/* Left Column - Macro Areas Filter */}
          <div style={{ 
            width: '320px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '20px',
            border: '1px solid #e9ecef',
            height: 'fit-content'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px',
              borderBottom: '2px solid #dee2e6',
              paddingBottom: '8px'
            }}>
              <div style={{ 
                width: '4px', 
                height: '20px', 
                backgroundColor: '#007bff', 
                marginRight: '8px',
                borderRadius: '2px'
              }}></div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#495057', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Macro Area - Name
              </h3>
            </div>
            
            <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {macroAreas.length > 0 ? macroAreas.map((area, index) => (
                <div key={index} style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#495057',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                  lineHeight: '1.3'
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
                    backgroundColor: '#007bff', 
                    borderRadius: '50%',
                    marginRight: '10px',
                    flexShrink: 0
                  }}></div>
                  <span>{area}</span>
                </div>
              )) : (
                <div style={{ 
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6c757d',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  No macro areas available
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Consultant Priority Breakdown */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '24px'
            }}>
              <div style={{ 
                overflowX: 'auto',
                overflowY: 'visible',
                maxWidth: '100%'
              }}>
                <table style={{ 
                  width: '100%',
                  minWidth: '600px',
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
                        color: '#dc2626',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '90px',
                        backgroundColor: '#fee2e2'
                      }}>P1 - Critical</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: '#d97706',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '90px',
                        backgroundColor: '#fef3c7'
                      }}>P2 - High</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: '#2563eb',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '90px',
                        backgroundColor: '#dbeafe'
                      }}>P3 - Normal</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: '#059669',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '90px',
                        backgroundColor: '#d1fae5'
                      }}>P4 - Low</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center', 
                        fontWeight: '700', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '80px',
                        backgroundColor: '#f1f3f4'
                      }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTickets.length > 0 ? (
                      openTickets.map((row, index) => (
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
                            color: '#495057'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: '#28a745', 
                                borderRadius: '50%',
                                marginRight: '8px'
                              }}></div>
                              {row.consultant}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: row.p1_critical > 0 ? '#fee2e2' : 'transparent',
                            color: row.p1_critical > 0 ? '#dc2626' : '#9ca3af'
                          }}>
                            {row.p1_critical || ''}
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: row.p2_high > 0 ? '#fef3c7' : 'transparent',
                            color: row.p2_high > 0 ? '#d97706' : '#9ca3af'
                          }}>
                            {row.p2_high || ''}
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: row.p3_normal > 0 ? '#dbeafe' : 'transparent',
                            color: row.p3_normal > 0 ? '#2563eb' : '#9ca3af'
                          }}>
                            {row.p3_normal || ''}
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: row.p4_low > 0 ? '#d1fae5' : 'transparent',
                            color: row.p4_low > 0 ? '#059669' : '#9ca3af'
                          }}>
                            {row.p4_low || ''}
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'center',
                            fontWeight: '800',
                            backgroundColor: '#f1f3f4',
                            color: '#495057',
                            fontSize: '14px'
                          }}>
                            {row.total}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ 
                          textAlign: 'center', 
                          padding: '40px', 
                          color: '#6c757d',
                          fontSize: '16px',
                          fontStyle: 'italic',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          No open tickets data available from API
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
                        }}>{summary.total_p1 || 0}</td>
                        <td style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          fontSize: '14px'
                        }}>{summary.total_p2 || 0}</td>
                        <td style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          fontSize: '14px'
                        }}>{summary.total_p3 || 0}</td>
                        <td style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          fontSize: '14px'
                        }}>{summary.total_p4 || 0}</td>
                        <td style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          fontSize: '14px'
                        }}>{summary.grand_total || 0}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Status Section */}
            {statusOptions.length > 0 && (
              <div style={{ 
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '16px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Historical Status - Status To
                </div>
                
                <div style={{ 
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px'
                }}>
                  {statusOptions.map((status, index) => (
                    <div key={index} style={{ 
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#495057',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => {
                      e.target.style.backgroundColor = '#e8f5e8';
                      e.target.style.borderColor = '#28a745';
                    }}
                    onMouseOut={e => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e9ecef';
                    }}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenTkts;
