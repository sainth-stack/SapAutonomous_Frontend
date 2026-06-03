import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const buildDateFilterParams = (dateFilter) => {
  if (!dateFilter) return '';
  const params = new URLSearchParams();
  if (dateFilter.range) params.set('range', String(dateFilter.range));
  if (dateFilter.start_month) params.set('start_month', dateFilter.start_month);
  if (dateFilter.end_month) params.set('end_month', dateFilter.end_month);
  const query = params.toString();
  return query ? `?${query}` : '';
};

const TktsSLAsTable = ({ dateFilter = null }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTabData();
  }, [dateFilter]);

  const fetchTabData = async () => {
    try {
      setLoading(true);
      const query = buildDateFilterParams(dateFilter);
      const response = await axios.get(`${baseURL}/sla_tabs/Tkts_SLAs_Table${query}`);
      
      const data = response.data;
      
      if (data.table_data) {
        setTableData(data.table_data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching tab data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const requestPriorities = [
    'P1 - Critical',
    'P2 - High', 
    'P3 - Normal',
    'P4 - Low'
  ];

  const resourceAssigned = [
    'Battula Hima Sri',
    'Das Mritoo',
    'Gopal Ravi',
    'Jaleel Mohammed',
    'Jankula Hemanth',
    'Kiruthiga T Sri',
    'Kumari Anima',
    'Kuntal Patel',
    'La Perla Giuseppe',
    'Menon Nivin',
    'Murugesan Venkatesan',
    'Narendra Verabhadra'
  ];

  const getCellColorClass = (value, column) => {
    if (column === 'modSLAMet') {
      if (value >= 90) return 'cell-green';
      if (value >= 80) return 'cell-yellow';
      if (value >= 70) return 'cell-orange';
      return 'cell-red';
    }
    return '';
  };


  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading ticket statistics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && tableData.length === 0) {
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
              Unable to Load Data
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchTabData}
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
          <h2 className="report-title">Ticket Statistics - Month wise</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', padding: '0 24px' }}>
          {/* Professional Sidebar */}
          <div style={{ 
            width: '280px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '20px',
            border: '1px solid #e9ecef',
            height: 'fit-content'
          }}>
            <div style={{ marginBottom: '24px' }}>
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
                  Request Priorities
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {requestPriorities.map((priority, index) => {
                  const [level, description] = priority.split(' - ');
                  const colors = {
                    'P1': { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
                    'P2': { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
                    'P3': { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
                    'P4': { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' }
                  };
                  const color = colors[level] || { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
                  
                  return (
                    <div key={index} style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: color.bg,
                      border: `1px solid ${color.border}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <span style={{ 
                        color: color.text, 
                        fontWeight: '700',
                        minWidth: '24px'
                      }}>{level}</span>
                      <span style={{ 
                        color: color.text, 
                        marginLeft: '8px'
                      }}>{description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
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
                  backgroundColor: '#28a745', 
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
                  Assigned Resources
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                {resourceAssigned.map((resource, index) => (
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
                    transition: 'all 0.2s ease',
                    cursor: 'default'
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
                    {resource}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Table with Horizontal Scroll */}
          <div style={{ flex: 1, minWidth: 0 }}>
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
                  minWidth: '1200px', // Ensure minimum width for all columns
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
                        minWidth: '80px'
                      }}>Year</th>
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
                        minWidth: '100px'
                      }}>Month</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '120px'
                      }}>Tickets<br/>Created</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '140px'
                      }}>Total Tickets<br/>Incl Rollover</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '120px'
                      }}>Tickets<br/>Completed</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '110px'
                      }}>Response<br/>SLA %</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '110px'
                      }}>Resolution<br/>SLA %</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '110px'
                      }}>ModSLA<br/>Met %</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '110px'
                      }}>Both SLAs<br/>Met %</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'right', 
                        fontWeight: '600', 
                        color: '#495057',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: '110px'
                      }}>Resolution<br/>SLA Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((row, index) => (
                        <tr key={index} style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => e.target.closest('tr').style.backgroundColor = '#e3f2fd'}
                        onMouseOut={e => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                        >
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', fontWeight: '500' }}>{row.year}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', fontWeight: '600', color: '#495057' }}>{row.month}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>{row.ticketsCreated.toLocaleString()}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>{row.totalTicketsInclRollover.toLocaleString()}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>{row.ticketsCompleted.toLocaleString()}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                            {row.responseSLA ? row.responseSLA.toFixed(2) : '0.00'}%
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                            {row.resolutionSLA ? row.resolutionSLA.toFixed(2) : '0.00'}%
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            borderBottom: '1px solid #e9ecef', 
                            textAlign: 'right',
                            fontWeight: '700',
                            color: 'white',
                            borderRadius: '4px',
                            backgroundColor: row.modSLAMet >= 90 ? '#28a745' : 
                                           row.modSLAMet >= 80 ? '#ffc107' : 
                                           row.modSLAMet >= 70 ? '#fd7e14' : '#dc3545'
                          }}>
                            {row.modSLAMet ? row.modSLAMet.toFixed(2) : '0.00'}%
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                            {row.bothSLAsMet ? row.bothSLAsMet.toFixed(2) : '0.00'}%
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                            {row.resolutionSLATime || 0}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ 
                          textAlign: 'center', 
                          padding: '40px', 
                          color: '#6c757d',
                          fontSize: '16px',
                          fontStyle: 'italic',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          No data available from API
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div style={{ 
                padding: '16px 24px', 
                backgroundColor: '#f8f9fa', 
                borderTop: '2px solid #495057', 
                textAlign: 'center', 
                fontSize: '14px', 
                color: '#495057',
                fontWeight: '600'
              }}>
                <strong>Total Records: {tableData.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
        
    </div>
  );
};

export default TktsSLAsTable;
