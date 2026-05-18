import React, { useState, useEffect } from 'react';
import SharedFilters from '../filter/sharedReport';
import SearchModal from '../../../components/SearchModal';
import { baseURL } from '../../../const';
import { getStoredUser } from '../../../utils/authSession';

const getUploadedFileInfo = () => {
  try {
    const uploadedFileInfo = localStorage.getItem('uploadedFile');
    if (!uploadedFileInfo) return null;
    const fileInfo = JSON.parse(uploadedFileInfo);
    if (!fileInfo.name) return null;
    return fileInfo;
  } catch (error) {
    console.error('Error parsing uploaded file info:', error);
    return null;
  }
};

const NUMERIC_SORT_KEYS = new Set(['totalTime', 'elapsedTime', 'timeToBreach']);

const TableReport = ({ data, filters, onFilterChange, onResetFilters, getUniqueValues, sortConfig, onSort, currentPage, onPageChange, totalPages, totalFiltered, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Debug: Log when data changes
  useEffect(() => {
    console.log('TableReport data updated:', {
      dataLength: data?.length || 0,
      currentPage,
      totalPages,
      isLoading,
      firstTicket: data?.[0]?.ticketId
    });
  }, [data, currentPage, totalPages, isLoading]);
  const columns = [
    { key: 'ticketId', name: 'Ticket ID' },
    { key: 'creationDate', name: 'Creation Date' },
    { key: 'priority', name: 'Priority' },
    { key: 'assignedTo', name: 'Assigned To' },
    { key: 'marconaName', name: 'Macro Area - Name' },
    { key: 'similaritySearch', name: 'AI Context Lookup' },
    { key: 'webSearch', name: 'AI Power Search' },
    { key: 'currentStatus', name: 'Current Status' },
    { key: 'totalTime', name: 'Resolution SLA Time' },
    { key: 'elapsedTime', name: 'Elapsed Time (h)' },
    { key: 'timeToBreach', name: 'Remaining Time' },
    { key: 'isBreached', name: 'Breached' }
  ];

  const getColumnStyle = (columnKey) => {
    if (columnKey === 'webSearch') {
      return { minWidth: '190px', width: '190px', whiteSpace: 'nowrap' };
    }
    if (columnKey === 'similaritySearch') {
      return { minWidth: '160px', width: '160px', whiteSpace: 'nowrap' };
    }
    return {};
  };

  // Get badge class based on value
  const getBadgeClass = (value) => {
    if (value === true) return 'badge-breached';
    if (value === false) return 'badge-not-breached';
    if (value?.includes('P1')) return 'badge-p1';
    if (value?.includes('P2')) return 'badge-p2';
    if (value?.includes('P3')) return 'badge-p3';
    if (value?.includes('P4')) return 'badge-p4';
    if (value === 'Closed') return 'badge-closed';
    if (value === 'Work in progress') return 'badge-in-progress';
    if (value === 'Solved') return 'badge-solved';
    return 'badge-open';
  };

  // Handle search modal open
  const handleSearchClick = (ticket, searchType) => {
    setSelectedTicket({ ...ticket, searchType });
    setIsModalOpen(true);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const user = getStoredUser();
      const fileInfo = getUploadedFileInfo();
      const filename = fileInfo?.serverFilename || 'data1.csv';
      
      const body = {
        filename,
        email: user?.email,
        name: user?.name,
        filters,
        sort: sortConfig
      };

      const response = await fetch(`${baseURL}/sla_breach/export_csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `self-monitoring-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="report-card">
        <div className="report-header">
          {/* <h1 className="report-title">SLA Monitoring</h1> */}
        </div>

        <SharedFilters 
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        getUniqueValues={getUniqueValues}
      />

      {/* Summary Info */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b flex-wrap gap-2">
        <div className="text-sm text-gray-600" style={{fontWeight:600}}>
          Showing {totalFiltered || 0} records
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data || data.length === 0 || isExporting || isLoading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export CSV'
            )}
          </button>
          <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container relative">
        {/* Loading overlay for table */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
            <div className="bg-white rounded-lg shadow-md px-4 py-3 flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-gray-700 font-medium">Loading...</span>
            </div>
          </div>
        )}
        
        <table className="data-table" key={`page-${currentPage}-${data?.length || 0}`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  onClick={() => {
                    if (column.key !== 'similaritySearch' && column.key !== 'webSearch' && !isLoading) {
                      onSort(column.key);
                    }
                  }}
                  style={{
                    cursor: column.key !== 'similaritySearch' && column.key !== 'webSearch' && !isLoading ? 'pointer' : 'default',
                    ...getColumnStyle(column.key),
                  }}
                >
                  <div className="flex items-center">
                    {column.name}
                    {sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {data && data.length > 0 ? (
              data.map((ticket, index) => (
                <tr key={`${currentPage}-${ticket.ticketId}-${index}`}>
                <td className="text-blue-600 font-medium">
                  {ticket.ticketId}
                </td>
                <td>{ticket.creationDate}</td>
                <td>
                  <span className={`badge ${getBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{ticket.assignedTo}</td>
                <td>{ticket.marconaName}</td>
                <td>
                  <button
                    onClick={() => handleSearchClick(ticket, 'similarity')}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer bg-transparent border-none"
                    style={{ padding: 0 }}
                  >
                    Click here
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleSearchClick(ticket, 'webSearch')}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer bg-transparent border-none"
                    style={{ padding: 0 }}
                  >
                    Click here
                  </button>
                </td>
                <td>
                  <span className={`badge ${getBadgeClass(ticket.currentStatus)}`}>
                    {ticket.currentStatus}
                  </span>
                </td>
                <td>
                  <span className={``}>
                    {ticket.totalTime}
                  </span>
                </td>
                <td>{ticket.elapsedTime}</td>
                <td>{ticket.timeToBreach}</td>
                <td>
                  <span className={`badge ${getBadgeClass(ticket.isBreached)}`}>
                    {ticket.isBreached ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination relative">
          {/* Pagination Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-lg">
              <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium text-indigo-700">Loading page...</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="pagination-button"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            Previous
          </button>
          
          <div className="flex-1 flex justify-center">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isLoading}
                    className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                    style={{ opacity: isLoading ? 0.5 : 1 }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis" style={{ opacity: isLoading ? 0.5 : 1 }}>...</span>
              )}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={isLoading}
                  className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                >
                  {totalPages}
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
            className="pagination-button"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
      </div>

      {/* Search Modal */}
      {selectedTicket && (
        <SearchModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTicket(null);
          }}
          description={selectedTicket.textRequest != null ? String(selectedTicket.textRequest) : ''}
          ticketId={selectedTicket.ticketId}
          searchType={selectedTicket.searchType}
        />
      )}
    </>
  );
};

export default TableReport;