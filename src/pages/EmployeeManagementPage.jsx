// src/pages/EmployeeManagementPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaUserTie,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaIdCard,
  FaPhoneAlt,
  FaEnvelope,
  FaSpinner,
  FaEye,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../apis/employees";

const EmployeeManagementPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    designation: "Sales Executive",
    empCode: "",
    isActive: true,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({
        name: emp.name || "",
        mobileNumber: emp.mobileNumber || "",
        email: emp.email || "",
        designation: emp.designation || "Sales Executive",
        empCode: emp.empCode || "",
        isActive: emp.isActive !== false,
      });
    } else {
      setEditingEmp(null);
      setFormData({
        name: "",
        mobileNumber: "",
        email: "",
        designation: "Sales Executive",
        empCode: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmp(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobileNumber.trim()) {
      toast.error("Name and Mobile Number are required");
      return;
    }

    try {
      setSubmitting(true);
      if (editingEmp) {
        await updateEmployee(editingEmp._id, formData);
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(formData);
        toast.success("Employee created successfully!");
      }
      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save employee";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (emp) => {
    if (
      !window.confirm(
        `Are you sure you want to delete employee "${emp.name}" (${emp.empCode})?`
      )
    ) {
      return;
    }

    try {
      await deleteEmployee(emp._id);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete employee");
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.empCode?.toLowerCase().includes(q) ||
      emp.mobileNumber?.includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.isActive !== false).length;
  const totalOnboardings = employees.reduce(
    (sum, e) => sum + (e.totalOnboarded || 0),
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserTie className="text-blue-600" /> Employee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create employees, assign unique Employee Codes, and track their user onboardings.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow transition-all"
        >
          <FaPlus /> Add New Employee
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FaUserTie />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEmployees}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Staff</p>
            <h3 className="text-2xl font-bold text-gray-800">{activeEmployees}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Onboarded Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalOnboardings}</h3>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Employee Name, Code, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={() => navigate("/employee-onboardings")}
          className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
        >
          View Employee Wise Users <FaArrowRight />
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaSpinner className="animate-spin text-3xl text-blue-600" />
            <p>Loading Employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaUserTie className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="font-medium text-gray-600">No employees found</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "+ Add New Employee" to add your first employee.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="py-4 px-6">Emp Code</th>
                  <th className="py-4 px-6">Employee Info</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Onboardings</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">
                      <span className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                        {emp.empCode}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-400">
                        Added: {emp.createdAtIST || new Date(emp.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      {emp.designation || "Sales Executive"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <FaPhoneAlt className="text-xs text-gray-400" /> {emp.mobileNumber}
                      </div>
                      {emp.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <FaEnvelope className="text-xs text-gray-400" /> {emp.email}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => navigate(`/employee-onboardings?empCode=${emp.empCode}`)}
                        className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-lg border border-purple-200 text-xs transition-all"
                      >
                        <FaUsers className="text-sm" />
                        {emp.totalOnboarded || 0} Users
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      {emp.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FaCheckCircle className="text-[10px]" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <FaTimesCircle className="text-[10px]" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/employee-onboardings?empCode=${emp.empCode}`)}
                          title="View Onboarded Users"
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleOpenModal(emp)}
                          title="Edit Employee"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          title="Delete Employee"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <FaUserTie className="text-blue-600" />
              {editingEmp ? "Edit Employee" : "Create New Employee"}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Enter employee details. You can specify a custom Employee Code or leave empty for auto-generation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Employee Code (Emp Code)
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="e.g. EMP001 (Auto-generated if empty)"
                    value={formData.empCode}
                    onChange={(e) =>
                      setFormData({ ...formData, empCode: e.target.value.toUpperCase() })
                    }
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value })
                    }
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales Executive, Field Agent"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-gray-700">
                  Employee Active Status
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  {editingEmp ? "Update Employee" : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
