import { useState, useRef, useEffect } from "react";
import CodeEditor from "./CodeEditor";

export default function EnhancedEditorOutputPanel({
  activeProblem,
  code,
  language,
  darkMode,
  output,
  error,
  isRunning,
  handleEditorChange,
  handleRun,
  handleSubmit,
  fullEditor,
  setFullEditor,
}) {
  const [outputHeight, setOutputHeight] = useState(180);
  const [dragging, setDragging] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newHeight = rect.bottom - e.clientY;
      const minHeight = 80;
      const maxHeight = rect.height * 0.8;
      if (newHeight > minHeight && newHeight < maxHeight) {
        setOutputHeight(newHeight);
      }
    }
    function onMouseUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const showOutput = output || error || isRunning;

  // Parse output into test case objects if possible
  // Expected format:
  // Test Case #1:
  // Input:
  // ...
  // Expected Output:
  // ...
  // Your Output:
  // ...
  // Verdict: Accepted / Wrong Answer / ...
  // [Error Info:]
  // ...
  //
  // -------------------------
  function parseTestCases(text) {
    if (!text) return [];
    // Split on lines with one or more dashes and optional newline
    const cases = text
      .split(/-+\n*/)
      .map((block) => block.trim())
      .filter(Boolean);
    return cases.map((block) => {
      return {
        raw: block,
        input:
          /Input:\n([\s\S]*?)\nExpected Output:/i.exec(block)?.[1]?.trim() ||
          "",
        expected:
          /Expected Output:\n([\s\S]*?)\nYour Output:/i
            .exec(block)?.[1]
            ?.trim() || "",
        output:
          /Your Output:\n([\s\S]*?)\nVerdict:/i.exec(block)?.[1]?.trim() || "",
        verdict: /Verdict:\s*(.+)/i.exec(block)?.[1]?.trim() || "",
        errorInfo: /Error Info:\n([\s\S]*)/i.exec(block)?.[1]?.trim() || "",
      };
    });
  }

  const testCases = parseTestCases(output);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col flex-1 min-w-0 h-full p-2 overflow-hidden ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
      style={{ transition: "background 0.3s" }}
    >
      {/* Code Editor */}
      <div
        className="w-full transition-all duration-300"
        style={{
          height: showOutput ? `calc(100% - ${outputHeight + 8}px)` : "100%",
        }}
      >
        <CodeEditor
          language={language}
          theme={darkMode ? "dark" : "light"}
          value={code[activeProblem._id] || ""}
          onChange={handleEditorChange}
          onRun={handleRun}
          onSubmit={handleSubmit}
          fullEditor={fullEditor}
          setFullEditor={setFullEditor}
          allowFullscreen={true}
        />
      </div>

      {/* Drag Handle */}
      {showOutput && (
        <div
          onMouseDown={() => setDragging(true)}
          className="h-2 bg-gray-600 cursor-row-resize hover:bg-emerald-400 transition-colors"
          title="Drag to resize output panel"
          style={{ userSelect: "none" }}
        />
      )}

      {/* Output / Errors */}
      {showOutput && (
        <div
          className="bg-gray-800 rounded-b p-3 overflow-auto text-sm text-white"
          style={{ height: outputHeight, minHeight: 80 }}
        >
          <h3 className="font-semibold mb-2">Output / Errors:</h3>

          {isRunning ? (
            <p>Running...</p>
          ) : error ? (
            <pre className="whitespace-pre-wrap text-red-400">{error}</pre>
          ) : testCases.length > 0 ? (
            <div className="space-y-2 max-h-full overflow-auto">
              {testCases
                .filter(
                  (tc) =>
                    tc.input &&
                    tc.input.trim() !== "" &&
                    tc.expected &&
                    tc.expected.trim() !== ""
                )
                .map((tc, idx) => (
                  <div
                    key={idx}
                    className={`border rounded p-2 cursor-pointer select-none flex flex-col ${
                      tc.verdict.toLowerCase() === "accepted"
                        ? "border-green-500 bg-green-900"
                        : "border-red-500 bg-red-900"
                    }`}
                    onClick={() =>
                      setExpandedIndex(expandedIndex === idx ? null : idx)
                    }
                    title={`Click to ${
                      expandedIndex === idx ? "collapse" : "expand"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Test Case #{idx + 1}:{" "}
                        <span
                          className={`font-semibold ${
                            tc.verdict.toLowerCase() === "accepted"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {tc.verdict}
                        </span>
                      </span>
                      <span className="text-xs opacity-70">
                        {tc.errorInfo ? "Error" : ""}
                      </span>
                    </div>
                    {expandedIndex === idx && (
                      <div className="mt-2 text-xs whitespace-pre-wrap bg-gray-900 rounded p-2">
                        <strong>Input:</strong>
                        <pre>{tc.input}</pre>
                        <strong>Expected Output:</strong>
                        <pre>{tc.expected}</pre>
                        <strong>Your Output:</strong>
                        <pre>{tc.output}</pre>
                        {tc.errorInfo && (
                          <>
                            <strong>Error Info:</strong>
                            <pre className="text-red-400">{tc.errorInfo}</pre>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-green-300">{output}</pre>
          )}
        </div>
      )}
    </div>
  );
}
