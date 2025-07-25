// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hackzen.onrender.com' 
  : 'http://localhost:3000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...apiConfig.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}/api${endpoint}`;
}; 

// Upload PPTX file to backend (Cloudinary)
export async function uploadPPTFile(file) {
  const url = buildApiUrl("/uploads/ppt");
  const formData = new FormData();
  formData.append("ppt", file);
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to upload PPT file");
  }
  return response.json();
} 

// Save PPT submission for a round
export async function savePPTSubmission({ hackathonId, roundIndex, pptFile, problemStatement, originalName }) {
  const url = buildApiUrl("/submission-form/ppt");
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ hackathonId, roundIndex, pptFile, problemStatement, originalName }),
  });
  if (!response.ok) {
    throw new Error((await response.json()).error || 'Failed to save PPT submission');
  }
  return response.json();
}

// Fetch user's PPT submissions for a hackathon
export async function fetchUserPPTSubmissions(hackathonId, userId) {
  const url = buildApiUrl(`/submission-form/submissions?hackathonId=${hackathonId}&userId=${userId}`);
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch submissions');
  const data = await response.json();
  // Only return submissions with pptFile and roundIndex
  return (data.submissions || []).filter(s => s.pptFile && typeof s.roundIndex === 'number');
} 

// Delete PPT submission for a round
export async function deletePPTSubmission({ hackathonId, roundIndex }) {
  const url = buildApiUrl("/submission-form/ppt/delete");
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ hackathonId, roundIndex }),
  });
  if (!response.ok) {
    throw new Error((await response.json()).error || 'Failed to delete PPT submission');
  }
  return response.json();
}

// Fetch participants for a hackathon (organizer view)
export async function fetchHackathonParticipants(hackathonId) {
  const url = buildApiUrl(`/registration/hackathon/${hackathonId}/participants`);
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch participants');
  return response.json();
} 