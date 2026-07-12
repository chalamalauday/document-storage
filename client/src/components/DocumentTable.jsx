import React, { useState } from 'react';
import {
  File, Download, Share2, Trash2, FileText, Image, Video, Music, Code,
  Copy, Check, ExternalLink, X, AlertTriangle, Clock, CloudOff
} from 'lucide-react';
import { downloadDocument, deleteDocument, shareDocument } from '../services/api';

const DocumentTable = ({ documents, loading, onUpdate }) => {
  const [sharingDoc, setSharingDoc] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await downloadDocument(docId);
      if (res.data?.success && res.data?.downloadUrl) {
        const link = document.createElement('a');
        link.href = res.data.downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) { alert(err.response?.data?.message || 'Failed to download file'); }
  };

  const handleShare = async (docId) => {
    setShareLoading(true);
    try {
      const res = await shareDocument(docId);
      if (res.data?.success && res.data?.shareToken) {
        const clientUrl = `${window.location.origin}/shared/${res.data.shareToken}`;
        setShareLink(clientUrl);
        setSharingDoc(documents.find(d => d._id === docId));
      }
    } catch (err) { alert(err.response?.data?.message || 'Failed to generate sharing link'); }
    finally { setShareLoading(false); }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setDeleteLoading(true);
    try {
      const res = await deleteDocument(deletingDoc._id);
      if (res.data?.success) { setDeletingDoc(null); if (onUpdate) onUpdate(); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete file'); }
    finally { setDeleteLoading(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return { icon: <FileText size={16} />, color: '#94a3b8', bg: '#f1f5f9', label: 'FILE' };
    if (mimeType.startsWith('image/')) return { icon: <Image size={16} />, color: '#0891b2', bg: '#ecfeff', label: 'IMG' };
    if (mimeType.startsWith('video/')) return { icon: <Video size={16} />, color: '#7c3aed', bg: '#f5f3ff', label: 'VID' };
    if (mimeType.startsWith('audio/')) return { icon: <Music size={16} />, color: '#db2777', bg: '#fdf2f8', label: 'AUD' };
    if (mimeType.includes('pdf')) return { icon: <FileText size={16} />, color: '#dc2626', bg: '#fef2f2', label: 'PDF' };
    if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('html'))
      return { icon: <Code size={16} />, color: '#d97706', bg: '#fffbeb', label: 'CODE' };
    return { icon: <File size={16} />, color: '#2563eb', bg: '#eff6ff', label: 'DOC' };
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  // Overlay modal wrapper styles
  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
    background: 'rgba(15,23,42,0.4)',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 150ms ease',
  };
  const modalStyle = {
    width: '100%',
    background: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 25px 50px rgba(15,23,42,0.2)',
    overflow: 'hidden',
    position: 'relative',
    animation: 'fadeInUp 200ms ease',
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.875rem',
      boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      overflow: 'hidden',
    }}>
      {/* Table header row */}
      {!loading && documents.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 100px 110px 130px',
          padding: '0.75rem 1.5rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <span>Name</span>
          <span>Size</span>
          <span>Uploaded</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>
      )}

      {/* States */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', color: '#94a3b8' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid #dbeafe', borderTopColor: '#2563eb',
            borderRadius: '50%', marginBottom: '0.875rem',
          }} className="animate-spin" />
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', color: '#94a3b8', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64,
            background: '#f1f5f9', border: '1.5px solid #e2e8f0',
            borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <CloudOff size={26} color="#cbd5e1" />
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>No documents found</p>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Upload a file or select a different folder</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          {documents.map((doc, idx) => {
            const fileInfo = getFileIcon(doc.fileType);
            return (
              <div
                key={doc._id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 110px 130px',
                  alignItems: 'center',
                  padding: '0.875rem 1.5rem',
                  borderBottom: idx < documents.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', paddingRight: '1rem' }}>
                  <div style={{
                    width: 34, height: 34, flexShrink: 0,
                    background: fileInfo.bg,
                    borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: fileInfo.color,
                  }}>
                    {fileInfo.icon}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{
                      fontSize: '0.875rem', fontWeight: 600, color: '#1e293b',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }} title={doc.originalName}>
                      {doc.originalName}
                    </p>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, color: fileInfo.color,
                      background: fileInfo.bg, padding: '0.0625rem 0.375rem',
                      borderRadius: '0.25rem',
                    }}>
                      {fileInfo.label}
                    </span>
                  </div>
                </div>

                {/* Size */}
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  {formatBytes(doc.size)}
                </span>

                {/* Date */}
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  {formatDate(doc.createdAt)}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                  <button
                    onClick={() => handleDownload(doc._id, doc.originalName)}
                    title="Download"
                    className="btn-icon btn-icon-success"
                    style={{ padding: '0.4375rem' }}
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => handleShare(doc._id)}
                    disabled={shareLoading}
                    title="Share Secure Link"
                    className="btn-icon btn-icon-brand"
                    style={{ padding: '0.4375rem' }}
                  >
                    <Share2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingDoc(doc)}
                    title="Delete"
                    className="btn-icon btn-icon-danger"
                    style={{ padding: '0.4375rem' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Share Modal ── */}
      {sharingDoc && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: '26rem' }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 36, height: 36, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Share2 size={17} color="#2563eb" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Share Document</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Secure one-time link</p>
                  </div>
                </div>
                <button className="btn-icon" style={{ padding: '0.375rem' }} onClick={() => setSharingDoc(null)}>
                  <X size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>
                Sharing: <strong style={{ color: '#1e293b' }}>"{sharingDoc.originalName}"</strong>
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text" readOnly value={shareLink}
                  style={{
                    flex: 1, padding: '0.5625rem 0.75rem', fontSize: '0.8rem',
                    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                    color: '#334155', outline: 'none', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', flexShrink: 0 }}
                >
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>

              <div className="alert alert-warning" style={{ fontSize: '0.75rem', padding: '0.625rem 0.875rem' }}>
                <Clock size={13} style={{ flexShrink: 0 }} />
                <span>This link expires in <strong>5 minutes</strong> for security.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingDoc && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: '22rem' }}>
            <div style={{ height: 4, background: '#ef4444' }} />
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={18} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Delete Document</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>This action cannot be undone</p>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Are you sure you want to permanently delete{' '}
                <strong style={{ color: '#1e293b' }}>"{deletingDoc.originalName}"</strong>?
                This will remove the file from S3 and delete all metadata.
              </p>

              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeletingDoc(null)}
                  disabled={deleteLoading}
                  className="btn btn-secondary"
                  style={{ padding: '0.5625rem 1.125rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="btn btn-danger"
                  style={{ padding: '0.5625rem 1.125rem' }}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;
