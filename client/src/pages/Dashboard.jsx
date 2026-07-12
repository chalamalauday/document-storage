import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FolderTree from '../components/FolderTree';
import Upload from '../components/Upload';
import DocumentTable from '../components/DocumentTable';
import { getFolders, getDocuments } from '../services/api';
import { Search, ChevronRight, Home, FolderOpen, RefreshCw, X } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [navStack, setNavStack] = useState([{ _id: null, name: 'Root' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setListLoading(true);
      try {
        const folderId = currentFolder ? currentFolder._id : null;
        const [foldersRes, docsRes] = await Promise.all([
          getFolders(folderId),
          getDocuments(folderId, searchQuery),
        ]);
        if (foldersRes.data?.success) setFolders(foldersRes.data.folders);
        if (docsRes.data?.success) setDocuments(docsRes.data.documents);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setListLoading(false);
        setIsRefreshing(false);
      }
    };
    fetchData();
  }, [user, currentFolder, refreshTrigger]);

  const handleSelectFolder = (folder) => {
    if (folder === null) {
      setCurrentFolder(null);
      setNavStack([{ _id: null, name: 'Root' }]);
    } else {
      setCurrentFolder(folder);
      const index = navStack.findIndex(item => item._id === folder._id);
      if (index !== -1) setNavStack(navStack.slice(0, index + 1));
      else if (currentFolder && currentFolder._id === folder.parentFolder) setNavStack([...navStack, folder]);
      else setNavStack([{ _id: null, name: 'Root' }, folder]);
    }
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (item, index) => {
    setCurrentFolder(item._id === null ? null : item);
    setNavStack(navStack.slice(0, index + 1));
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setRefreshTrigger(prev => prev + 1);
  };

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%' }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '80rem',
        width: '100%',
        margin: '0 auto',
        padding: '1.75rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* Page Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              My Documents
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
              Manage and organize your files securely in the cloud
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Sidebar */}
          <aside style={{ width: '16rem', flexShrink: 0 }}>
            <FolderTree
              folders={folders}
              currentFolder={currentFolder}
              onSelectFolder={handleSelectFolder}
              onFolderCreated={triggerRefresh}
            />
          </aside>

          {/* Main panel */}
          <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Breadcrumbs + Search row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem', flexWrap: 'wrap',
            }}>
              {/* Breadcrumbs */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.8125rem', fontWeight: 500, overflowX: 'auto',
                padding: '0.5rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.625rem',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                flexShrink: 0,
              }}>
                {navStack.map((item, index) => (
                  <React.Fragment key={item._id || 'root'}>
                    {index > 0 && <ChevronRight size={13} color="#cbd5e1" style={{ flexShrink: 0 }} />}
                    <button
                      onClick={() => handleBreadcrumbClick(item, index)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.125rem 0.25rem', borderRadius: '0.25rem',
                        fontWeight: index === navStack.length - 1 ? 700 : 500,
                        color: index === navStack.length - 1 ? '#2563eb' : '#64748b',
                        whiteSpace: 'nowrap',
                        transition: 'color 150ms ease',
                      }}
                      onMouseEnter={e => { if (index < navStack.length - 1) e.currentTarget.style.color = '#0f172a'; }}
                      onMouseLeave={e => { if (index < navStack.length - 1) e.currentTarget.style.color = '#64748b'; }}
                    >
                      {index === 0 ? <Home size={13} /> : <FolderOpen size={13} />}
                      <span>{item.name}</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Search + Refresh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                  }}>
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    id="doc-search"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '2.25rem', paddingRight: searchQuery ? '2rem' : '0.75rem',
                      paddingTop: '0.5rem', paddingBottom: '0.5rem',
                      width: '13rem', fontSize: '0.8125rem',
                      background: '#ffffff', border: '1.5px solid #e2e8f0',
                      borderRadius: '0.5rem', outline: 'none', color: '#1e293b',
                      transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); triggerRefresh(); }}
                      style={{
                        position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 0,
                      }}
                    ><X size={13} /></button>
                  )}
                </form>
                <button
                  onClick={triggerRefresh}
                  title="Refresh"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36,
                    background: '#ffffff', border: '1.5px solid #e2e8f0',
                    borderRadius: '0.5rem', cursor: 'pointer',
                    color: '#64748b', transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff'; }}
                >
                  <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
              </div>
            </div>

            {/* Upload */}
            <Upload currentFolder={currentFolder} onUploadSuccess={triggerRefresh} />

            {/* Document Table */}
            <DocumentTable documents={documents} loading={listLoading} onUpdate={triggerRefresh} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '0.875rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.75rem', color: '#94a3b8',
        background: '#ffffff',
      }}>
        © {new Date().getFullYear()} DocVault — Encrypted document storage powered by AWS S3 & DynamoDB
      </footer>
    </div>
  );
};

export default Dashboard;
