import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import LoginCard from './components/LoginCard';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import FilePreviewModal from './components/FilePreviewModal';
import { LogOut, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aa_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Preview Modal States
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFolder, setPreviewFolder] = useState('');
  const [previewFilename, setPreviewFilename] = useState('');

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('aa_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aa_user');
  };

  const handleOpenPreview = (folder, filename) => {
    setPreviewFolder(folder);
    setPreviewFilename(filename);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 bg-slate-950 font-sans">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center justify-center">
              <span className="text-lg font-black tracking-widest text-white leading-none">AA</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Aligned Assigner</h1>
              <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Decoupled Academic Portal</p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-100">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-400 font-bold capitalize">
                  {currentUser.role} • {currentUser.branch} {currentUser.section ? `(Sec ${currentUser.section})` : ''}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700/80 hover:border-rose-900/50 text-slate-300 p-2.5 rounded-xl transition duration-200 flex items-center justify-center cursor-pointer shadow-md"
                title="Logout session"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 relative">
        {!currentUser ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoginCard onAuthSuccess={handleAuthSuccess} />
          </div>
        ) : (
          <div className="animate-fade-in">
            {currentUser.role === 'student' ? (
              <StudentView user={currentUser} onOpenPreview={handleOpenPreview} />
            ) : (
              <TeacherView user={currentUser} onOpenPreview={handleOpenPreview} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-6 text-center border-t border-slate-900/80 text-[11px] font-medium tracking-wide">
        <p>© 2026 Aligned Assigner • Built with Vite, React, Flask & SQLite</p>
      </footer>

      {/* Document View Global Modal */}
      <FilePreviewModal 
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        folder={previewFolder}
        filename={previewFilename}
      />

    </div>
  );
}

// Mount React Component to DOM Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
