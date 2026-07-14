import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, Send, Calendar, Check, X, Eye, Download, Info, BookOpen, Layers, Users } from 'lucide-react';
import api from '../utils/api';

const ACADEMIC_DATA = {
  "CSE": {
    sections: ["1", "2", "3", "4"],
    subjects: ["DSA", "Compiler Design", "FLAT", "DBMS", "OS", "Computer Networks", "NSC", "Computer Organization", "ML", "AI", "Agile", "CF", "PSPM", "Cyber", "DevOps"]
  },
  "CSE (AI & ML)": {
    sections: ["1", "2"],
    subjects: ["AI-1", "AI-2", "ML-1", "ML-2", "DL", "NLP", "RL", "OS", "CN", "DBMS", "Agile", "CF", "PSPM", "Cyber", "DevOps"]
  },
  "CSE Data Science": {
    sections: ["1"],
    subjects: ["Data Science-1", "Data Science-2", "DSA", "Compiler Design", "FLAT", "DBMS", "OS", "Computer Networks", "NSC", "Computer Organization", "ML", "AI", "Agile", "CF", "PSPM", "Cyber", "DevOps"]
  }
};

export default function TeacherView({ user, onOpenPreview }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter settings
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');

  // Form states
  const availableSubjects = ACADEMIC_DATA[user.branch]?.subjects || [];
  const availableSections = ACADEMIC_DATA[user.branch]?.sections || [];
  
  const [newSubject, setNewSubject] = useState(availableSubjects[0] || '');
  const [newSection, setNewSection] = useState(availableSections[0] || '');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  
  const [creating, setCreating] = useState(false);
  const [reviewingId, setReviewingId] = useState(null); // tracking operations

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Professor loads all assignments in their branch
      const data = await api.getAssignments({ branch: user.branch });
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

  // Reset form inputs
  const resetForm = () => {
    setNewTitle('');
    setNewInstructions('');
    setNewDeadline('');
    setAttachedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle || !newInstructions || !newDeadline) {
      alert("Please fill out all mandatory fields.");
      return;
    }

    setCreating(true);
    const formData = new FormData();
    formData.append('subject', newSubject);
    formData.append('branch', user.branch);
    formData.append('section', newSection);
    formData.append('title', newTitle);
    formData.append('instructions', newInstructions);
    formData.append('deadline', newDeadline);
    if (attachedFile) {
      formData.append('file', attachedFile);
    }

    try {
      await api.createAssignment(formData);
      resetForm();
      alert("Assignment successfully dispatched to Section " + newSection + "!");
      await loadAssignments();
    } catch (err) {
      alert("Failed to create assignment: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleReview = async (assignId, studentEmail, isApproved) => {
    const status = isApproved ? 'Approved' : 'Failed Approval';
    setReviewingId(`${assignId}-${studentEmail}`);
    
    try {
      await api.reviewSubmission(assignId, studentEmail, status);
      await loadAssignments(); // Reload assignments to show updated evaluation
    } catch (err) {
      alert("Failed to save evaluation review: " + err.message);
    } finally {
      setReviewingId(null);
    }
  };

  // Filter lists
  const filteredAssignments = assignments.filter(
    a => (subjectFilter === 'All' || a.subject === subjectFilter) &&
         (sectionFilter === 'All' || a.section === sectionFilter)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Create Assignment Form Panel */}
      <div className="lg:col-span-1 space-y-6 animate-fade-in">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h3 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
            <PlusCircle size={20} className="text-indigo-400" />
            <span>Create Assignment</span>
          </h3>

          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block uppercase font-bold tracking-wider text-slate-400 text-[10px]">Target Section</label>
                <select 
                  value={newSection} 
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-300 cursor-pointer"
                >
                  {availableSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block uppercase font-bold tracking-wider text-slate-400 text-[10px]">Target Subject</label>
                <select 
                  value={newSubject} 
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-300 cursor-pointer"
                >
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block uppercase font-bold tracking-wider text-slate-400 text-[10px]">Assignment Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Lab 4: AVL Trees Analysis"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block uppercase font-bold tracking-wider text-slate-400 text-[10px]">Submission Instructions</label>
              <textarea 
                rows="4" 
                required
                placeholder="State guidelines, required file format, programming languages..."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-200 focus:outline-none resize-none leading-relaxed"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="block uppercase font-bold tracking-wider text-slate-400 text-[10px]">Submission Deadline</label>
              <div className="relative">
                <input 
                  type="date" 
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-350 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block uppercase font-bold tracking-wider text-slate-400 text-[10px]">Attach Supporting Asset (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition">
                  <FileText size={14} />
                  Choose Attachment
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" 
                    onChange={handleFileChange}
                  />
                </label>
                <div className="truncate text-[10px] text-slate-500 font-mono">
                  {attachedFile ? attachedFile.name : "None selected"}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={creating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 text-xs"
            >
              {creating ? (
                <span className="w-4.5 h-4.5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send size={14} /> Dispatch Assignment
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Monitoring Queue Panel */}
      <div className="lg:col-span-2 space-y-6 animate-fade-in">
        
        {/* Filters Top Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Subject:</span>
              <select 
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 cursor-pointer"
              >
                <option value="All">All Subjects</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Section:</span>
              <select 
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-300 cursor-pointer"
              >
                <option value="All">All Sections</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>
          
          <span className="text-[10px] text-indigo-400 font-extrabold uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-xl">
            {user.branch} Control
          </span>
        </div>

        {/* Assignments monitoring cards */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <span>Dispatched Class Assignments ({filteredAssignments.length})</span>
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-indigo-400">
              <div className="w-8 h-8 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 glass-card">
              <Info size={48} className="mx-auto text-slate-700 mb-3" />
              <p className="font-bold text-base text-slate-400">No Dispatched Assignments</p>
              <p className="text-xs text-slate-500 mt-1">Adjust filters or launch an assignment using the dispatch panel.</p>
            </div>
          ) : (
            filteredAssignments.map(assign => (
              <div key={assign.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
                
                {/* Details Header */}
                <div className="p-5 border-b border-slate-900/60 bg-slate-900/40">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {assign.subject}
                        </span>
                        <span className="bg-slate-800 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          Sec {assign.section}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-200">{assign.title}</h4>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold mt-1">
                      <Calendar size={12} /> Deadline: {assign.deadline}
                    </span>
                  </div>
                </div>

                {/* Submissions Section */}
                <div className="p-5 bg-slate-950/20">
                  <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3.5 flex items-center gap-1.5">
                    <Users size={12} /> Student Submissions ({assign.submissions.length})
                  </h5>
                  
                  {assign.submissions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No submitted documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {assign.submissions.map(sub => (
                        <div key={sub.studentEmail} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-200">{sub.studentName}</p>
                              <span className="text-[10px] text-slate-500 font-mono">Roll: {sub.roll}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs mt-1.5">
                              <FileText size={12} className="text-indigo-400" />
                              <span className="font-semibold text-slate-300 max-w-[150px] sm:max-w-xs truncate">{sub.submittedFile}</span>
                              <span className="text-[10px] text-slate-650">•</span>
                              <span className="text-[10px] text-slate-500">Date: {sub.submittedAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* File Actions */}
                            <div className="flex items-center gap-1 border-r border-slate-800 pr-2 mr-1">
                              <button 
                                onClick={() => onOpenPreview('submissions', sub.submittedFile)}
                                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                                title="Preview submission inline"
                              >
                                <Eye size={14} />
                              </button>
                              <a 
                                href={api.getDownloadUrl('submissions', sub.submittedFile)}
                                download
                                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                                title="Download submission file"
                              >
                                <Download size={14} />
                              </a>
                            </div>

                            {/* Appraisal Controls */}
                            {sub.status === 'Submitted' ? (
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => handleReview(assign.id, sub.studentEmail, true)}
                                  disabled={reviewingId === `${assign.id}-${sub.studentEmail}`}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shadow-md shadow-emerald-950/20"
                                >
                                  <Check size={12} /> Approve
                                </button>
                                <button 
                                  onClick={() => handleReview(assign.id, sub.studentEmail, false)}
                                  disabled={reviewingId === `${assign.id}-${sub.studentEmail}`}
                                  className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shadow-md shadow-rose-950/20"
                                >
                                  <X size={12} /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                sub.status === 'Approved' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {sub.status === 'Approved' ? 'Approved ✔' : 'Rejected ✖'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
