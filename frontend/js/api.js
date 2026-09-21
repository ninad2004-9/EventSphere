/**
 * EventSphere — Centralised API Configuration
 * All fetch calls go through apiCall() so the base URL is one place to change.
 */

// Change this to your production URL when deploying
const API_BASE = 'http://localhost:5000/api';

/**
 * Makes an authenticated API request.
 * @param {string} endpoint  - e.g. '/events' or '/auth/login'
 * @param {object} options   - fetch options (method, body, etc.)
 * @param {boolean} auth     - if true, attaches JWT Bearer token
 */
async function apiCall(endpoint, options = {}, auth = false) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (auth) {
    const token = sessionStorage.getItem('es_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw with the backend's error message
    throw { status: response.status, message: data.message || 'An error occurred.' };
  }

  return data;
}

// ── Auth helpers ───────────────────────────────────────────────────────────────
function getToken()    { return sessionStorage.getItem('es_token'); }
function getUser()     { return JSON.parse(sessionStorage.getItem('es_user') || 'null'); }
function getRole()     { return sessionStorage.getItem('es_role'); }
function isLoggedIn()  { return !!getToken(); }

function saveSession(data) {
  sessionStorage.setItem('es_token', data.token);
  sessionStorage.setItem('es_role',  data.user.role);
  sessionStorage.setItem('es_user',  JSON.stringify(data.user));
  sessionStorage.setItem('es_email', data.user.email);
  sessionStorage.setItem('es_name',  data.user.firstName + ' ' + data.user.lastName);
  sessionStorage.setItem('es_city',  data.user.city || '');
}

function clearSession() {
  sessionStorage.clear();
}
