import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import SharedFilters from '../filter/sharedReport';
import SearchModal from '../../../components/SearchModal';

const NUMERIC_SORT_KEYS = new Set(['totalTime', 'elapsedTime', 'timeToBreach']);

const TableReport = ({ data, filters, onFilterChange, onResetFilters, getUniqueValues }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const itemsPerPage = 10;
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

  const compareCellValues = useCallback((key, aRaw, bRaw) => {
    if (NUMERIC_SORT_KEYS.has(key)) {
      const na = parseFloat(aRaw);
      const nb = parseFloat(bRaw);
      const aValid = aRaw !== '' && aRaw != null && !Number.isNaN(na);
      const bValid = bRaw !== '' && bRaw != null && !Number.isNaN(nb);
      if (!aValid && !bValid) return 0;
      if (!aValid) return 1;
      if (!bValid) return -1;
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    }
    if (aRaw == null && bRaw == null) return 0;
    if (aRaw == null) return 1;
    if (bRaw == null) return -1;
    if (typeof aRaw === 'boolean' || typeof bRaw === 'boolean') {
      if (aRaw === bRaw) return 0;
      return aRaw ? 1 : -1;
    }
    const as = String(aRaw);
    const bs = String(bRaw);
    return as.localeCompare(bs, undefined, { numeric: true, sensitivity: 'base' });
  }, []);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const cmp = compareCellValues(sortConfig.key, a[sortConfig.key], b[sortConfig.key]);
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortConfig, compareCellValues]);

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

  // Handle search modal open
  const handleSearchClick = (ticket, searchType) => {
    setSelectedTicket({ ...ticket, searchType });
    setIsModalOpen(true);
  };

  const handleExportCsv = () => {
    const rows = data.map((ticket) => ({
      'Ticket ID': ticket.ticketId,
      'Creation Date': ticket.creationDate,
      Priority: ticket.priority,
      'Assigned To': ticket.assignedTo,
      'Macro Area - Name': ticket.marconaName,
      'Request - Text Request': ticket.textRequest ?? '',
      'Current Status': ticket.currentStatus,
      'Resolution SLA Time': ticket.totalTime,
      'Elapsed Time (h)': ticket.elapsedTime,
      'Remaining Time': ticket.timeToBreach,
      Breached: ticket.isBreached ? 'Yes' : 'No',
      'Request Type': ticket.requestType ?? '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `self-monitoring-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          Showing {data.length} records
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={data.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV
          </button>
          <div className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  onClick={() => {
                    if (column.key !== 'similaritySearch' && column.key !== 'webSearch') {
                      requestSort(column.key);
                    }
                  }}
                  style={{
                    cursor: column.key !== 'similaritySearch' && column.key !== 'webSearch' ? 'pointer' : 'default',
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