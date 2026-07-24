import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaEdit, FaTrash, FaSyncAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { listPlans, createPlan, updatePlan, deletePlan } from "../apis/plans";

const PlanManagementPage = () => {
  const { isDarkMode } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    userType: "society service",
    price: 0,
    durationDays: 30,
    features: "",
    // Worker Limits
    maxAppliesPerMonth: 0,
    tatkalEnabled: false,
    templatesAllowed: 0,
    priorityListing: false,
    verifiedBadge: false,
    canViewDirectContact: false,
    // Member Limits
    maxNeedsPerMonth: 3,
    maxApplicationsPerNeed: 5,
    directWorkerContact: false,
    featuredNeed: false,
    isActive: true,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await listPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        displayName: plan.displayName,
        userType: plan.userType,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features.join(", "),
        // Worker Limits
        maxAppliesPerMonth: plan.limits?.maxAppliesPerMonth ?? 0,
        tatkalEnabled: plan.limits?.tatkalEnabled ?? false,
        templatesAllowed: plan.limits?.templatesAllowed ?? 0,
        priorityListing: plan.limits?.priorityListing ?? false,
        verifiedBadge: plan.limits?.verifiedBadge ?? false,
        canViewDirectContact: plan.limits?.canViewDirectContact ?? false,
        // Member Limits
        maxNeedsPerMonth: plan.limits?.maxNeedsPerMonth ?? 3,
        maxApplicationsPerNeed: plan.limits?.maxApplicationsPerNeed ?? 5,
        directWorkerContact: plan.limits?.directWorkerContact ?? false,
        featuredNeed: plan.limits?.featuredNeed ?? false,
        isActive: plan.isActive ?? true,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        displayName: "",
        userType: "society service",
        price: 0,
        durationDays: 30,
        features: "",
        maxAppliesPerMonth: 0,
        tatkalEnabled: false,
        templatesAllowed: 0,
        priorityListing: false,
        verifiedBadge: false,
        canViewDirectContact: false,
        maxNeedsPerMonth: 3,
        maxApplicationsPerNeed: 5,
        directWorkerContact: false,
        featuredNeed: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        displayName: formData.displayName,
        userType: formData.userType,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
        limits: {
          // Worker
          maxAppliesPerMonth: Number(formData.maxAppliesPerMonth),
          tatkalEnabled: formData.tatkalEnabled,
          templatesAllowed: Number(formData.templatesAllowed),
          priorityListing: formData.priorityListing,
          verifiedBadge: formData.verifiedBadge,
          canViewDirectContact: formData.canViewDirectContact,
          // Member
          maxNeedsPerMonth: Number(formData.maxNeedsPerMonth),
          maxApplicationsPerNeed: Number(formData.maxApplicationsPerNeed),
          directWorkerContact: formData.directWorkerContact,
          featuredNeed: formData.featuredNeed,
        },
        isActive: formData.isActive,
      };

      if (editingPlan) {
        await updatePlan(editingPlan._id, payload);
        toast.success("Plan updated successfully");
      } else {
        await createPlan(payload);
        toast.success("Plan created successfully");
      }
      handleCloseModal();
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan(id);
        toast.success("Plan deleted successfully");
        fetchPlans();
      } catch (err) {
        toast.error("Failed to delete plan");
      }
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <div className="flex gap-4">
          <button
            onClick={fetchPlans}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            <FaSyncAlt /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <FaPlus /> Add Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className={`rounded-xl shadow overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDarkMode ? "bg-gray-700" : "bg-gray-100"} uppercase text-sm`}>
                  <th className="p-4">Name</th>
                  <th className="p-4">User Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No plans found.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr
                      key={plan._id}
                      className={`border-b ${isDarkMode ? "border-gray-700 hover:bg-gray-750" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <td className="p-4 font-semibold">{plan.displayName} <span className="text-xs text-gray-500">({plan.name})</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${plan.userType === "society service" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>
                          {plan.userType}
                        </span>
                      </td>
                      <td className="p-4">₹{plan.price}</td>
                      <td className="p-4">{plan.durationDays} days</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${plan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleOpenModal(plan)}
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(plan._id)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <FaTrash size={18} />
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
      )}

      {/* Modal for Add / Edit Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${isDarkMode ? "bg-gray-800" : "bg-white"} p-6`}>
            <h2 className="text-2xl font-bold mb-4">{editingPlan ? "Edit Plan" : "Add New Plan"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Key Name (e.g. basic)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} ${editingPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Name (e.g. Basic Plan)</label>
                  <input
                    type="text"
                    required
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User Type</label>
                  <select
                    required
                    disabled={!!editingPlan}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"} ${editingPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  >
                    <option value="society service">Society Service (Worker)</option>
                    <option value="society member">Society Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  />
                </div>
                {formData.userType === "society member" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Needs/Month (-1 = unlim)</label>
                      <input
                        type="number"
                        required
                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                        value={formData.maxNeedsPerMonth}
                        onChange={(e) => setFormData({ ...formData, maxNeedsPerMonth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Applications per Need</label>
                      <input
                        type="number"
                        required
                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                        value={formData.maxApplicationsPerNeed}
                        onChange={(e) => setFormData({ ...formData, maxApplicationsPerNeed: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Applies/Month (0=none, -1=unlim)</label>
                      <input
                        type="number"
                        required
                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                        value={formData.maxAppliesPerMonth}
                        onChange={(e) => setFormData({ ...formData, maxAppliesPerMonth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Templates Allowed (-1 = unlim)</label>
                      <input
                        type="number"
                        required
                        className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                        value={formData.templatesAllowed}
                        onChange={(e) => setFormData({ ...formData, templatesAllowed: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
                <textarea
                  className={`w-full p-2 rounded border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
                  rows="2"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span>Is Active</span>
                </label>
                {formData.userType === "society service" ? (
                  <>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.tatkalEnabled} onChange={(e) => setFormData({ ...formData, tatkalEnabled: e.target.checked })} />
                      <span>Tatkal Enabled</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.priorityListing} onChange={(e) => setFormData({ ...formData, priorityListing: e.target.checked })} />
                      <span>Priority Listing</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.verifiedBadge} onChange={(e) => setFormData({ ...formData, verifiedBadge: e.target.checked })} />
                      <span>Verified Badge</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.canViewDirectContact} onChange={(e) => setFormData({ ...formData, canViewDirectContact: e.target.checked })} />
                      <span>View Direct Contact</span>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.directWorkerContact} onChange={(e) => setFormData({ ...formData, directWorkerContact: e.target.checked })} />
                      <span>Direct Worker Contact</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.featuredNeed} onChange={(e) => setFormData({ ...formData, featuredNeed: e.target.checked })} />
                      <span>Featured Need</span>
                    </label>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagementPage;
