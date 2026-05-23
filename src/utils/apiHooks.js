import { useQuery } from '@tanstack/react-query';
import { baseURL } from '../const';
import { getStoredUser } from './authSession';

// Generate a cache key based on file information
const generateCacheKey = (fileInfo) => {
  if (!fileInfo) return null;
  
  // Create a unique key based on file properties that would change if file changes
  const keyComponents = [
    'csv-data',
    fileInfo.name,
    fileInfo.size,
    fileInfo.uploadDate,
    fileInfo.batchId || fileInfo.name,
  ];
  
  return keyComponents;
};

// Get uploaded file info from localStorage
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

// API function to fetch CSV data from PostgreSQL (passes user email/name so backend can filter; admin gets all)
const fetchCsvData = async () => {
  const user = getStoredUser();
  const params = new URLSearchParams();
  if (user?.email) params.set('email', user.email);
  if (user?.name) params.set('name', user.name);
  const query = params.toString();
  const url = query ? `${baseURL}/get_csv_data?${query}` : `${baseURL}/get_csv_data`;

  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No uploaded data found. Please upload a file first.');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error loading data from server.');
    }
  }

  const data = await response.json();
  
  if (!data.records || data.records.length === 0) {
    throw new Error('No data found in the file. Please upload a valid file.');
  }

  // Convert the API response back to array format for processing
  // IMPORTANT: Use data.columns from backend to maintain correct column order
  const headers = data.columns || Object.keys(data.records[0]);
  const rows = data.records.map(record => headers.map(header => record[header]));
  
  console.log('CSV Data loaded:', {
    numRows: rows.length,
    numColumns: headers.length,
    firstFewHeaders: headers.slice(0, 10),
    sampleRow: rows[0]?.slice(0, 10)
  });
  
  return [headers, ...rows];
};

// Custom hook for CSV data with caching
export const useCsvData = () => {
  const fileInfo = getUploadedFileInfo();
  const cacheKey = generateCacheKey(fileInfo);
  
  return useQuery({
    queryKey: cacheKey || ['csv-data', 'default'],
    queryFn: () => fetchCsvData(),
    enabled: true, // Always load data from server (default or uploaded file)
    staleTime: 10 * 60 * 1000, // 10 minutes - data is considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - how long to keep in cache
    retry: (failureCount, error) => {
      // Don't retry on 404 errors or client errors
      if (error.message.includes('not found') || error.message.includes('No data found')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Hook to get file info without making API calls
export const useFileInfo = () => {
  return getUploadedFileInfo();
};

// Hook to check if we have valid file info for API calls
export const useHasValidFileInfo = () => {
  const fileInfo = getUploadedFileInfo();
  return !!(fileInfo && fileInfo.name);
};

// API function to fetch report data from backend with filters and sorting (no pagination)
const fetchReportData = async (email, name, filters, sort) => {
  const url = `${baseURL}/sla_breach/report`;
  
  const body = {
    filename: 'db',
    email,
    name,
    filters: {
      requestType: filters.requestType || [],
      creationDateFrom: filters.creationDateFrom || null,
      creationDateTo: filters.creationDateTo || null,
      priority: filters.priority || [],
      assignedTo: filters.assignedTo || [],
      status: filters.status || ['Work in progress'],
      breached: filters.breached || [],
      marconaName: filters.marconaName || [],
      searchText: filters.searchText || '',
      timeToBreachOption: filters.timeToBreachOption || 'eq',
      timeToBreachValue: filters.timeToBreachValue || ''
    },
    sort: {
      key: sort.key || null,
      direction: sort.direction || 'asc'
    },
    page: 1,
    page_size: 999999 // Large number to get all results
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error fetching report data from server.');
  }

  return response.json();
};

// Custom hook for report data with backend processing (pagination handled in frontend)
export const useReportData = (filters, sort) => {
  const fileInfo = getUploadedFileInfo();
  const user = getStoredUser();
  
  return useQuery({
    queryKey: ['report-data', fileInfo?.batchId || fileInfo?.name, filters, sort, user?.email, user?.name],
    queryFn: () => fetchReportData(user?.email, user?.name, filters, sort),
    enabled: true,
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes - how long to keep in cache
    refetchOnMount: true, // Refetch when component mounts
    retry: (failureCount, error) => {
      if (error.message.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
