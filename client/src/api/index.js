import { http } from "./http.js";

// Auth
export const authApi = {
  login: (email, password) => http("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => http("/api/auth/logout", { method: "POST" }),
};

// Concerts
export const concertsApi = {
  list: (params = {}) => http("/api/concerts?" + new URLSearchParams(params)),
  get: (id) => http(`/api/concerts/${id}`),
  create: (data) => http("/api/concerts", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => http(`/api/concerts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => http(`/api/concerts/${id}`, { method: "DELETE" }),
};

// Organizers
export const organizersApi = {
  list: () => http("/api/organizers"),
};

// Venues
export const venuesApi = {
  list: () => http("/api/venues"),
  get: (id) => http(`/api/venues/${id}`),
  create: (data) => http("/api/venues", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => http(`/api/venues/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Sessions
export const sessionsApi = {
  list: (params = {}) => http("/api/sessions?" + new URLSearchParams(params)),
  create: (data) => http("/api/sessions", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => http(`/api/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => http(`/api/sessions/${id}`, { method: "DELETE" }),
};

// Seatmaps
export const seatmapsApi = {
  get: (id) => http(`/api/seatmaps/${id}`),
  update: (id, data) => http(`/api/seatmaps/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Bookings
export const bookingsApi = {
  list: (params = {}) => http("/api/bookings?" + new URLSearchParams(params)),
  get: (id) => http(`/api/bookings/${id}`),
  create: (data) => http("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
  confirm: (id) => http(`/api/bookings/${id}/confirm`, { method: "PATCH" }),
  cancel: (id) => http(`/api/bookings/${id}/cancel`, { method: "PATCH" }),
  delete: (id) => http(`/api/bookings/${id}`, { method: "DELETE" }),
};

// Public booking (no auth required)
export const publicApi = {
  getConcerts: (params = {}) => http("/api/concerts?" + new URLSearchParams(params)),
  getConcert: (id) => http(`/api/concerts/${id}`),
  getSeats: (session_id) => http(`/api/seats?session_id=${session_id}`),
  createBooking: (data) => http("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
  confirmBooking: (id) => http(`/api/bookings/${id}/confirm`, { method: "PATCH" }),
};

// Customer auth
export const customerApi = {
  login: (email, phone) => http("/api/customers/login", { method: "POST", body: JSON.stringify({ email, phone }) }),
  myBookings: () => http("/api/customers/me/bookings"),
};

// Payments
export const paymentsApi = {
  list: (params = {}) => http("/api/payments?" + new URLSearchParams(params)),
  get: (id) => http(`/api/payments/${id}`),
  create: (data) => http("/api/payments", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id, status) => http(`/api/payments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// Customers
export const customersApi = {
  list: (params = {}) => http("/api/customers?" + new URLSearchParams(params)),
  get: (id) => http(`/api/customers/${id}`),
};

// Reports
export const reportsApi = {
  summary: () => http("/api/reports/summary"),
  revenue: (params = {}) => http("/api/reports/revenue?" + new URLSearchParams(params)),
  bookings: (params = {}) => http("/api/reports/bookings?" + new URLSearchParams(params)),
};
