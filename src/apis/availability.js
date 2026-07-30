// src/apis/availability.js
import http from "./http";

// ADMIN / PUBLIC: Get all availability
// GET /api/availability
export const listAvailability = async () => {
  const { data } = await http.get("/api/availability");
  if (Array.isArray(data)) return data;
  return data?.availability || [];
};

// ADMIN ONLY: Toggle worker availability
// PATCH /api/availability/admin/toggle/:userId
export const toggleUserAvailabilityApi = async (userId, isAvailable) => {
  const { data } = await http.patch(`/api/availability/admin/toggle/${userId}`, { isAvailable });
  return data;
};
