import http from "./http";

export const listSubscriptions = async () => {
  const { data } = await http.get("/api/subscriptions/all");
  return data?.subscriptions || [];
};

export const createSubscription = async (payload) => {
  const { data } = await http.post("/api/subscriptions/add", payload);
  return data;
};

export const updateSubscription = async (id, payload) => {
  const { data } = await http.put(`/api/subscriptions/${id}`, payload);
  return data;
};

export const deleteSubscription = async (id) => {
  const { data } = await http.delete(`/api/subscriptions/${id}`);
  return data;
};
