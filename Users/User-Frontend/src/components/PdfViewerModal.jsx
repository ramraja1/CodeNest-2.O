import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { FaTimes } from "react-icons/fa";

export default function PdfViewerModal({ fileUrl, onClose }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="PDF Viewer"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ transition: "background 0.2s" }}
    >
      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden border border-gray-200 animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >

        {/* Floating Close Button - OUTSIDE PDF Viewer Toolbar */}
        <button
          onClick={onClose}
          className="absolute -top-5 -right-5 md:top-4 md:right-4 bg-white border border-gray-200 hover:bg-emerald-100 text-gray-800 p-2 rounded-full text-xl shadow-lg z-20 transition-all"
          aria-label="Close PDF Viewer"
          type="button"
          style={{
            boxShadow: "0 6px 24px 0 rgba(34,197,94,0.12), 0 1.5px 6px 0 rgba(0,0,0,0.08)"
          }}
        >
          <FaTimes />
        </button>

        {/* PDF Viewer */}
        <div className="flex-1 min-h-0 overflow-auto hide-native-scrollbar pdf-modal-scroll">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="w-full h-full">
              <Viewer
                fileUrl={fileUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </div>
          </Worker>
        </div>
      </div>

      {/* Styles for animation and scrollbar */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.20s cubic-bezier(.57,.21,.69,1.25); }
        @keyframes fadeIn { from { opacity:0; transform:scale(.98);} to { opacity:1; transform:scale(1);} }
        .pdf-modal-scroll { scrollbar-width: thin; scrollbar-color: #6ee7b7 #f1f5f9; }
        .pdf-modal-scroll::-webkit-scrollbar { width: 8px; }
        .pdf-modal-scroll::-webkit-scrollbar-thumb { background: #6ee7b7; border-radius: 8px; }
        .pdf-modal-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .hide-native-scrollbar::-webkit-scrollbar { background: transparent; width: 8px; }
      `}</style>
    </div>
  );
}
