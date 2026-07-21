// src/pages/EmployeeWiseUsersPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSpinner,
  FaUserShield,
  FaTools,
  FaArrowLeft,
} from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAllEmployees, getEmployeeOnboardingsReport } from "../apis/employees";

const EmployeeWiseUsersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEmpCode = searchParams.get("empCode") || "";

  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpCode, setSelectedEmpCode] = useState(initialEmpCode);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchOnboardings(selectedEmpCode);
  }, [selectedEmpCode]);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchOnboardings = async (code) => {
    try {
      setLoading(true);
      const data = await getEmployeeOnboardingsReport(code);
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load onboarded users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmpFilterChange = (e) => {
    const code = e.target.value;
    setSelectedEmpCode(code);
    if (code) {
      setSearchParams({ empCode: code });
    } else {
      setSearchParams({});
    }
  };

  // Filter users by search query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.mobileNumber?.toString().includes(q) ||
      u.registrationID?.toLowerCase().includes(q) ||
      u.empCode?.toLowerCase().includes(q) ||
      u.onboardedBy?.name?.toLowerCase().includes(q)
    );
  });

  // Calculate metrics
  const totalCount = filteredUsers.length;
  const membersCount = filteredUsers.filter((u) => u.role === "society member").length;
  const serviceCount = filteredUsers.filter((u) => u.role === "society service").length;

  const currentEmployeeObj = employees.find((e) => e.empCode === selectedEmpCode);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate("/employees")}
            className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 mb-2 transition-all"
          >
            <FaArrowLeft /> Back to Employee Management
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-purple-600" /> Employee-Wise Onboarded Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View users onboarded by employees using their unique Employee Codes.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Onboarded Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FaUserShield />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Society Members</p>
            <h3 className="text-2xl font-bold text-gray-800">{membersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
            <FaTools />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service Providers</p>
            <h3 className="text-2xl font-bold text-gray-800">{serviceCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Dropdown Filter by Employee */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <FaFilter className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Select Employee:
          </span>
          <select
            value={selectedEmpCode}
            onChange={handleEmpFilterChange}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          >
            <option value="">-- All Employees --</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp.empCode}>
                {emp.empCode} - {emp.name} ({emp.totalOnboarded || 0} users)
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by User Name, Mobile, Reg ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Active Filter Banner */}
      {selectedEmpCode && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FaUserTie className="text-purple-600" />
            Showing Users Onboarded by:{" "}
            <span className="font-bold">
              {currentEmployeeObj
                ? `${currentEmployeeObj.name} (${currentEmployeeObj.empCode})`
                : selectedEmpCode}
            </span>
          </div>
          <button
            onClick={() => handleEmpFilterChange({ target: { value: "" } })}
            className="text-xs underline font-semibold text-purple-700 hover:text-purple-900"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Onboarded Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaSpinner className="animate-spin text-3xl text-purple-600" />
            <p>Loading Onboarded Users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaUsers className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="font-medium text-gray-600">No onboarded users found</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedEmpCode
                ? `No registrations found for employee code ${selectedEmpCode}.`
                : "No users have registered with an employee code yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="py-4 px-6">Onboarded By</th>
                  <th className="py-4 px-6">User Info</th>
                  <th className="py-4 px-6">Reg ID</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Contact / Mobile</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6">Onboarding Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                          {user.empCode || "N/A"}
                        </span>
                        <div className="text-xs font-medium text-gray-700">
                          {user.onboardedBy?.name || "Direct / Admin"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{user.fullName}</div>
                      {user.email && (
                        <div className="text-xs text-gray-400">{user.email}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-gray-700">
                      {user.registrationID || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      {user.role === "society member" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <FaUserShield className="text-[10px]" /> Member
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <FaTools className="text-[10px]" /> Service Provider
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <FaPhoneAlt className="text-xs text-gray-400" /> {user.mobileNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600 max-w-xs truncate">
                      <div className="flex items-start gap-1">
                        <FaMapMarkerAlt className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                        <span>
                          {user.address} {user.pincode ? `(${user.pincode})` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        {user.createdAtIST ||
                          (user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeWiseUsersPage;
