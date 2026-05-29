import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';

const AgingL2 = () => {
  const [agingL2Details, setAgingL2Details] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAgingL2Details();
  }, []);

  const fetchAgingL2Details = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Aging_L2`);
      
      const data = response.data;
      
      if (data.aging_l2_details) {
        setAgingL2Details(data.aging_l2_details);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching aging L2 details:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setAgingL2Details([]);
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
            <div className="loading-spinner">Loading aging L2 details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && agingL2Details.length === 0) {
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
              Unable to Load Aging L2 Details
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchAgingL2Details}
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
              backgroundColor: '#6c757d', 
              marginRight: '12px',
              borderRadius: '2px'
            }}></div>
            <h2 className="report-title">Aging L2 - Detailed Timestamps</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Consultant-wise aging details with historical status change timestamps
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
                minWidth: '1200px',
                borderCollapse: 'collapse',
                fontSize: '12px',
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
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '180px'
                    }}>Request - Resource<br/>Assigned To - Name</th>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '80px'
                    }}>Year</th>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '100px'
                    }}>Month</th>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '80px'
                    }}>Day</th>
                    <th style={{ 
                      padding: '16px 12px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#495057',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      minWidth: '140px'
                    }}>Historical Status<br/>- Change Time</th>
                  </tr>
                </thead>
                <tbody>
                  {agingL2Details.length > 0 ? (
                    agingL2Details.map((row, index) => (
                      <tr key={index} style={{ 
                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={e => e.target.closest('tr').style.backgroundColor = '#f0f0f0'}
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
                              backgroundColor: '#6c757d', 
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
                          color: '#495057'
                        }}>{row.year || 'N/A'}</td>
                        <td style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #e9ecef', 
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '12px',
                          color: '#495057'
                        }}>{row.month || 'N/A'}</td>
                        <td style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #e9ecef', 
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '12px',
                          color: '#495057'
                        }}>{row.day || 'N/A'}</td>
                        <td style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #e9ecef', 
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '12px',
                          color: '#007bff',
                          backgroundColor: '#f8f9fa'
                        }}>{row.changeTime || 'N/A'}</td>
                      </tr>
                    ))
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
                        No aging L2 details available from API
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
              borderTop: '2px solid #6c757d',
              fontSize: '12px', 
              color: '#495057',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              <strong>Aging L2 Summary:</strong> Total Records: {agingL2Details.length} | 
              {summary && (
                <span> Unique Consultants: <strong>{summary.unique_consultants || 0}</strong></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgingL2;
