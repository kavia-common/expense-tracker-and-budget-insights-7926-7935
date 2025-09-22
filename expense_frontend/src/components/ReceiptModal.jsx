import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function ReceiptModal({ onClose, onUpload, loading }) {
  /** Modal UI for uploading a receipt; returns URL via onUpload and emits close. */
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpload() {
    setError(null);
    try {
      const url = await onUpload(file);
      setUploadedUrl(url);
    } catch (e) {
      setError(e.message || 'Upload failed');
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Upload receipt">
      <div className="modal">
        <div className="card-header">
          <div className="card-title">Upload Receipt</div>
        </div>
        <div className="modal-body">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {error && <div style={{ color: 'var(--color-error)' }}>{error}</div>}
          {uploadedUrl && (
            <div>
              <div className="subtle">Uploaded:</div>
              <a href={uploadedUrl} target="_blank" rel="noreferrer" className="btn ghost" style={{ marginTop: 6 }}>
                View Receipt
              </a>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn" onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
