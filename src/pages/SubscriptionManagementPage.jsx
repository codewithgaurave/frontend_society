import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSyncAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../apis/subscriptions";
import { listUsers } from "../apis/users";
import Swal from "sweetalert2";

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "-";
  }
};

const emptyForm = {
  user: "",
  plan: "free",
  userType: "society member",
  status: "active",
  price: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: "",
};

export default function SubscriptionManagementPage() {
  const { themeColors } = useTheme();

  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [subsList, usersList] = await Promise.all([
        listSubscriptions(),
        listUsers()
      ]);
      setSubscriptions(subsList || []);
      setUsers(usersList || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load data.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setMode("create");
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setMode("edit");
    setEditingId(sub._id);
    setForm({
      user: sub.user?._id || sub.user,
      plan: sub.plan || "free",
      userType: sub.userType || "society member",
      status: sub.status || "active",
      price: sub.price || 0,
      startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : "",
      endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.user || !form.plan || !form.userType) {
      toast.error("User, Plan, and User Type are required.");
      return;
    }
    
    setSaving(true);
    try {
      if (mode === "create") {
        await createSubscription(form);
        toast.success("Subscription created successfully!");
      } else {
        await updateSubscription(editingId, form);
        toast.success("Subscription updated successfully!");
      }
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save subscription.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (res.isConfirmed) {
      try {
        await deleteSubscription(id);
        toast.success("Subscription deleted.");
        loadData();
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to delete.");
      }
    }
  };

  const filteredSubs = subscriptions.filter((sub) => {
    const searchLower = search.toLowerCase();
    const userName = sub.user?.fullName?.toLowerCase() || "";
    const userPhone = sub.user?.mobileNumber || "";
    
    const matchesSearch = userName.includes(searchLower) || userPhone.includes(searchLower);
    const matchesPlan = filterPlan === "all" ? true : sub.plan === filterPlan;

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6" style={{ backgroundColor: themeColors.bgSecondary, minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user plans and subscriptions</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl shadow-md transition-all font-medium text-sm hover:shadow-lg"
            style={{ backgroundColor: themeColors.primary }}
          >
            <FaPlus />
            Add Subscription
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by User Name or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all text-sm"
            style={{ focusRing: themeColors.primary }}
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all text-sm md:w-48"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
          <option value="plus">Plus</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-semibold border-b border-gray-100 text-xs">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
                      <span className="mt-2 text-sm">Loading subscriptions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 bg-gray-50/30">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{sub.user?.fullName || "Unknown"}</div>
                      <div className="text-xs text-gray-500 mt-1">{sub.user?.mobileNumber || ""}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{sub.userType}</td>
                    <td className="px-6 py-4 capitalize font-semibold" style={{ color: themeColors.primary }}>
                      {sub.plan}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        sub.status === "active" ? "bg-green-100 text-green-700" :
                        sub.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div><span className="font-medium">Start:</span> {fmtDate(sub.startDate)}</div>
                        <div className="mt-1"><span className="font-medium">End:</span> {fmtDate(sub.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {mode === "create" ? "Add New Subscription" : "Edit Subscription"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
                <select
                  name="user"
                  value={form.user}
                  onChange={handleFormChange}
                  disabled={mode === "edit"}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm"
                  style={{ focusRing: themeColors.primary }}
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.fullName} ({u.mobileNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="userType"
                    value={form.userType}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                  >
                    <option value="society member">Society Member</option>
                    <option value="society service">Society Service (Worker)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                    <option value="plus">Plus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-white rounded-xl shadow-md transition-all font-medium text-sm hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                  {saving ? "Saving..." : "Save Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
