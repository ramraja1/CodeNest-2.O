import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ManageResourcesDashboard({ batchId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editResource, setEditResource] = useState(null);
  const token = localStorage.getItem("token");
  const server = `${import.meta.env.VITE_SERVER}`;

  useEffect(() => {
    fetchResources();
  }, [batchId]);

  async function fetchResources() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${server}/api/batches/${batchId}/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load resources");
      setResources(data.resources || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`${server}/api/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Resource deleted");
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenEdit = (resource = null) => {
    setEditResource(resource);
    setShowAddEditModal(true);
  };

  const handleCloseModal = () => {
    setEditResource(null);
    setShowAddEditModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Resources</h1>
        <button
          onClick={() => handleOpenEdit()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
          aria-label="Add New Resource"
        >
          <FaPlus /> Add Resource
        </button>
      </header>

      {loading ? (
        <p className="text-gray-600">Loading resources...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500">No resources found. Add some!</p>
      ) : (
        <ul className="space-y-4">
          {resources.map(({ id, title, description, fileUrl }) => (
            <li
              key={id}
              className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <FaFileAlt className="text-indigo-600 text-2xl" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {description && (
                    <p className="text-gray-600 text-sm line-clamp-2 max-w-lg">{description}</p>
                  )}
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:underline text-sm"
                    >
                      View File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleOpenEdit({ id, title, description, fileUrl })}
                  className="text-indigo-600 hover:text-indigo-800"
                  aria-label={`Edit resource ${title}`}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Delete resource ${title}`}
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAddEditModal && (
        <AddEditResourceModal
          batchId={batchId}
          resource={editResource}
          onClose={handleCloseModal}
          onSaved={() => {
            handleCloseModal();
            fetchResources();
          }}
        />
      )}
    </div>
  );
}

// --- Modal component for adding or editing a resource ---

function AddEditResourceModal({ batchId, resource, onClose, onSaved }) {
  const [title, setTitle] = useState(resource?.title || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");
  const server = `${import.meta.env.VITE_SERVER}`;

  const isEdit = Boolean(resource?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("file", file);

      const url = isEdit
        ? `${server}/api/resources/${resource.id}`
        : `${server}/api/batches/${batchId}/resources`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save resource");
      }

      toast.success(`Resource ${isEdit ? "updated" : "added"} successfully!`);
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <h2 id="resource-modal-title" className="text-xl font-bold">
          {isEdit ? "Edit" : "Add"} Resource
        </h2>

        <label className="block">
          <span className="text-sm font-semibold">Title</span>
          <input
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Description</span>
          <textarea
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Upload File</span>
          <input
            type="file"
            className="mt-1 block w-full"
            onChange={(e) => setFile(e.target.files?.[0])}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif"
          />
        </label>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={saving}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
