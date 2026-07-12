import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, File, X, Loader2, AlertCircle, CloudUpload, CheckCircle2 } from 'lucide-react';
import { uploadDocument } from '../services/api';

const Upload = ({ currentFolder, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError(''); setSuccess(false);
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder) formData.append('folderId', currentFolder._id);
    try {
      const res = await uploadDocument(formData);
      if (res.data && res.data.success) {
        setSuccess(true);
        setTimeout(() => { setFile(null); setSuccess(false); if (onUploadSuccess) onUploadSuccess(); }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };

  const getFileExtension = (filename) => filename.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.875rem',
      boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CloudUpload size={16} color="#2563eb" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
            Upload Files
          </span>
          {currentFolder && (
            <span style={{
              fontSize: '0.7rem', background: '#eff6ff', color: '#2563eb',
              border: '1px solid #bfdbfe', borderRadius: '2rem',
              padding: '0.125rem 0.5rem', fontWeight: 500,
            }}>
              → /{currentFolder.name}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '0.875rem', fontSize: '0.8125rem' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Drop Zone / File Preview */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            border: `2px dashed ${dragActive ? '#3b82f6' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            padding: '2rem 1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            background: dragActive ? '#eff6ff' : '#fafafa',
            transition: 'all 200ms ease',
            textAlign: 'center',
          }}
          onMouseEnter={e => { if (!dragActive) { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#f8fbff'; }}}
          onMouseLeave={e => { if (!dragActive) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa'; }}}
        >
          <input ref={fileInputRef} type="file" id="file-upload-input" style={{ display: 'none' }} onChange={handleChange} />
          <div style={{
            width: 48, height: 48,
            background: dragActive ? '#eff6ff' : '#f1f5f9',
            border: `1.5px solid ${dragActive ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.875rem',
            transition: 'all 200ms ease',
          }}>
            <UploadIcon size={22} color={dragActive ? '#2563eb' : '#94a3b8'} />
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            Drag & drop your file here
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.875rem' }}>
            or{' '}
            <span style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              browse to choose a file
            </span>
          </p>
          <span style={{
            fontSize: '0.7rem', color: '#94a3b8',
            background: '#f1f5f9', padding: '0.25rem 0.625rem',
            borderRadius: '2rem', fontWeight: 500,
          }}>
            Supports files up to 50 MB
          </span>
        </div>
      ) : (
        /* Selected File Card */
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          background: success ? '#ecfdf5' : '#f8fafc',
          border: `1.5px solid ${success ? '#a7f3d0' : '#e2e8f0'}`,
          borderRadius: '0.75rem',
          transition: 'all 200ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
            {/* File type badge */}
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: success ? '#d1fae5' : '#eff6ff',
              border: `1.5px solid ${success ? '#6ee7b7' : '#bfdbfe'}`,
              borderRadius: '0.625rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              {success ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <>
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.02em' }}>
                    {getFileExtension(file.name)}
                  </span>
                  <File size={12} color="#60a5fa" />
                </>
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontSize: '0.875rem', fontWeight: 600, color: success ? '#047857' : '#1e293b',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{file.name}</p>
              <p style={{ fontSize: '0.75rem', color: success ? '#059669' : '#94a3b8', marginTop: '1px' }}>
                {success ? 'Upload successful!' : formatBytes(file.size)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {!success && (
              <button
                onClick={() => { setFile(null); setError(''); }}
                disabled={loading}
                title="Remove"
                className="btn-icon"
                style={{ padding: '0.375rem' }}
              >
                <X size={15} />
              </button>
            )}
            {!success && (
              <button
                id="upload-submit-btn"
                onClick={handleUpload}
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                ) : (
                  <><UploadIcon size={14} /> Upload</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
