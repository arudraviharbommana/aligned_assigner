import React, { useState } from 'react';
import { Mail, Lock, User, GraduationCap, School, BookOpen, AlertCircle } from 'lucide-react';

const ACADEMIC_DATA = {
  "CSE": {
    sections: ["1", "2", "3", "4"]
  },
  "CSE (AI & ML)": {
    sections: ["1", "2"]
  },
  "CSE Data Science": {
    sections: ["1"]
  }
};

export default function LoginCard({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('1');
  const [roll, setRoll] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('student');
    setBranch('CSE');
    setSection('1');
    setRoll('');
    setError('');
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          throw new Error('Please fill out all mandatory fields');
        }
        if (role === 'student' && !roll) {
          throw new Error('Please provide your Roll Number');
        }

        const signupData = {
          name,
          email,
          password,
          role,
          branch,
          ...(role === 'student' ? { section, roll } : {})
        };

        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signupData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        
        onAuthSuccess(data.user);
      } else {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }

        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');

        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden glass-panel border border-slate-700/50 shadow-2xl">
      {/* Dynamic Header */}
      <div className="relative p-8 text-center bg-indigo-950/40 border-b border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-indigo-500 rounded-full blur-sm opacity-50"></div>
        <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/20">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">{isSignUp ? "Create Campus Account" : "Welcome Back"}</h2>
        <p className="text-xs text-slate-400 mt-1">Access assignments & grading portals</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-xs text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSignUp && (
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User size={16} />
              </span>
              <input 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-200" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Mail size={16} />
            </span>
            <input 
              type="email" 
              required 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-200" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@university.edu"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Lock size={16} />
            </span>
            <input 
              type="password" 
              required 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-200" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {isSignUp && (
          <>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Portal Role</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-300 appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student" className="bg-slate-950">Student</option>
                  <option value="professor" className="bg-slate-950">Professor</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Academic Branch</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <School size={16} />
                </span>
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-300 appearance-none cursor-pointer"
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setSection('1');
                  }}
                >
                  {Object.keys(ACADEMIC_DATA).map(b => (
                    <option key={b} value={b} className="bg-slate-950">{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'student' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Section</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <School size={16} />
                    </span>
                    <select 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-300 appearance-none cursor-pointer"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    >
                      {ACADEMIC_DATA[branch].sections.map(sec => (
                        <option key={sec} value={sec} className="bg-slate-950">Sec {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Roll Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <BookOpen size={16} />
                    </span>
                    <input 
                      type="text" 
                      required 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-none transition-all text-slate-200" 
                      value={roll} 
                      onChange={(e) => setRoll(e.target.value)}
                      placeholder="e.g. 220101"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition duration-200 mt-2 shadow-lg shadow-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
          ) : (
            isSignUp ? "Register Account" : "Log In"
          )}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          {isSignUp ? "Already have a portal account?" : "Need a new campus account?"} &nbsp;
          <button 
            type="button" 
            onClick={handleToggleMode} 
            className="text-indigo-400 hover:text-indigo-300 font-bold underline transition"
          >
            {isSignUp ? "Login here" : "Sign up here"}
          </button>
        </p>
      </form>
    </div>
  );
}
