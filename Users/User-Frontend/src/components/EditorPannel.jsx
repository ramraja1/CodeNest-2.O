import { SparklesIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import CodeEditor from "./CodeEditor";
import NinjaAIChat from "./NinjaAIChat";

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
  const [showNinjaAIButton, setShowNinjaAIButton] = useState(false);
  const [showNinjaAIChat, setShowNinjaAIChat] = useState(false);
  const [failingTestCase, setFailingTestCase] = useState(null);
  const [initialAIQuery, setInitialAIQuery] = useState(null);
  const containerRef = useRef(null);

  const server = import.meta.env.VITE_SERVER;

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

  // Detect failing test cases and set initial AI query
  useEffect(() => {
    let failureFound = false;
    let query = null;
    let failingCase = null;

    if (output && !isRunning && !error) {
      const testCases = parseTestCases(output);
      const firstFailure = testCases.find(
        (tc) =>
          (tc.verdict && tc.verdict.toLowerCase().includes("wrong")) ||
          tc.verdict.toLowerCase().includes("error") ||
          tc.verdict.toLowerCase().includes("fail")
      );

      if (firstFailure) {
        failureFound = true;
        failingCase = firstFailure;
        query = `I'm seeing a "${firstFailure.verdict}" on a test case. Can you help me debug this failure?`;
      }
    } else if (error) {
      failureFound = true;
      failingCase = {
        verdict: "Error",
        errorInfo: error,
        theme: "Compilation/Runtime Error",
      };
      query =
        "I'm encountering a compilation/runtime error. Please analyze the code and the error message to suggest a fix.";
    }

    setShowNinjaAIButton(failureFound);
    setFailingTestCase(failingCase);
    setInitialAIQuery(query);

    if (!output && !error) {
      setShowNinjaAIChat(false);
      setInitialAIQuery(null);
    }
  }, [output, error, isRunning]);

  const showOutput = output || error || isRunning;

  function parseTestCases(text) {
    if (!text) return [];
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

  const firstFailureIndex = testCases.findIndex(
    (tc) =>
      (tc.verdict && tc.verdict.toLowerCase().includes("wrong")) ||
      tc.verdict.toLowerCase().includes("error") ||
      tc.verdict.toLowerCase().includes("fail")
  );
  const renderLimit =
    firstFailureIndex !== -1 ? firstFailureIndex + 1 : testCases.length;

  // Updated function to use the specified API call
  const handleAskNinjaAI = async (query) => {
    const context = `
Problem Statement: ${activeProblem?.description || ""}
Programming Language: ${language}
User's Code:
${code[activeProblem._id] || ""}
${error ? `Error Message: ${error}` : ""}
${
  failingTestCase
    ? `Failing Test Case: ${JSON.stringify(failingTestCase, null, 2)}`
    : ""
}
User's Query: ${query}
`; // Prepare messages for the chat API

    const messages = [
      {
        role: "system",
        content: `You are Ninja AI, a semi‑Socratic coding tutor for a single, current problem context.

Primary goal:
- Provide hints, probing questions, and partial strategies so the learner figures out the final fix; never provide a complete working solution or end‑to‑end code.

Helpfulness target:
- Aim for ~50-50: give just enough direction to unlock progress while leaving meaningful implementation steps for the learner.

Behavioral rules:
- Scope: Discuss only what is relevant to the provided Problem Statement, Programming Language, User's Code, Error Message, Failing Test Case, and User's Query; ignore unrelated topics, optimizations, or alternative stacks unless strictly necessary for this fix.
- Refusals: If asked for “full code,” “complete solution,” or equivalent, politely refuse and pivot to hints and a guiding question.
- Code usage: At most one tiny illustrative snippet (≤4 lines) or brief pseudo‑code only when essential; no full functions/classes/modules, no end‑to‑end algorithm dumps, no large code blocks.
- Method: Ask 1 focused question, give 2–3 progressive hints, and stop before the final step so the learner must do nontrivial work.
- Safety: No external links, personal data, or speculation beyond the given context.

Response format (concise):
1) Understanding: one sentence diagnosing the likely issue in this specific code/context.
2) Hints: 2–3 ordered hints that narrow the path (no complete solution).
3) Tiny illustration (optional): ≤4 lines or brief pseudo‑code only if strictly necessary.
4) Next step: one concrete action to try now.
5) Checkpoint question: one short question to confirm understanding before proceeding.

Tone:
- Encouraging, focused, minimal, and tightly scoped to this problem.
`,
      },
      {
        role: "user",
        content: context,
      },
    ];

    try {
      // Use the fetch API to call the specified chat endpoint
      const response = await fetch(`${server}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API failed with status ${response.status}: ${
            errorData.error || response.statusText
          }`
        );
      }

      const data = await response.json(); // The backend returns { "reply": "..." }
      const aiResponse = data.reply;
      if (!aiResponse) {
        return "AI service returned a success status but the response was empty.";
      }

      return aiResponse;
    } catch (error) {
      console.error("Ninja AI API Error:", error); // Return a user-friendly error message
      return `I'm having trouble connecting to the AI service right now. Please try again. Error: ${error.message}`;
    }
  };
  

  return (
    <div
      ref={containerRef}
      className={`flex flex-col flex-1 min-w-0 h-full p-2 overflow-hidden relative ${
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
          problemStatement={activeProblem}
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
          className="bg-gray-800 rounded-b p-3 overflow-auto text-sm text-white relative"
          style={{ height: outputHeight, minHeight: 80 }}
        >
          {/* Ninja AI Button */}
          {showNinjaAIButton && (
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => {
                  setShowNinjaAIChat(true);
                }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg"
                title="Get help from Ninja AI for this error"
              >
                <SparklesIcon className="h-4 w-4" />
                Ask Ninja AI
              </button>

              {failingTestCase && (
                <div className="text-xs text-gray-300 mt-1 text-center">
                  {failingTestCase.verdict}
                </div>
              )}
            </div>
          )}

          <h3 className="font-semibold mb-2">Output / Errors:</h3>

          {isRunning ? (
            <p>Running...</p>
          ) : error ? (
            <pre className="whitespace-pre-wrap text-red-400">{error}</pre>
          ) : testCases.length > 0 ? (
            <div className="space-y-2 max-h-full overflow-auto">
              {testCases
                .slice(0, renderLimit)
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

              {firstFailureIndex !== -1 && (
                <div className="flex flex-col justify-center items-center text-red-500 my-4 py-2 border-t border-red-700/50">
                  <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[10px] border-t-red-500"></div>
                  <span className="mt-1 text-sm font-medium">
                    First Error Encountered. Remaining tests skipped.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-green-300">{output}</pre>
          )}
        </div>
      )}

      {/* NinjaAIChat component */}
      {showNinjaAIChat && (
        <NinjaAIChat
          onClose={() => setShowNinjaAIChat(false)}
          sendQuery={handleAskNinjaAI}
          initialQuery={initialAIQuery}
        />
      )}
    </div>
  );
}
