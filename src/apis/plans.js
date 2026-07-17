import http from "./http";

export const listPlans = async () => {
  const { data } = await http.get("/api/plans/all");
  return data?.plans || [];
};

export const createPlan = async (payload) => {
  const { data } = await http.post("/api/plans/add", payload);
  return data;
};

export const updatePlan = async (id, payload) => {
  const { data } = await http.put(`/api/plans/${id}`, payload);
  return data;
};

export const deletePlan = async (id) => {
  const { data } = await http.delete(`/api/plans/${id}`);
  return data;
};
