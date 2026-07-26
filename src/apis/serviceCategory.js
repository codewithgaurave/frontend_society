// src/apis/serviceCategory.js
import http from "./http";

// PUBLIC: List all service categories
// GET /api/service-category
export const listServiceCategories = async () => {
  const { data } = await http.get("/api/service-category");
  return data; // could be array or { categories: [...] }
};

// ADMIN ONLY: Create category
// POST /api/service-category
// Body: { name, description }
export const createServiceCategory = async ({ name, description }) => {
  const { data } = await http.post("/api/service-category", {
    name,
    description,
  });

  // Expected: { message, category }
  return data;
};

// ADMIN ONLY: Update category by ID
// PUT /api/service-category/:categoryId
export const updateServiceCategory = async (categoryId, payload) => {
  const { data } = await http.put(`/api/service-category/${categoryId}`, payload);
  // Expected: { message, category }
  return data;
};

// ADMIN ONLY: Upload/Update category icon
// PATCH /api/service-category/:id/icon
export const updateServiceCategoryIconApi = async (categoryId, formData) => {
  const { data } = await http.patch(`/api/service-category/${categoryId}/icon`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

  const { data } = await http.delete(`/api/service-category/${categoryId}`);
  // Expected: { message }
  return data;
};
