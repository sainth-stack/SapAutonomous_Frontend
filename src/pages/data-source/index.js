import React, { useState, useRef } from 'react';
import './index.css';
import { FaUpload, FaFileAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../../const';
// Removed: readFileAsData, processFileData (no longer needed)

const DataSource = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus('');
    await uploadFile(selectedFile);
  };

  const uploadFile = async (selectedFile) => {
    setIsLoading(true);
    setUploadStatus('');

    try {
      // Optionally gzip compress large CSV files to reduce upload time
      const compressIfSupported = async (file) => {
        try {
          if (file.name.endsWith('.gz') || (file.type && file.type.includes('gzip'))) {
            return file;
          }
          // Only attempt to compress likely text-based files
          const isCsvLike = file.name.endsWith('.csv') || (file.type && file.type.includes('csv'));
          if (!isCsvLike) return file;

          // Heuristic: compress if file > 1MB
          if (file.size < 1 * 1024 * 1024) return file;

          if (typeof CompressionStream === 'function') {
            const cs = new CompressionStream('gzip');
            const compressedStream = file.stream().pipeThrough(cs);
            const compressedBlob = await new Response(compressedStream).blob();
            const gzName = file.name.endsWith('.csv') ? `${file.name}.gz` : `${file.name}.gz`;
            return new File([compressedBlob], gzName, { type: 'application/gzip' });
          }
        } catch (e) {
          console.warn('Compression failed or not supported, uploading original file. Error:', e);
        }
        return file;
      };

      const fileToSend = await compressIfSupported(selectedFile);

      // Build multipart form and send file to backend (already processed file)
      const formData = new FormData();
      formData.append('file', fileToSend);
      formData.append('original_filename', selectedFile.name);

      const response = await fetch(baseURL + '/upload_data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errJson = await response.json();
          errorMessage = errJson.detail || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store upload information
      const fileInfo = {
        name: selectedFile.name,
        uploadDate: new Date().toISOString(),
        size: selectedFile.size,
        originalName: selectedFile.name,
        batchId: data.batch_id || 'unknown',
        rawRecords: data.raw_records || 0,
        processedTickets: data.processed_tickets || 0,
        processed: true,
      };
      localStorage.setItem('uploadedFile', JSON.stringify(fileInfo));

      console.log('Upload successful:', {
        filename: data.filename,
        batchId: data.batch_id,
        rawRecords: data.raw_records,
        processedTickets: data.processed_tickets,
      });

      setUploadStatus('success');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv') || 
        droppedFile.type.includes('spreadsheet') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setUploadStatus('');
      uploadFile(droppedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="data-source-container">
      <div className="data-source-content">
        <div className="header-section">
          <p className="page-eyebrow" style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b", marginBottom: "0.35rem" }}>
            Data Source
          </p>
          <h1 className="page-title">SLA Input File</h1>
          <p className="page-subtitle">
            Upload your CSV or Excel extract to the server for processing. This is the same entry point as before — now listed under Data Source in the sidebar.
          </p>
        </div>

        <div className="upload-section">
          <div 
            className={`upload-zone ${isLoading ? 'loading' : ''} ${uploadStatus === 'success' ? 'success' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.csv.gz,.xlsx,.xls"
              style={{ display: 'none' }}
            />
            
            <div className="upload-icon">
              {isLoading ? (
                <FaSpinner className="spinner" />
              ) : uploadStatus === 'success' ? (
                <FaCheckCircle className="success-icon" />
              ) : (
                <IoCloudUploadOutline />
              )}
            </div>

            <div className="upload-text">
              {isLoading ? (
                <div>
                  <h3>Processing...</h3>
                  <p>Reading and processing your file data</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div>
                  <h3>Processing Complete!</h3>
                  <p>Your data has been processed and uploaded successfully</p>
                </div>
              ) : uploadStatus === 'error' ? (
                <div>
                  <h3>Processing Failed</h3>
                  <p>Please check your file format and try again</p>
                </div>
              ) : (
                <div>
                  <h3>Drop your data file here</h3>
                  <p>or <span className="browse-text">click to browse</span></p>
                  <p className="file-types">Supported formats: CSV, Excel (.xlsx, .xls)</p>
                </div>
              )}
            </div>
          </div>

          {file && !isLoading && (
            <div className="file-info">
              <div className="file-details">
                <FaFileAlt className="file-icon" />
                <div className="file-metadata">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DataSource;
