import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Upload, Calendar, CheckCircle2, AlertCircle, Clock, Eye, Download, Info } from 'lucide-react';
import api from '../utils/api';

const ACADEMIC_DATA = {
  "CSE": {
    subjects: ["DSA", "Compiler Design", "FLAT", "DBMS", "OS", "Computer Networks", "NSC", "Computer Organization", "ML", "AI", "Agile", "CF", "PSPM", "Cyber", "DevOps"]
  },
  "CSE (AI & ML)": {
    subjects: ["AI-1", "AI-2", "ML-1", "ML-2", "DL", "NLP", "RL", "OS", "CN", "DBMS", "Agile", "CF", "PSPM", "Cyber", "DevOps"]
  },
  "CSE Data Science": {
    subjects: ["Data Science-1", "Data Science-2", "DSA", "Compiler Design", "FLAT", "DBMS", "OS", "Computer Networks", "NSC", "Computer Organization", "ML", "AI", "Agile", "CF", "PSPM", "Cyber", "DevOps"]
  }
};

export default function StudentView({ user, onOpenPreview }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All');
  
  // File submission state
  const [selectedFiles, setSelectedFiles] = useState({}); // { assignmentId: File }
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const availableSubjects = ACADEMIC_DATA[user.branch]?.subjects || [];

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignments({
        branch: user.branch,
        section: user.section,
        student_email: user.email
      });
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const handleFileChange = (assignId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [assignId]: file }));
      setUploadError(null);
    }
  };

  const handleSubmit = async (assignId) => {
    const file = selectedFiles[assignId];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploadingId(assignId);
    setUploadError(null);

    const formData = new FormData();
    formData.append('assignment_id', assignId);
    formData.append('student_email', user.email);
    formData.append('student_name', user.name);
    formData.append('roll', user.roll);
    formData.append('file', file);
    formData.append('submitted_at', new Date().toISOString().split('T')[0]);

    try {
      await api.submitAssignment(formData);
      // Clean selected file
      setSelectedFiles(prev => {
        const copy = { ...prev };
        delete copy[assignId];
        return copy;
      });
      await loadAssignments(); // Reload assignments to update status
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(
    a => subjectFilter === 'All' || a.subject === subjectFilter
  );

  // Status computation helpers
  const getSubmissionForAssignment = (assign) => {
    return assign.submissions.find(s => s.studentEmail === user.email);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'Submitted':
        return (
          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Clock size={12} /> Under Review
          </span>
        );
      case 'Failed Approval':
        return (
          <span className="flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            <AlertCircle size={12} /> Rejected (Resubmit)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Info size={12} /> Assigned
          </span>
        );
    }
  };

  // Counters for dashboard widgets
  const todoCount = assignments.filter(a => {
    const sub = getSubmissionForAssignment(a);
    return !sub || sub.status === 'Failed Approval';
  }).length;

  const reviewCount = assignments.filter(a => {
    const sub = getSubmissionForAssignment(a);
    return sub && sub.status === 'Submitted';
  }).length;

  const approvedCount = assignments.filter(a => {
    const sub = getSubmissionForAssignment(a);
    return sub && sub.status === 'Approved';
  }).length;

  return (
    <div className="space-y-8">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold">Academic Core</span>
          <span className="text-xl font-black text-slate-100 mt-2 truncate">{user.branch}</span>
          <span className="text-[11px] text-slate-400 mt-1">Section {user.section} • Roll {user.roll}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <span className="text-[10px] text-rose-400 uppercase tracking-widest font-extrabold">Remaining Tasks</span>
          <span className="text-3xl font-black text-white mt-1 glow-text-indigo">{todoCount}</span>
          <span className="text-[11px] text-slate-400 mt-1">Awaiting implementation</span>
        </div>

        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <span className="text-[10px] text-amber-400 uppercase tracking-widest font-extrabold">In Evaluation</span>
          <span className="text-3xl font-black text-white mt-1">{reviewCount}</span>
          <span className="text-[11px] text-slate-400 mt-1">Submitted files in review</span>
        </div>

        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-extrabold">Completed Tasks</span>
          <span className="text-3xl font-black text-white mt-1 glow-text-green">{approvedCount}</span>
          <span className="text-[11px] text-slate-400 mt-1">Approved academic credits</span>
        </div>
      </div>

      {/* Subject Filter Panel */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Filter Subject Module</span>
            <select 
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-300"
            >
              <option value="All">All Course Subjects</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic">Showing {filteredAssignments.length} matches of {assignments.length} enrolled tasks</p>
      </div>

      {/* Assignment Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-200">Active Curriculum Assignments</h3>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-indigo-400">
            <div className="w-8 h-8 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 glass-card">
            <BookOpen size={48} className="mx-auto text-slate-700 mb-3" />
            <p className="font-bold text-base text-slate-400">No Tasks Pending</p>
            <p className="text-xs text-slate-500 mt-1">Excellent! No matching assignments found for this filter.</p>
          </div>
        ) : (
          filteredAssignments.map(assign => {
            const submission = getSubmissionForAssignment(assign);
            const status = submission ? submission.status : 'Assigned';
            const fileSelected = selectedFiles[assign.id];

            return (
              <div key={assign.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all">
                <div className="p-6">
                  
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {assign.subject}
                      </span>
                      <h4 className="text-lg font-bold text-slate-100">{assign.title}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(status)}
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold mt-1">
                        <Calendar size={12} /> Deadline: {assign.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Instructions Content */}
                  <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl text-xs text-slate-300 mb-5 leading-relaxed">
                    <h5 className="font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider text-[10px]">Instructions:</h5>
                    <p className="whitespace-pre-line">{assign.instructions}</p>

                    {/* Reference Document */}
                    {assign.fileName && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <FileText size={14} />
                          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{assign.fileName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => onOpenPreview('assignments', assign.fileName)}
                            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition text-[11px] font-medium"
                          >
                            <Eye size={12} /> Preview
                          </button>
                          <a 
                            href={api.getDownloadUrl('assignments', assign.fileName)}
                            download
                            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition text-[11px] font-medium"
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Dropzone Submitter */}
                  {(!submission || status === 'Failed Approval') && (
                    <div className="space-y-3">
                      {uploadError && uploadingId === assign.id && (
                        <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400">
                          Error submitting: {uploadError}
                        </div>
                      )}
                      
                      <div className="p-4 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl bg-slate-900/20 flex flex-col sm:flex-row items-center gap-4 transition">
                        <div className="flex-grow flex items-center gap-3 w-full">
                          <label className="cursor-pointer shrink-0 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                            <Upload size={14} />
                            Select File
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" 
                              onChange={(e) => handleFileChange(assign.id, e)}
                              disabled={uploadingId === assign.id}
                            />
                          </label>
                          <div className="truncate text-xs text-slate-400 font-mono">
                            {fileSelected ? fileSelected.name : "Select document, PDF, or image..."}
                          </div>
                        </div>

                        {fileSelected && (
                          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                            <button 
                              onClick={() => handleSubmit(assign.id)}
                              disabled={uploadingId === assign.id}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              {uploadingId === assign.id ? (
                                <span className="w-4.5 h-4.5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
                              ) : (
                                "Upload Submission"
                              )}
                            </button>
                            <button 
                              onClick={() => setSelectedFiles(prev => {
                                const copy = { ...prev };
                                delete copy[assign.id];
                                return copy;
                              })}
                              disabled={uploadingId === assign.id}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission Details */}
                  {submission && (
                    <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" />
                        <span>Submitted file: <strong className="text-slate-300">{submission.submittedFile}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Date: {submission.submittedAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => onOpenPreview('submissions', submission.submittedFile)}
                          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2 py-1 rounded transition text-[11px] font-medium"
                        >
                          <Eye size={12} /> Preview
                        </button>
                        <a 
                          href={api.getDownloadUrl('submissions', submission.submittedFile)}
                          download
                          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2 py-1 rounded transition text-[11px] font-medium"
                        >
                          <Download size={12} /> Download
                        </a>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
