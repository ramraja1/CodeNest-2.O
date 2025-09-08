import React, { useEffect, useState } from "react";
import { FaFileAlt, FaEye } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import PdfViewerModal from "../../components/PdfViewerModal";

export default function BatchResources() {
  const { batch } = useOutletContext();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const server = import.meta.env.VITE_SERVER;
  const [showPdf, setShowPdf] = useState(null);

  useEffect(() => {
    if (!batch?._id) return;
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${server}/api/batches/${batch._id}/resources`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const data = await response.json();
        setResources(data.resources || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [batch?._id]);

  if (loading) {
    return <p>Loading resources...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
        <FaFileAlt className="text-emerald-600" /> Resources
      </h2>
      {resources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((r) => (
            <div
              key={r._id}
              className="bg-white shadow-xl rounded-3xl border border-gray-100 p-7 flex flex-col h-full transition hover:shadow-emerald-300 group"
            >
              <div className="flex items-center gap-5 mb-5">
                <FaFileAlt className="text-emerald-400 text-4xl drop-shadow" />
                <div>
                  <div className="font-bold text-lg md:text-xl text-gray-900 truncate" title={r.title}>
                    {r.title}
                  </div>
                  {r.description && (
                    <div className="text-gray-400 text-sm mt-1 line-clamp-2" title={r.description}>
                      {r.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-auto flex">
                {r.fileUrl && (
                  <button
                    onClick={() => setShowPdf(r.fileUrl)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 transition"
                    title="View"
                    style={{ minWidth: 110 }}
                  >
                    <FaEye /> View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mt-6 italic text-lg">No resources available yet.</p>
      )}

      {showPdf && (
        <PdfViewerModal fileUrl={showPdf} onClose={() => setShowPdf(null)} />
      )}

      {/* Minor SaaS-touch scrollbar and fade in */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        .group:hover .drop-shadow { filter: drop-shadow(0 0 8px #6ee7b7); }
      `}</style>
    </div>
  );
}
