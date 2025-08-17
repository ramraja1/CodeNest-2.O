import React, { useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
  PlayIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";

// Popup Modal Component
function Popup({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50">
      <div className="bg-gray-900 text-white px-8 py-6 rounded-lg shadow-xl max-w-sm text-center">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white font-medium"
        >
          Okay 👍
        </button>
      </div>
    </div>
  );
}

export default function CodeEditor({
  language = "cpp",
  theme = "dark",
  value = "",
  onChange,
  onRun,
  onSubmit,
  allowFullscreen = true,
  fullEditor,
  setFullEditor,
}) {
  const editorRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState("");

  // Show Popup Modal
  const showPopup = (msg) => {
    setPopupMessage(msg);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Disable Ctrl+V paste
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      showPopup("🚫 Great coder, don’t cheat!");
    });

    // Disable native paste as well
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener("paste", (e) => {
        e.preventDefault();
        showPopup("🚫 Great coder, don’t cheat!");
      });
    }
  };

  return (
    <section
      className={`flex flex-col bg-gray-800 w-full ${
        fullEditor
          ? "fixed inset-0 z-50 p-2 w-full"
          : "w-full min-w-[360px] p-2 border-l border-gray-700"
      } rounded-md shadow-lg h-full`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-2">
        <label className="text-sm text-white font-semibold">Language:</label>
        <select
          value={language}
          onChange={(e) => onChange("language", e.target.value)}
          className="bg-gray-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>

        {allowFullscreen && (
          <button
            onClick={() => setFullEditor && setFullEditor(!fullEditor)}
            className="ml-auto p-2 rounded hover:bg-gray-700 text-white transition"
            aria-label="Toggle fullscreen editor"
          >
            {fullEditor ? (
              <ArrowsPointingInIcon className="h-6 w-6" />
            ) : (
              <ArrowsPointingOutIcon className="h-6 w-6" />
            )}
          </button>
        )}

        {fullEditor && (
          <button
            onClick={() => setFullEditor(false)}
            className="ml-2 p-2 rounded hover:bg-gray-700 text-white transition"
            aria-label="Exit fullscreen editor"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 w-full rounded overflow-hidden border-2 border-gray-700">
        <MonacoEditor
          height="100%"
          width="100%"
          language={language}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={value}
          onChange={(val) => onChange("code", val)}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            contextmenu: false,
            smoothScrolling: true,
            padding: { top: 6, bottom: 6 },
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-semibold text-white"
          onClick={onRun}
        >
          <PlayIcon className="h-5 w-5" /> Run
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 py-2 rounded font-semibold text-white"
          onClick={onSubmit}
        >
          <RocketLaunchIcon className="h-5 w-5" /> Submit
        </button>
      </div>

      {/* Popup modal */}
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage("")} />}
    </section>
  );
}
