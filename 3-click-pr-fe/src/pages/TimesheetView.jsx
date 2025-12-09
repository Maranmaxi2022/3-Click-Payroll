// src/pages/TimesheetView.jsx
import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Trash2, Download, Calendar, User, AlertCircle, CheckCircle } from "lucide-react";
import { timesheetAPI } from "../utils/api";

const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function TimesheetView() {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Fetch upload history on component mount
  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    setLoading(true);
    try {
      const uploads = await timesheetAPI.getUploads({ limit: 50 });
      setUploadHistory(uploads.map(upload => ({
        id: upload.id,
        fileName: upload.file_name,
        fileSize: `${(upload.file_size / 1024).toFixed(0)} KB`,
        uploadedBy: "Current User",
        uploadDate: new Date(upload.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastModified: new Date(upload.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: upload.status,
        entriesCreated: upload.entries_created,
        entriesFailed: upload.entries_failed,
        employeeCount: upload.employee_count,
        dateRange: upload.date_range,
      })));
    } catch (error) {
      console.error('Failed to fetch upload history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Only CSV files are allowed');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Upload CSV file to backend
      const result = await timesheetAPI.uploadCSV(file);

      setUploadResult(result);

      // Refresh upload history from backend
      await fetchUploadHistory();

      // Show success message
      if (result.created > 0) {
        alert(`Successfully uploaded ${result.created} time entries!${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
      } else {
        alert('Upload completed but no entries were created. Please check the file format.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timesheet? This will remove the upload record and optionally delete all associated time entries.')) {
      const deleteEntries = window.confirm('Do you also want to delete all time entries created by this upload?');

      try {
        await timesheetAPI.deleteUpload(id, deleteEntries);
        // Refresh upload history
        await fetchUploadHistory();
        alert('Upload deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert(`Delete failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDownload = (fileName) => {
    // Implement download logic
    console.log('Downloading:', fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Timesheet Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload and manage employee timesheet files. Only CSV format is supported.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={cx(
          "relative rounded-xl border-2 border-dashed bg-white p-8 transition-colors",
          dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300",
          uploading ? "opacity-50 pointer-events-none" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className={cx(
            "mb-4 rounded-full p-4",
            dragActive ? "bg-blue-100" : "bg-slate-100"
          )}>
            <Upload className={cx(
              "h-8 w-8",
              dragActive ? "text-blue-500" : "text-slate-400"
            )} />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
          >
            Click to upload
          </button>

          <p className="text-sm text-slate-600">or drag and drop</p>
          <p className="mt-2 text-xs text-slate-500">
            CSV files only (max. 800x400px)
          </p>

          {uploading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className={cx(
          "rounded-xl border p-4",
          uploadResult.failed > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"
        )}>
          <div className="flex items-start gap-3">
            {uploadResult.failed > 0 ? (
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={cx(
                "text-sm font-semibold",
                uploadResult.failed > 0 ? "text-amber-900" : "text-green-900"
              )}>
                Upload {uploadResult.failed > 0 ? "Completed with Warnings" : "Successful"}
              </h3>
              <div className={cx(
                "mt-1 text-sm",
                uploadResult.failed > 0 ? "text-amber-700" : "text-green-700"
              )}>
                <p>Created {uploadResult.created} time entries from {uploadResult.total_rows} rows</p>
                {uploadResult.failed > 0 && (
                  <p className="mt-1 font-medium">{uploadResult.failed} entries failed to process</p>
                )}
              </div>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-amber-800 hover:text-amber-900">
                    View errors ({uploadResult.errors.length})
                  </summary>
                  <div className="mt-2 max-h-48 overflow-y-auto rounded bg-white p-2 text-xs">
                    {uploadResult.errors.map((error, idx) => (
                      <div key={idx} className="border-b border-amber-100 py-1 last:border-0">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <button
                onClick={() => setUploadResult(null)}
                className="mt-2 text-xs font-medium underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">Uploaded Files</h3>
            <p className="mt-1 text-sm text-slate-600">
              Files that have been uploaded to this project
            </p>
          </div>

          {/* Table Header */}
          <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 sm:grid sm:grid-cols-12 gap-4">
            <div className="col-span-4">File name</div>
            <div className="col-span-2">File size</div>
            <div className="col-span-2">Date uploaded</div>
            <div className="col-span-2">Last updated</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* File List */}
          <div className="divide-y divide-slate-200">
            {uploadHistory.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-1 gap-3 p-4 hover:bg-slate-50 transition-colors sm:grid-cols-12 sm:gap-4 items-center"
              >
                {/* File Name */}
                <div className="col-span-1 sm:col-span-4 flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-lg bg-red-50 p-2">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-slate-500 sm:hidden">
                      {file.fileSize} • {file.uploadDate}
                    </p>
                  </div>
                </div>

                {/* File Size */}
                <div className="hidden sm:block sm:col-span-2">
                  <p className="text-sm text-slate-700">{file.fileSize}</p>
                </div>

                {/* Upload Date */}
                <div className="hidden sm:block sm:col-span-2">
                  <p className="text-sm text-slate-700">{file.uploadDate}</p>
                </div>

                {/* Last Modified */}
                <div className="hidden sm:block sm:col-span-2">
                  <p className="text-sm text-slate-700">{file.lastModified}</p>
                </div>

                {/* Actions */}
                <div className="col-span-1 sm:col-span-2 flex items-center justify-start sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(file.fileName)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadHistory.length === 0 && !uploading && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-medium text-slate-900">No files uploaded yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload your first timesheet CSV file to get started
          </p>
        </div>
      )}
    </div>
  );
}
