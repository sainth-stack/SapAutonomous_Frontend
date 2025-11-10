import React, { useState, useMemo } from 'react';
import SharedFilters from '../filter/sharedReport';

const TableReport = ({ data, filters, onFilterChange, onResetFilters, getUniqueValues }) => {
  console.log(filters)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const columns = [
    { key: 'ticketId', name: 'Ticket ID' },
    { key: 'creationDate', name: 'Creation Date' },
    { key: 'priority', name: 'Priority' },
    { key: 'assignedTo', name: 'Assigned To' },
    { key: 'marconaName', name: 'Macro Area - Name' },
    { key: 'currentStatus', name: 'Current Status' },
    { key: 'totalTime', name: 'Resolution SLA Time' },
    { key: 'elapsedTime', name: 'Elapsed Time (h)' },
    { key: 'totalTime', name: 'Remaining Time' },
    { key: 'isBreached', name: 'Breached' }
  ];

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Pagination
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
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

  return (
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
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="text-sm text-gray-600" style={{fontWeight:600}}>
          Showing {data.length} records
        </div>
        <div className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} onClick={() => requestSort(column.key)}>
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
          <tbody>
            {paginatedData.map((ticket, index) => (
              <tr key={index}>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
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
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TableReport;