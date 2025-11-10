import { useQuery } from '@tanstack/react-query';
import { baseURL } from '../const';

// Generate a cache key based on file information
const generateCacheKey = (fileInfo) => {
  if (!fileInfo) return null;
  
  // Create a unique key based on file properties that would change if file changes
  const keyComponents = [
    'csv-data',
    fileInfo.name,
    fileInfo.size,
    fileInfo.uploadDate,
    fileInfo.serverFilename
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

// API function to fetch CSV data
const fetchCsvData = async (filename) => {
  if (!filename) {
    throw new Error('No filename provided');
  }

  const response = await fetch(`${baseURL}/get_csv_data/${filename}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`File '${filename}' not found. Please check the filename and try again.`);
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
  const headers = Object.keys(data.records[0]);
  const rows = data.records.map(record => headers.map(header => record[header]));
  return [headers, ...rows];
};

// Custom hook for CSV data with caching
export const useCsvData = () => {
  const fileInfo = getUploadedFileInfo();
  const cacheKey = generateCacheKey(fileInfo);
  const filename = fileInfo?.serverFilename || 'data1.csv';
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => fetchCsvData(filename),
    enabled: !!fileInfo && !!cacheKey, // Only run query if we have file info
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
  return !!(fileInfo && fileInfo.name && (fileInfo.serverFilename || fileInfo.name));
};
