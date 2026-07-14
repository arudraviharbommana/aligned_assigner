import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Eye, RefreshCw } from 'lucide-react';
import mammoth from 'mammoth';
import api from '../utils/api';

export default function FilePreviewModal({ isOpen, onClose, folder, filename }) {
  if (!isOpen || !filename) return null;

  const [loading, setLoading] = useState(true);
  const [docxHtml, setDocxHtml] = useState('');
  const [error, setError] = useState(null);
  
  const ext = filename.split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isDocx = ext === 'docx' || ext === 'doc';
  const isImage = ['png', 'jpg', 'jpeg'].includes(ext);

  const previewUrl = api.getPreviewUrl(folder, filename);
  const downloadUrl = api.getDownloadUrl(folder, filename);

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    setError(null);
    setDocxHtml('');

    if (isDocx) {
      // Fetch arraybuffer and convert to html
      fetch(previewUrl)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load file');
          return res.arrayBuffer();
        })
        .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then(result => {
          setDocxHtml(result.value);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Could not render DOCX file inline. Please download it instead.');
          setLoading(false);
        });
    } else {
      // PDF and Images can load directly in iframe/img
      setLoading(false);
    }
  }, [isOpen, filename, previewUrl, isDocx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl overflow-hidden glass-panel border border-slate-700/50 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/30 p-2 rounded-lg text-indigo-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 max-w-[250px] sm:max-w-md truncate">{filename}</h3>
              <p className="text-xs text-slate-400 capitalize">{folder} Asset • {ext.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={downloadUrl}
              download
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-900/20"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="flex-grow overflow-auto bg-slate-900/30 p-4 sm:p-6 relative flex justify-center items-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-indigo-400">
              <RefreshCw className="animate-spin" size={32} />
              <p className="text-sm font-medium text-slate-400">Converting and rendering file...</p>
            </div>
          )}

          {error && (
            <div className="text-center p-6 max-w-md bg-red-950/20 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-bold text-lg mb-2">Preview Error</p>
              <p className="text-slate-300 text-sm mb-4">{error}</p>
              <a 
                href={downloadUrl}
                download
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-lg transition text-xs font-semibold"
              >
                <Download size={14} /> Download File
              </a>
            </div>
          )}

          {!loading && !error && (
            <div className="w-full h-full flex justify-center items-center">
              {isPdf && (
                <iframe 
                  src={previewUrl}
                  className="w-full h-full rounded-lg border border-slate-800 bg-white"
                  title="PDF Document Preview"
                />
              )}

              {isDocx && (
                <div className="w-full h-full bg-white text-slate-800 p-6 sm:p-8 rounded-lg border border-slate-200 overflow-y-auto">
                  <div 
                    className="docx-preview-content"
                    dangerouslySetInnerHTML={{ __html: docxHtml || '<p class="italic text-slate-400">Empty document</p>' }} 
                  />
                </div>
              )}

              {isImage && (
                <div className="max-w-full max-h-full flex items-center justify-center p-2">
                  <img 
                    src={previewUrl} 
                    alt={filename} 
                    className="max-w-full max-h-[75vh] object-contain rounded-lg border border-slate-800 shadow-lg"
                  />
                </div>
              )}

              {!isPdf && !isDocx && !isImage && (
                <div className="text-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-md">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    <Eye size={24} />
                  </div>
                  <p className="text-slate-200 font-bold text-lg mb-2">No Live Preview</p>
                  <p className="text-slate-400 text-sm mb-4">Inline previews are not supported for this file type ({ext.toUpperCase()}). Please download to inspect content.</p>
                  <a 
                    href={downloadUrl}
                    download
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition text-xs font-semibold"
                  >
                    <Download size={14} /> Download Asset
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
