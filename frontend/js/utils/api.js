const BASE_URL = '/api';

export const api = {
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async signup(userData) {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Signup failed');
    }
    return res.json();
  },

  async getAssignments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.section) params.append('section', filters.section);
    if (filters.student_email) params.append('student_email', filters.student_email);

    const res = await fetch(`${BASE_URL}/assignments?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load assignments');
    }
    return res.json();
  },

  async createAssignment(formData) {
    const res = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      body: formData // Browser sets boundary header for FormData automatically
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch assignment');
    }
    return res.json();
  },

  async submitAssignment(formData) {
    const res = await fetch(`${BASE_URL}/submit`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload submission');
    }
    return res.json();
  },

  async reviewSubmission(assignmentId, studentEmail, status) {
    const res = await fetch(`${BASE_URL}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignment_id: assignmentId,
        student_email: studentEmail,
        status: status
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to review submission');
    }
    return res.json();
  },

  getPreviewUrl(folder, filename) {
    return `${BASE_URL}/files/preview/${folder}/${filename}`;
  },

  getDownloadUrl(folder, filename) {
    return `${BASE_URL}/files/download/${folder}/${filename}`;
  }
};
export default api;
