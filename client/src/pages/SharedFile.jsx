import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedDocument } from '../services/api';
import { File, Download, AlertTriangle, Loader2, ShieldCheck, FolderOpen, Clock, HardDrive } from 'lucide-react';

const SharedFile = () => {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedDoc = async () => {
      setLoading(true); setError('');
      try {
        const res = await getSharedDocument(token);
        if (res.data?.success) {
          setDoc(res.data.document);
          setDownloadUrl(res.data.downloadUrl);
        } else {
          setError(res.data.message || 'Shared link has expired or is invalid.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Shared link has expired or is invalid.');
      } finally { setLoading(false); }
    };
    if (token) fetchSharedDoc();
  }, [token]);

  const handleDownload = () => {
    if (!downloadUrl || !doc) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', doc.originalName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f6ff 0%, #f8fafc 50%, #eff6ff 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem',
          height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
            }}>
              <FolderOpen size={17} color="#fff" />
            </div>
            <div>
              <span style={{
                fontSize: '1rem', fontWeight: 800, color: '#0f172a',
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                letterSpacing: '-0.02em',
              }}>
                Doc<span style={{ color: '#2563eb' }}>Vault</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid #dbeafe', borderTopColor: '#2563eb',
              borderRadius: '50%', margin: '0 auto 1rem',
            }} className="animate-spin" />
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Retrieving shared document...</p>
          </div>
        ) : error ? (
          <div style={{
            width: '100%', maxWidth: '24rem',
            background: '#ffffff', borderRadius: '1rem',
            boxShadow: '0 20px 40px rgba(15,23,42,0.10)',
            overflow: 'hidden', textAlign: 'center',
          }}>
            <div style={{ height: 4, background: '#ef4444' }} />
            <div style={{ padding: '2.5rem 2rem' }}>
              <div style={{
                width: 56, height: 56, background: '#fef2f2', border: '1.5px solid #fecaca',
                borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <AlertTriangle size={26} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.625rem' }}>
                Link Expired or Invalid
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {error}
              </p>
              <div className="alert alert-warning" style={{ fontSize: '0.75rem', textAlign: 'left' }}>
                <Clock size={13} style={{ flexShrink: 0 }} />
                <span>Secure share links expire automatically after <strong>5 minutes</strong>.</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%', maxWidth: '24rem',
            background: '#ffffff', borderRadius: '1rem',
            boxShadow: '0 20px 40px rgba(15,23,42,0.10)',
            overflow: 'hidden',
            animation: 'fadeInUp 250ms ease',
          }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
            <div style={{ padding: '2rem' }}>
              {/* Secure badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                marginBottom: '1.5rem', padding: '0.375rem 0.875rem',
                background: '#ecfdf5', border: '1px solid #a7f3d0',
                borderRadius: '2rem', width: 'fit-content', margin: '0 auto 1.5rem',
              }}>
                <ShieldCheck size={14} color="#059669" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857', letterSpacing: '0.03em' }}>
                  Secured Share Access
                </span>
              </div>

              {/* File info */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 64, height: 64, background: '#eff6ff', border: '1.5px solid #bfdbfe',
                  borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <File size={28} color="#2563eb" />
                </div>
                <h2 style={{
                  fontSize: '1rem', fontWeight: 700, color: '#0f172a',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  padding: '0 0.5rem',
                }} title={doc.originalName}>
                  {doc.originalName}
                </h2>
              </div>

              {/* Metadata */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8125rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b' }}>
                    <HardDrive size={13} /> File Size
                  </span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatBytes(doc.size)}</span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0', marginBottom: '0.625rem' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b' }}>
                    <Clock size={13} /> Shared On
                  </span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Download button */}
              <button
                id="shared-download-btn"
                onClick={handleDownload}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem' }}
              >
                <Download size={17} />
                Download Document
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem', color: '#94a3b8',
        borderTop: '1px solid #e2e8f0',
        background: 'rgba(255,255,255,0.6)',
      }}>
        © {new Date().getFullYear()} DocVault — All shared access is time-limited and encrypted
      </footer>
    </div>
  );
};

export default SharedFile;
