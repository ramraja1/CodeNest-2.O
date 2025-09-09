import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  SunIcon,
  MoonIcon,
  ArrowUturnLeftIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import EnhancedEditorOutputPanel from "../components/EditorPannel";
import ProblemPanel from "./ProblemPanel";
import SubmitStatus from "../components/SubmissionStatusCards";
import { UserContext } from "../context/UserContext.jsx";
import classNames from "classnames";

export default function ProblemSolveView({
  questions = [],
  initialProblemId,
  userSubmissions = [],
  onBack,
}) {
  // State declarations
  const [activeProblemId, setActiveProblemId] = useState(
    initialProblemId || (questions[0] && questions[0]._id)
  );
  const [submitStatusOpen, setSubmitStatusOpen] = useState(false);
  const [activeProblem, setActiveProblem] = useState(null);
  const [code, setCode] = useState({});
  const [language, setLanguage] = useState("cpp");
  const [darkMode, setDarkMode] = useState(true);
  const [fullEditor, setFullEditor] = useState(false);
  const [problemListOpen, setProblemListOpen] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [score, setScore] = useState(0);

  const { userId, token } = useContext(UserContext);
  const server = import.meta.env.VITE_SERVER;

  // Language mapping for API/Judge compatibility
  const languageMap = useMemo(() => ({
    cpp: "cpp",
    python: "python3",
    java: "java",
  }), []);

  // Effect: Set activeProblem whenever activeProblemId or questions list changes
  useEffect(() => {
    if (!questions.length) return;
    const p = questions.find((q) => q._id === activeProblemId) || questions[0];
    setActiveProblem(p);
    if (p) {
      setCode((old) => ({
        ...old,
        [p._id]: old[p._id] || getDefaultStarterCode(language),
      }));
    }
  }, [activeProblemId, questions, language]);

  // Effect: Ensure code for active problem has starter code if empty
  useEffect(() => {
    if (
      activeProblem &&
      (!code[activeProblem._id] || code[activeProblem._id].trim() === "")
    ) {
      setCode((old) => ({
        ...old,
        [activeProblem._id]: getDefaultStarterCode(language),
      }));
    }
  }, [language, activeProblem, code]);

  // Get default starter code for each language
  function getDefaultStarterCode(lang) {
    switch (lang) {
      case "cpp":
        return `#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}`;
      case "python":
        return `def main():\n    pass`;
      case "java":
        return `public class Solution { public static void main(String[] args) { } }`;
      default:
        return "// Write code here";
    }
  }

  // Handle language or code changes from editor
  const handleEditorChange = useCallback(
    (type, value) => {
      if (type === "language") setLanguage(value);
      else if (type === "code" && activeProblem) {
        setCode((old) => ({ ...old, [activeProblem._id]: value }));
      }
    },
    [activeProblem]
  );

  // Memoize latest submission map by problemId for quick lookup
  const latestSubmissionMap = useMemo(() => {
    const map = new Map();
    userSubmissions.forEach((sub) => {
      const existing = map.get(sub.problemId);
      if (
        !existing ||
        new Date(sub.submittedAt) > new Date(existing.submittedAt)
      ) {
        map.set(sub.problemId, sub);
      }
    });
    return map;
  }, [userSubmissions]);

  // Returns the status of a problem based on latest submission
  const getProblemStatus = useCallback(
    (id) => {
      const sub = latestSubmissionMap.get(id);
      if (!sub) return "notAttempted";
      return sub.score > 0 ? "solved" : "attempted";
    },
    [latestSubmissionMap]
  );

  // Fetch last saved submission for active problem on load/change
  useEffect(() => {
    async function fetchLastSubmission() {
      if (!activeProblem || !userId) return;
      try {
        const res = await fetch(
          `${server}/api/submissions?userId=${userId}&problemId=${activeProblem._id}&contestId=${activeProblem.contestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.submission) {
            setCode((old) => ({
              ...old,
              [activeProblem._id]: data.submission.sourceCode,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch last submission:", e);
      }
    }
    fetchLastSubmission();
  }, [activeProblem, userId, token, server]);

  // Execution function: runs the code against all test cases, sets output & verdicts
  const handleRun = useCallback(async () => {
    if (!activeProblem?.testCases?.length) {
      alert("No test cases found for this problem.");
      return;
    }
    setIsRunning(true);
    setError("");
    setOutput("");
    const verdicts = [];
    const pistonLang = languageMap[language] || language;
    for (const test of activeProblem.testCases) {
      try {
        const res = await fetch(`${server}/api/judge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: pistonLang,
            version: "latest",
            sourceCode: code[activeProblem._id] || "",
            stdin: test.input || "",
          }),
        });
        const result = await res.json();
        if (result.run?.stderr?.trim()) {
          verdicts.push({
            input: test.input,
            expected: test.expectedOutput,
            output: "",
            verdict: "Runtime/Error",
            error: result.run.stderr.trim(),
          });
          continue;
        }
        const outputTrim = result.run?.stdout?.trim() || "";
        const expectedTrim = test.expectedOutput.trim();
        verdicts.push({
          input: test.input,
          expected: test.expectedOutput,
          output: outputTrim,
          verdict: outputTrim === expectedTrim ? "Accepted" : "Wrong Answer",
        });
      } catch (e) {
        verdicts.push({
          input: test.input,
          expected: test.expectedOutput,
          output: "",
          verdict: "Error",
          error: e.message,
        });
      }
    }

    const formattedVerdicts = verdicts
      .map(
        (v, i) =>
          `Test Case #${i + 1}:\n` +
          `Input:\n${v.input}\n` +
          `Expected Output:\n${v.expected}\n` +
          `Your Output:\n${v.output}\n` +
          `Verdict: ${v.verdict}` +
          (v.error ? `\nError Info:\n${v.error}` : "") +
          "\n-------------------------"
      )
      .join("\n\n");
    setOutput(formattedVerdicts);
    setIsRunning(false);
  }, [activeProblem, language, code, languageMap, server]);

  // Submission handler: runs, calculates score, and saves submission
  const handleSubmit = useCallback(async () => {
    if (!activeProblem?.testCases?.length) {
      alert("No test cases found for this problem.");
      return;
    }

    setSubmitStatusOpen(false);
    setIsRunning(true);
    setError("");
    setOutput("");

    const verdicts = [];
    const pistonLang = languageMap[language] || language;

    for (const test of activeProblem.testCases) {
      try {
        const res = await fetch(`${server}/api/judge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: pistonLang,
            version: "latest",
            sourceCode: code[activeProblem._id] || "",
            stdin: test.input || "",
          }),
        });
        const result = await res.json();

        if (result.run?.stderr?.trim()) {
          verdicts.push({
            input: test.input,
            expected: test.expectedOutput,
            output: "",
            verdict: "Runtime/Error",
            error: result.run.stderr.trim(),
          });
          continue;
        }

        const outputTrim = result.run?.stdout?.trim() || "";
        const expectedTrim = test.expectedOutput.trim();
        verdicts.push({
          input: test.input,
          expected: test.expectedOutput,
          output: outputTrim,
          verdict: outputTrim === expectedTrim ? "Accepted" : "Wrong Answer",
        });
      } catch (e) {
        verdicts.push({
          input: test.input,
          expected: test.expectedOutput,
          output: "",
          verdict: "Error",
          error: e.message,
        });
      }
    }

    setTestResults(verdicts);

    // Calculate score
    const passedTests = verdicts.filter((v) => v.verdict === "Accepted").length;
    const totalMarks = activeProblem?.marks || 0;
    const marksEarned = Math.round((passedTests / verdicts.length) * totalMarks);
    setScore(marksEarned);

    // Save submission to backend
    try {
      const res = await fetch(`${server}/api/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          problemId: activeProblem._id,
          contestId: activeProblem.contestId,
          language,
          sourceCode: code[activeProblem._id],
          testResults: verdicts,
          score: marksEarned,
          penalty: 0,
          runtime: "N/A",
          memory: "N/A",
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error("Failed to save submission:", errData.message);
      }
    } catch (error) {
      console.error("Error saving submission:", error);
    }

    setIsRunning(false);
    setSubmitStatusOpen(true);
  }, [activeProblem, language, code, languageMap, server, token, userId]);

  const modeClass = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";

  // JSX Layout with accessibilty, keyboard handling, and performance in mind
  return (
    <div className={`flex flex-col h-screen ${modeClass} transition-colors font-sans`}>
      {/* Header */}
      <header
        className={`flex items-center justify-between p-4 border-b ${
          darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-emerald-500 hover:text-emerald-600 font-semibold"
            aria-label="Back to contest"
            type="button"
          >
            <ArrowUturnLeftIcon className="h-5 w-5" /> Back
          </button>
          <h1
            className="text-lg font-semibold truncate max-w-xs"
            title={activeProblem?.title || ""}
          >
            {activeProblem?.title || "Select a Problem"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
            type="button"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-800" />
            )}
          </button>
          <button
            onClick={() => setProblemListOpen(true)}
            className="p-2 rounded hover:bg-gray-700 transition"
            aria-label="Open problem list"
            type="button"
          >
            <Bars3BottomLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Problem List Sidebar */}
      {problemListOpen && (
        <aside className="fixed inset-0 bg-opacity-50 z-50 flex" role="dialog" aria-modal="true" aria-label="Problem list">
          <div
            className={`${
              darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            } w-80 shadow-xl overflow-y-auto`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="font-bold text-xl">Questions</h2>
              <button
                onClick={() => setProblemListOpen(false)}
                className="p-1 hover:bg-gray-700 rounded"
                aria-label="Close problem list"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <ul>
              {questions.map((q, idx) => {
                const status = getProblemStatus(q._id);
                const baseClasses =
                  "cursor-pointer px-4 py-3 border-b border-gray-300 hover:bg-blue-100 hover:text-blue-900 transition duration-200 ease-in-out rounded-md";
                const activeClasses = q._id === activeProblemId ? "bg-blue-200 text-blue-900 font-semibold shadow-md" : "";
                const statusClasses =
                  status === "solved"
                    ? "bg-green-100 text-green-800 font-semibold"
                    : status === "attempted"
                    ? "bg-yellow-100 text-yellow-800 font-semibold"
                    : "bg-white text-gray-800";

                return (
                  <li
                    key={q._id}
                    onClick={() => {
                      setActiveProblemId(q._id);
                      setProblemListOpen(false);
                      setFullEditor(false);
                      setOutput("");
                      setError("");
                      setSubmitStatusOpen(false);
                    }}
                    className={`${baseClasses} ${activeClasses} ${statusClasses}`}
                    title={`${q.title} (${q.difficulty})`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveProblemId(q._id);
                        setProblemListOpen(false);
                        setFullEditor(false);
                        setOutput("");
                        setError("");
                        setSubmitStatusOpen(false);
                      }
                    }}
                    aria-pressed={q._id === activeProblemId}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{`Q${idx + 1}. ${q.title}`}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          q.difficulty === "Easy"
                            ? "bg-green-200 text-green-900"
                            : q.difficulty === "Medium"
                            ? "bg-yellow-200 text-yellow-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="flex-1"
            onClick={() => setProblemListOpen(false)}
            aria-hidden="true"
          />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex flex-1 h-full overflow-hidden">
        {/* Problem Description Panel */}
        {!fullEditor && activeProblem && (
          <ProblemPanel problem={activeProblem} darkMode={darkMode} />
        )}

        {/* Editor and Output Panel */}
        {activeProblem && (
          <div className={`flex flex-col h-full w-full ${fullEditor ? "w-full" : "flex-1"}`}>
            <EnhancedEditorOutputPanel
              activeProblem={activeProblem}
              code={code}
              language={language}
              darkMode={darkMode}
              output={output}
              error={error}
              isRunning={isRunning}
              handleEditorChange={handleEditorChange}
              handleRun={handleRun}
              handleSubmit={handleSubmit}
              fullEditor={fullEditor}
              setFullEditor={setFullEditor}
            />
          </div>
        )}

        {/* Submission Status Modal */}
        <SubmitStatus
          isOpen={submitStatusOpen}
          onClose={() => setSubmitStatusOpen(false)}
          testResults={testResults}
          score={score}
          totalMarks={activeProblem?.marks || 0}
          isRunning={isRunning}
          language={language}
          penalty={0}
        />
      </main>
    </div>
  );
}
