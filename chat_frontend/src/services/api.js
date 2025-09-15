// import axios from "axios";

// const API_URL =
//   (import.meta.env.VITE_API_URL || "http://localhost:4000") + "/api/v1";

// const instance = axios.create({ baseURL: API_URL });

// function setToken(token) {
//   if (token)
//     instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//   else delete instance.defaults.headers.common["Authorization"];
// }

// export default {
//   instance,
//   setToken,
//   // auth
//   register: (data) => instance.post("/auth/register", data).then((r) => r.data),
//   login: (data) => instance.post("/auth/login", data).then((r) => r.data),
//   // users
//   getUsers: () => instance.get("/users").then((r) => r.data),
//   getUser: (id) => instance.get(`/users/${id}`).then((r) => r.data),
//   // requests
//   sendRequest: (toUserId) =>
//     instance.post("/requests", { toUserId }).then((r) => r.data),
//   getRequests: (incoming = true) =>
//     instance.get(`/requests?incoming=${incoming}`).then((r) => r.data),
//   respondRequest: (id, action) =>
//     instance.post(`/requests/${id}/respond`, { action }).then((r) => r.data),
//   // rooms/messages
//   getRooms: () => instance.get("/rooms").then((r) => r.data),
//   getMessages: (roomId, limit = 50) =>
//     instance
//       .get(`/rooms/${roomId}/messages?limit=${limit}`)
//       .then((r) => r.data),
//   postMessageHttp: (roomId, text) =>
//     instance.post(`/rooms/${roomId}/messages`, { text }).then((r) => r.data),
//   createTierRequest: (roomId, requestedTier) =>
//     instance
//       .post(`/rooms/${roomId}/tier-request`, { requestedTier })
//       .then((r) => r.data),
//   respondTierRequest: (roomId, requestId, approve) =>
//     instance
//       .post(`/rooms/${roomId}/tier-respond`, { requestId, approve })
//       .then((r) => r.data),
//   // new endpoints
//   getTierRequests: (roomId) =>
//     instance.get(`/rooms/${roomId}/tier-requests`).then((r) => r.data),
//   getMe: () => instance.get("/users/me").then((r) => r.data),
//   updateMe: (payload) =>
//     instance.patch("/users/me", payload).then((r) => r.data),
// };

import axios from "axios";

// Normalize base URL (trim trailing slashes)
const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const BASE = RAW_BASE.replace(/\/+$/, ""); // remove trailing slashes
const API_URL = `${BASE}/api/v1`;

const instance = axios.create({ baseURL: API_URL });

function setToken(token) {
  if (token)
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete instance.defaults.headers.common["Authorization"];
}

// Export service
export default {
  instance,
  setToken,
  // auth
  register: (data) => instance.post("/auth/register", data).then((r) => r.data),
  login: (data) => instance.post("/auth/login", data).then((r) => r.data),
  // users
  getUsers: () => instance.get("/users").then((r) => r.data),
  getUser: (id) => instance.get(`/users/${id}`).then((r) => r.data),
  getMe: () => instance.get("/users/me").then((r) => r.data),
  updateMe: (payload) =>
    instance.patch("/users/me", payload).then((r) => r.data),
  // requests
  sendRequest: (toUserId) =>
    instance.post("/requests", { toUserId }).then((r) => r.data),
  getRequests: (incoming = true) =>
    instance.get(`/requests?incoming=${incoming}`).then((r) => r.data),
  respondRequest: (id, action) =>
    instance.post(`/requests/${id}/respond`, { action }).then((r) => r.data),
  // rooms/messages
  getRooms: () => instance.get("/rooms").then((r) => r.data),
  getMessages: (roomId, limit = 50) =>
    instance
      .get(`/rooms/${roomId}/messages?limit=${limit}`)
      .then((r) => r.data),
  postMessageHttp: (roomId, text) =>
    instance.post(`/rooms/${roomId}/messages`, { text }).then((r) => r.data),
  createTierRequest: (roomId, requestedTier) =>
    instance
      .post(`/rooms/${roomId}/tier-request`, { requestedTier })
      .then((r) => r.data),
  getTierRequests: (roomId) =>
    instance.get(`/rooms/${roomId}/tier-requests`).then((r) => r.data),
  respondTierRequest: (roomId, requestId, approve) =>
    instance
      .post(`/rooms/${roomId}/tier-respond`, { requestId, approve })
      .then((r) => r.data),
};
