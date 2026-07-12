import React, { useState } from 'react';
import { Folder, FolderPlus, ChevronRight, Home, X, Check } from 'lucide-react';
import { createFolder } from '../services/api';

const FolderTree = ({ folders, currentFolder, onSelectFolder, onFolderCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const parentId = currentFolder ? currentFolder._id : null;
      const res = await createFolder(newFolderName.trim(), parentId);
      if (res.data && res.data.success) {
        setNewFolderName('');
        setIsCreating(false);
        if (onFolderCreated) onFolderCreated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.875rem',
      boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      padding: '1.25rem',
      minHeight: 320,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Folders
          </p>
        </div>
        <button
          onClick={() => { setIsCreating(!isCreating); setError(''); setNewFolderName(''); }}
          title="Create New Folder"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.625rem',
            background: isCreating ? '#eff6ff' : '#f8fafc',
            border: `1.5px solid ${isCreating ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isCreating ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <FolderPlus size={14} />
          New Folder
        </button>
      </div>

      {/* Create Folder Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateFolder}
          style={{
            marginBottom: '0.75rem',
            padding: '0.875rem',
            background: '#f8fafc',
            border: '1.5px solid #bfdbfe',
            borderRadius: '0.625rem',
          }}
        >
          <input
            type="text"
            id="new-folder-name"
            className="form-input"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            disabled={loading}
            autoFocus
            style={{ marginBottom: '0.625rem', fontSize: '0.8125rem' }}
          />
          {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '0.5rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setError(''); }}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
            >
              <X size={13} /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newFolderName.trim()}
              className="btn btn-primary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Check size={13} /> {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Root Directory */}
      <button
        onClick={() => onSelectFolder(null)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.5625rem 0.75rem',
          borderRadius: '0.5rem',
          border: currentFolder === null ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
          background: currentFolder === null ? '#eff6ff' : 'transparent',
          color: currentFolder === null ? '#2563eb' : '#475569',
          fontSize: '0.875rem',
          fontWeight: currentFolder === null ? 600 : 500,
          cursor: 'pointer',
          transition: 'all 150ms ease',
          marginBottom: '0.25rem',
          textAlign: 'left',
        }}
        onMouseEnter={e => { if (currentFolder !== null) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}}
        onMouseLeave={e => { if (currentFolder !== null) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}}
      >
        <Home size={16} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>Root Directory</span>
        {currentFolder === null && <div style={{ width: 6, height: 6, background: '#2563eb', borderRadius: '50%', flexShrink: 0 }} />}
      </button>

      {/* Folder List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {folders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '2rem 1rem',
            color: '#94a3b8', fontSize: '0.8125rem',
          }}>
            <Folder size={28} color="#cbd5e1" style={{ margin: '0 auto 0.625rem' }} />
            <p style={{ fontWeight: 500 }}>No folders yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Click "New Folder" to get started</p>
          </div>
        ) : (
          folders.map(folder => {
            const isActive = currentFolder?._id === folder._id;
            return (
              <button
                key={folder._id}
                onClick={() => onSelectFolder(folder)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: isActive ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#475569',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                  <Folder size={15} style={{ flexShrink: 0, color: isActive ? '#2563eb' : '#94a3b8' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</span>
                </div>
                <ChevronRight size={14} style={{ flexShrink: 0, color: '#cbd5e1' }} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FolderTree;
