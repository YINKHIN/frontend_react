import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStaffs, useDeleteStaff } from "../hooks/useStaffs";
import LoadingSpinner from "../components/LoadingSpinner";
import StaffModal from "../components/StaffModal";
import { formatDate, getImageUrl } from "../utils/helper";
import { config } from "../utils/config";

const StaffPage = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [list, setList] = useState([]);

  const { data: staffsResponse, isLoading, error, refetch } = useStaffs();
  const deleteStaff = useDeleteStaff();

  // Handle different API response formats
  const staffs =
    staffsResponse?.data?.data || staffsResponse?.data || staffsResponse || [];

  // Update local list only when staffsResponse changes
  useEffect(() => {
    if (Array.isArray(staffs) && staffs.length > 0) {
      setList(staffs);
    }
  }, [staffsResponse]);

  const canCreate = hasPermission(["create"]);
  const canUpdate = hasPermission(["update"]);
  const canDelete = hasPermission(["delete"]);

  const handleCreate = () => {
    setSelectedStaff(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleView = (staff) => {
    setSelectedStaff(staff);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDelete = async (staff) => {
    if (
      window.confirm(`Are you sure you want to delete "${staff.full_name}"?`)
    ) {
      try {
        // Optimistic remove
        setList(prev => prev.filter(s => s.id !== staff.id));
        await deleteStaff.mutateAsync(staff.id);
        // Background sync
        refetch();
      } catch (error) {
        console.error("Delete failed:", error);
        refetch();
      }
    }
  };

  if (isLoading && !staffsResponse) return <LoadingSpinner className="h-64" />;
  if (error) return <div className="text-red-600">Error loading staff</div>;

  const filteredStaffs = Array.isArray(list)
    ? list.filter(
        (staff) =>
          (staff.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (staff.position || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600">Manage your staff members</p>
        </div>
        {canCreate && (
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Photo</th>
                <th className="table-head">Staff</th>
                <th className="table-head">Position</th>
                <th className="table-head">Gender</th>
                <th className="table-head">Salary</th>
                <th className="table-head">Status</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffs.map((staff) => (
                <tr key={staff.id} className="table-row">
                  <td className="table-cell">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                      {staff.photo_url || staff.photo ? (
                        <img
                          src={
                            staff.photo_url ||
                            getImageUrl(staff.photo, config.base_image_url)
                          }
                          alt={staff.full_name}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => handleView(staff)}
                          onError={(e) => {
                            console.log(
                              "Staff image failed to load:",
                              e.target.src
                            );
                            e.target.style.display = "none";
                            const fallbackIcon =
                              e.target.parentNode.querySelector(
                                ".fallback-icon"
                              );
                            if (fallbackIcon) {
                              fallbackIcon.style.display = "flex";
                              fallbackIcon.classList.remove("hidden");
                            }
                          }}
                          onLoad={(e) => {
                            console.log(
                              "Staff image loaded successfully:",
                              e.target.src
                            );
                          }}
                        />
                      ) : null}
                      <UserCheck
                        className={`fallback-icon w-8 h-8 text-gray-400 ${
                          staff.photo_url || staff.photo ? "hidden" : ""
                        }`}
                      />
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">
                        {staff.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Date of Birth : {formatDate(staff.dob, "dd/MM/yyyy")}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-900">{staff.position}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-gray-900">
                      {staff.gen === "M" ? "Male" : "Female"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-gray-900">
                      ${staff.salary}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(staff)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(staff)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(staff)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaffs.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No staff found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first staff member"}
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <StaffModal
          staff={selectedStaff}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onSuccess={({ type, staff: changedStaff }) => {
            if (changedStaff) {
              setList(prev => {
                if (type === 'create') return [changedStaff, ...prev];
                if (type === 'update') return prev.map(s => s.id === changedStaff.id ? { ...s, ...changedStaff } : s);
                return prev;
              });
            }
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default StaffPage;