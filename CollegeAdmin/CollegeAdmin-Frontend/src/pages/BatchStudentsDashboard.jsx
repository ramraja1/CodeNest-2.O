import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaTrash,
  FaUser,
} from "react-icons/fa";

export default function BatchStudentsDashboard() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const server = import.meta.env.VITE_SERVER;

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  // Fetch students of batch
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${server}/api/batches/${batchId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log(data);
        if (res.ok) setStudents(data);
        else toast.error(data.message || "Failed to load students");
      } catch {
        toast.error("Error fetching students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [batchId, server, token]);

  // Toggle selection of one student
  const toggleSelectStudent = (id) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Select/Deselect All toggle
  const toggleSelectAll = () => {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map((s) => s._id)));
  };

  // Remove selected students API call
  const removeSelectedStudents = async () => {
    if (selected.size === 0) {
      toast.info("Select students to remove");
      return;
    }
    if (!window.confirm(`Remove ${selected.size} selected students from this batch?`)) return;

    setRemoving(true);
    try {
      const res = await fetch(`${server}/api/batches/${batchId}/remove-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Students removed successfully");
        setStudents((prev) => prev.filter((s) => !selected.has(s._id)));
        setSelected(new Set());
      } else {
        toast.error(data.message || "Failed to remove students");
      }
    } catch {
      toast.error("Error removing students");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading students...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-semibold"
        >
          <FaArrowLeft />
          Back to Batch
        </button>
        <button
          onClick={removeSelectedStudents}
          disabled={removing || selected.size === 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white font-semibold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50`}
          aria-disabled={removing || selected.size === 0}
          title="Remove Selected Students"
        >
          <FaTrash />
          Remove Selected ({selected.size})
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="w-12 px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.size === students.length && students.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all students"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Roll No
              </th>
              <th className="w-32 px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-400 dark:text-gray-600">
                  No students found in this batch.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(student._id)}
                      onChange={() => toggleSelectStudent(student._id)}
                      aria-label={`Select student ${student.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FaUser className="text-gray-400 dark:text-gray-500" />
                    {student.name}
                  </td>
                  <td className="px-6 py-4">{student.email}</td>
                  <td className="px-6 py-4">{student.rollNo || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Remove ${student.name} from batch?`)) return;
                        try {
                          const res = await fetch(
                            `${server}/api/batches/${batchId}/remove-students`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ studentIds: [student._id] }),
                            }
                          );
                          const data = await res.json();
                          if (res.ok) {
                            setStudents((prev) =>
                              prev.filter((s) => s._id !== student._id)
                            );
                            setSelected((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(student._id);
                              return newSet;
                            });
                            toast.success(data.message || "Student removed");
                          } else {
                            toast.error(data.message || "Failed to remove student");
                          }
                        } catch {
                          toast.error("Error removing student");
                        }
                      }}
                      className="inline-flex items-center px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                      title={`Remove ${student.name}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
