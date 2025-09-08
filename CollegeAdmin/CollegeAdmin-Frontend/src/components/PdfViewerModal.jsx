// PdfViewerModal.jsx
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PdfViewerModal({ fileUrl, onClose }) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-lg relative max-w-3xl w-full h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-lg"
          aria-label="Close PDF"
        >×</button>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="flex-1">
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
}
