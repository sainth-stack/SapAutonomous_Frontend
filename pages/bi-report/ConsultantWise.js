import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../../const';
import '../data/table-report/TableReport.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ConsultantWise = () => {
  const [consultantData, setConsultantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    fetchConsultantData();
  }, []);

  const fetchConsultantData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/sla_tabs/Consultant_Wise`);
      
      const data = response.data;
      
      if (data.consultant_data) {
        setConsultantData(data.consultant_data);
      }
      
      if (data.summary) {
        setSummary(data.summary);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching consultant data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setConsultantData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultantMonthlyData = async (consultantName) => {
    try {
      setLoadingChart(true);
      const response = await axios.get(`${baseURL}/sla_tabs/consultant_monthly/${encodeURIComponent(consultantName)}`);
      setMonthlyData(response.data);
      setSelectedConsultant(consultantName);
      setShowChart(true);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      alert(`Failed to fetch monthly data: ${err.message}`);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleRowClick = (consultantName) => {
    fetchConsultantMonthlyData(consultantName);
  };

  const closeChart = () => {
    setShowChart(false);
    setSelectedConsultant(null);
    setMonthlyData(null);
  };


  if (loading) {
    return (
      <div className="table-report-container">
        <div className="report-card">
          <div className="loading-container">
            <div className="loading-spinner">Loading consultant statistics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && consultantData.length === 0) {
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
              Unable to Load Consultant Data
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              marginBottom: '20px' 
            }}>
              {error}
            </p>
            <button 
              onClick={fetchConsultantData}
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
            <h2 className="report-title">% of Incidents Resolved and Trend - Consultant Wise</h2>
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontSize: '14px', 
            margin: '0',
            fontStyle: 'italic'
          }}>
            Resource effectiveness by assigned and resolved percentages (Click row for monthly trend)
          </p>
        </div>
        
 

        {/* Consultant Data Table */}
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
                      minWidth: '250px'
                    }}>Request - Resource<br/>Assigned To - Name</th>
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
                      minWidth: '150px',
                      backgroundColor: '#dbeafe'
                    }}>Assigned Percentage</th>
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
                      minWidth: '150px',
                      backgroundColor: '#d1fae5'
                    }}>Resolved Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {consultantData.length > 0 ? (
                    consultantData.map((row, index) => (
                      <tr 
                        key={index} 
                        style={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                          transition: 'background-color 0.2s ease, transform 0.1s ease',
                          cursor: 'pointer'
                        }}
                        onMouseOver={e => {
                          e.target.closest('tr').style.backgroundColor = '#e3f2fd';
                          e.target.closest('tr').style.transform = 'scale(1.01)';
                        }}
                        onMouseOut={e => {
                          e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa';
                          e.target.closest('tr').style.transform = 'scale(1)';
                        }}
                        onClick={() => handleRowClick(row.consultant_name)}
                      >
                        <td style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #e9ecef',
                          fontWeight: '500',
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
                            {row.consultant_name}
                            <div style={{ 
                              marginLeft: '8px',
                              fontSize: '10px',
                              color: '#666',
                              fontStyle: 'italic'
                            }}>🔍 Click for trend</div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '8px 12px', 
                          borderBottom: '1px solid #e9ecef', 
                          textAlign: 'center',
                          fontWeight: '700',
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          fontSize: '14px'
                        }}>
                          {row.assigned_percentage}%
                        </td>
                        <td style={{ 
                          padding: '8px 12px', 
                          borderBottom: '1px solid #e9ecef', 
                          textAlign: 'center',
                          fontWeight: '700',
                          backgroundColor: '#d1fae5',
                          color: '#059669',
                          fontSize: '14px'
                        }}>
                          {row.resolved_percentage}%
                        </td>
                      </tr>
                    ))
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
                        No consultant data available from API
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer with Totals */}
            {consultantData.length > 0 && (
              <div style={{ 
                padding: '16px 24px', 
                backgroundColor: '#f8f9fa', 
                borderTop: '2px solid #495057',
                fontSize: '14px', 
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ color: '#495057' }}>
                  <strong>Total Consultants: {consultantData.length}</strong>
                </div>
                {summary && (
                  <div style={{ color: '#495057', display: 'flex', gap: '20px' }}>
                    <span>Assigned: <strong style={{ color: '#2563eb' }}>{summary.total_assigned_tickets}</strong></span>
                    <span>Resolved: <strong style={{ color: '#059669' }}>{summary.total_resolved_tickets}</strong></span>
                    <span>Avg Assigned %: <strong>{summary.avg_assigned_percentage}%</strong></span>
                    <span>Avg Resolved %: <strong>{summary.avg_resolved_percentage}%</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend Chart Modal */}
        {showChart && monthlyData && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: '800px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#1f2937', 
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    Monthly Trend - {selectedConsultant}
                  </h3>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: '#6b7280', 
                    fontSize: '14px' 
                  }}>
                    Tickets Created vs Resolved by Month
                  </p>
                </div>
                <button
                  onClick={closeChart}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.target.style.backgroundColor = '#dc2626'}
                  onMouseOut={e => e.target.style.backgroundColor = '#ef4444'}
                >
                  ✕ Close
                </button>
              </div>

              {loadingChart ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>Loading chart data...</div>
                </div>
              ) : (
                <div>
                  {/* Summary Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      backgroundColor: '#dbeafe',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>
                        {monthlyData.summary.total_created}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Total Created</div>
                    </div>
                    <div style={{
                      backgroundColor: '#d1fae5',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                        {monthlyData.summary.total_resolved}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Total Resolved</div>
                    </div>
                    <div style={{
                      backgroundColor: '#fef3c7',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#d97706' }}>
                        {monthlyData.summary.resolution_rate}%
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Resolution Rate</div>
                    </div>
                    <div style={{
                      backgroundColor: '#f3e8ff',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#7c3aed' }}>
                        {monthlyData.summary.total_months}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Active Months</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div style={{ height: '400px' }}>
                    <Line
                      data={{
                        labels: monthlyData.chart_data.months,
                        datasets: [
                          {
                            label: 'Tickets Created',
                            data: monthlyData.chart_data.tickets_created,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            tension: 0.4
                          },
                          {
                            label: 'Tickets Resolved',
                            data: monthlyData.chart_data.tickets_resolved,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            pointBackgroundColor: '#10b981',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            tension: 0.4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: {
                                size: 12,
                                weight: '600'
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Month',
                              font: {
                                size: 14,
                                weight: '600'
                              }
                            },
                            grid: {
                              color: 'rgba(0, 0, 0, 0.1)'
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Number of Tickets',
                              font: {
                                size: 14,
                                weight: '600'
                              }
                            },
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.1)'
                            }
                          }
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index'
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantWise;
