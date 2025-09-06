import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { useParams, Link } from "react-router-dom";

function ConfirmationModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2
          id="confirm-modal-title"
          className="text-xl font-semibold text-gray-900 mb-4 select-none"
        >
          Confirm Action
        </h2>
        <p className="text-gray-700 mb-8">{message}</p>
        <div className="flex justify-center gap-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-4 focus:ring-red-500 transition"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalWrapper({ children, onClose, title, saving }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden">
        <h2
          id="modal-title"
          className="text-2xl font-bold text-gray-900 mb-6 select-none"
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          disabled={saving}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition focus:outline-none"
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        {...props}
        className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition shadow-sm"
      />
    </label>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <textarea
        {...props}
        className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition shadow-sm resize-none"
      />
    </label>
  );
}

function FileInputField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        {...props}
        type="file"
        className="mt-2 block w-full cursor-pointer"
      />
    </label>
  );
}

function ModalButtons({ saving, onCancel, submitText }) {
  return (
    <div className="flex justify-end gap-6 pt-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-400 transition shadow-md"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500 transition shadow-md flex items-center justify-center"
      >
        {saving ? "Saving..." : submitText}
      </button>
    </div>
  );
}

function AddResourceModal({ batchId, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  async function handleSubmit(e) {
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

      const res = await fetch(`${server}/api/batches/${batchId}/AddResources`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add resource");
      }

      toast.success("Resource added successfully!");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper onClose={onClose} title="Add Resource" saving={saving}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <TextAreaField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <FileInputField
          label="Upload File"
          onChange={(e) => setFile(e.target.files?.[0])}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif"
        />
        <ModalButtons saving={saving} onCancel={onClose} submitText="Add" />
      </form>
    </ModalWrapper>
  );
}

function EditResourceModal({ resource, onClose, onSaved }) {
  const [title, setTitle] = useState(resource.title || "");
  const [description, setDescription] = useState(resource.description || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  async function handleSubmit(e) {
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

      const res = await fetch(`${server}/api/batches/${resource.id}/EditResource`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update resource");
      }

      toast.success("Resource updated successfully!");
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper onClose={onClose} title="Edit Resource" saving={saving}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <TextAreaField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <FileInputField
          label="Upload File"
          onChange={(e) => setFile(e.target.files?.[0])}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif"
        />
        <ModalButtons saving={saving} onCancel={onClose} submitText="Update" />
      </form>
    </ModalWrapper>
  );
}

export default function ManageResourcesDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editResource, setEditResource] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;
  const { batchId } = useParams();

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

  function openDeleteConfirm(id) {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      const res = await fetch(`${server}/api/batches/${deleteId}/DelResource`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Resource deleted");
      setResources((prev) => prev.filter((r) => r._id !== deleteId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  }

  function openEditResource(resource) {
    setEditResource(resource);
    setShowEditModal(true);
  }

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 font-sans text-gray-900">
      <div className="flex items-center justify-between">
        <Link
          to={`/manage-batches/${batchId}`}
          className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-semibold transition"
          aria-label="Back to Manage Batches"
        >
          <FaArrowLeft size={18} />
          Back to Batches
        </Link>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-3 bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-400 text-white px-6 py-3 rounded-lg shadow-lg transition"
          aria-label="Add New Resource"
        >
          <FaPlus size={18} /> Add Resource
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-lg">Loading resources...</p>
      ) : error ? (
        <p className="text-red-600 font-semibold">Error: {error}</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500 text-lg italic select-none">No resources found. Add some!</p>
      ) : (
        <ul className="space-y-8">
          {resources.map(({ _id, title, description, fileUrl }) => (
            <li
              key={_id}
              className="flex flex-col sm:flex-row justify-between p-6 border border-gray-200 rounded-3xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start gap-7 flex-grow min-w-0">
                <FaFileAlt className="text-indigo-700 text-4xl mt-1 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold leading-tight truncate">{title}</h2>
                  {description && (
                    <p className="text-gray-700 text-base line-clamp-3 mt-2 select-text">{description}</p>
                  )}
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-sm mt-3 inline-block font-medium"
                    >
                      View File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6 mt-6 sm:mt-0 sm:ml-6">
                <button
                  onClick={() => openEditResource({ id: _id, title, description, fileUrl })}
                  className="text-indigo-700 hover:text-indigo-900 rounded-full p-4 hover:bg-indigo-100 transition shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label={`Edit resource ${title}`}
                >
                  <FaEdit size={20} />
                </button>
                <button
                  onClick={() => openDeleteConfirm(_id)}
                  className="text-red-700 hover:text-red-900 rounded-full p-4 hover:bg-red-100 transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label={`Delete resource ${title}`}
                >
                  <FaTrash size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAddModal && (
        <AddResourceModal
          batchId={batchId}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            fetchResources();
          }}
        />
      )}

      {showEditModal && editResource && (
        <EditResourceModal
          resource={editResource}
          onClose={() => {
            setShowEditModal(false);
            setEditResource(null);
          }}
          onSaved={() => {
            setShowEditModal(false);
            setEditResource(null);
            fetchResources();
          }}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this resource?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
