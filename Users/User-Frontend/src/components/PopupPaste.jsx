import { useEffect, useRef } from "react";

function Popup({ message, onClose }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Focus the Okay button on mount
    if (buttonRef.current) buttonRef.current.focus();

    // Close popup on Escape key press
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center z-[9999]  bg-opacity-70 backdrop-blur-sm"
    >
      <div
        className="bg-gray-900 text-white max-w-sm w-full rounded-lg shadow-2xl p-6 text-center transform transition 
                   animate-popup-fadeIn scale-95"
      >
        <p className="text-xl font-semibold mb-4 whitespace-pre-wrap">{message}</p>
        <button
          ref={buttonRef}
          onClick={onClose}
          className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold shadow-md
                     focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 transition"
          aria-label="Dismiss notification"
        >
          Okay 👍
        </button>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes popupFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-popup-fadeIn {
          animation: popupFadeIn 220ms ease forwards;
        }
      `}</style>
    </div>
  );
}

export default Popup;
