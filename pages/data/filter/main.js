import React, { useState, useMemo } from 'react';
import TableReport from '../table-report/index';
import '../table-report/TableReport.css'
import { useReportData } from '../../../utils/apiHooks';

const ReportViewer = () => {
  const [filters, setFilters] = useState({
    requestType: [], // Added Request Type filter
    creationDateFrom: null,
    creationDateTo: null,
    priority: [], // Changed to array
    assignedTo: [], // Already array
    status: ['Work in progress'], // Default to "Work in progress"
    breached: [], // Changed to array
    marconaName: [], // Changed to array
    searchText: '',
    timeToBreachOption: 'eq',
    timeToBreachValue: ''
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use the backend API hook (without pagination params)
  const { data: reportData, isLoading, error } = useReportData(
    filters,
    sortConfig
  );

  // Frontend pagination
  const { paginatedTickets, totalPages } = useMemo(() => {
    if (!reportData?.tickets) {
      return { paginatedTickets: [], totalPages: 1 };
    }
    
    const allTickets = reportData.tickets;
    const total = allTickets.length;
    const pages = Math.max(1, Math.ceil(total / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = allTickets.slice(start, end);
    
    return { paginatedTickets: paginated, totalPages: pages };
  }, [reportData?.tickets, currentPage, itemsPerPage]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      requestType: [], // Added Request Type
      creationDateFrom: null,
      creationDateTo: null,
      priority: [],
      assignedTo: [],
      status: ['Work in progress'], // Reset to default "Work in progress"
      breached: [],
      marconaName: [],
      searchText: '',
      timeToBreachOption: 'eq',
      timeToBreachValue: ''
    });
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Get unique values from facets for filter dropdowns
  const getUniqueValues = (property) => {
    if (!reportData?.facets) return [];
    return reportData.facets[property] || [];
  };

  if (isLoading && !reportData) {
    return (
      <div className="flex justify-center items-center p-16 min-h-[400px]">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
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
          <p className="text-lg font-semibold text-gray-700">Loading Report Data</p>
          <p className="text-sm text-gray-500 mt-2">Processing your SLA data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[300px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-2">
            <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="combined-report-container relative">
      {/* Overlay loading indicator when data exists but is being refreshed */}
      {isLoading && reportData && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600"
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
            <span className="text-gray-700 font-medium">Updating data...</span>
          </div>
        </div>
      )}
      
      <TableReport 
        data={paginatedTickets}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        getUniqueValues={getUniqueValues}
        sortConfig={sortConfig}
        onSort={handleSort}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        totalFiltered={reportData?.total_filtered || 0}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ReportViewer;