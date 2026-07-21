// src/apis/employees.js
import http from "./http";

export const getAllEmployees = async () => {
  const { data } = await http.get("/api/employees");
  return data?.data || [];
};

export const getEmployeeById = async (id) => {
  const { data } = await http.get(`/api/employees/${id}`);
  return data?.data;
};

export const createEmployee = async (payload) => {
  const { data } = await http.post("/api/employees", payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await http.put(`/api/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await http.delete(`/api/employees/${id}`);
  return data;
};

export const verifyEmpCode = async (code) => {
  const { data } = await http.get(`/api/employees/verify/${code}`);
  return data;
};

export const getEmployeeOnboardingsReport = async (empCode = "") => {
  const { data } = await http.get(`/api/employees/onboardings/report${empCode ? `?empCode=${empCode}` : ""}`);
  return data?.data || [];
};
