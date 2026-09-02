const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
      if (window.location.hash !== '#login' && !endpoint.includes('/auth/login')) {
        setTimeout(() => { window.location.reload(); }, 1500);
      }
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// Auth
export async function registerUser(name, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function loginUser(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function updateUserProfile(profileData) {
  const user = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  setUser(user);
  return user;
}

export function logoutUser() {
  clearAuth();
}

export function isLoggedIn() {
  return !!getToken();
}

export { getUser, setUser };

// Expenses
export async function getExpenses() {
  return request('/expenses');
}

export async function createExpense(expense) {
  return request('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });
}

export async function updateExpense(id, expense) {
  return request(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
  });
}

export async function deleteExpense(id) {
  return request(`/expenses/${id}`, {
    method: 'DELETE',
  });
}
