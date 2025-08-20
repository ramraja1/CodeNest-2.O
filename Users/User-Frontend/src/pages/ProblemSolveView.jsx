import React, { useState, useEffect } from "react";
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


import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";  // adjust path as needed


export default function ProblemSolveView({ questions = [], initialProblemId, onBack }) {
  const [activeProblemId, setActiveProblemId] = useState(
    initialProblemId || (questions[0] && questions._id)
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
  const [testResults, setTestResults] = useState([]);  // For storing verdicts on submit
  const [score, setScore] = useState(0);               // Score from submission


  //extracting user id from token
  const {userId,token} = useContext(UserContext);
  

  const server = `${import.meta.env.VITE_SERVER}`;

  // Map your language keys to Piston language strings
  const languageMap = {
    cpp: "cpp",
    python: "python3",
    java: "java",
  };

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
  }, [activeProblemId, questions]);

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

  const handleEditorChange = (type, value) => {
    if (type === "language") setLanguage(value);
    else if (type === "code" && activeProblem) {
      setCode((old) => ({ ...old, [activeProblem._id]: value }));
    }
  };

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
}, [activeProblem, userId, token]);

  async function handleRun() {
    if (!activeProblem || !activeProblem.testCases || activeProblem.testCases.length === 0) {
      alert("No test cases found for this problem.");
      return;
    }
    setIsRunning(true);
    setError("");
    setOutput("");
    let verdicts = [];
    const pistionLang = languageMap[language] || language;
    for (const test of activeProblem.testCases) {
      try {
        const res = await fetch(`${server}/api/judge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: pistionLang,
            version: "latest",
            sourceCode: code[activeProblem._id] || "",
            stdin: test.input || "",
          }),
        });
        const result = await res.json();
        if (result.run && result.run.stderr) {
          const errorMsg = result.run.stderr.trim();
          if (errorMsg) {
            verdicts.push({
              input: test.input,
              expected: test.expectedOutput,
              output: "",
              verdict: "Runtime/Error",
              error: errorMsg,
            });
            continue;
          }
        }
        const outputTrim = result.run && result.run.stdout ? result.run.stdout.trim() : "";
        const expectedTrim = test.expectedOutput.trim();
        const verdict = outputTrim === expectedTrim ? "Accepted" : "Wrong Answer";
        verdicts.push({
          input: test.input,
          expected: test.expectedOutput,
          output: outputTrim,
          verdict,
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
  }

 async function handleSubmit() {
  if (!activeProblem || !activeProblem.testCases || activeProblem.testCases.length === 0) {
    alert("No test cases found for this problem.");
    return;
  }
  setSubmitStatusOpen(false);  // reset before new submit
  setIsRunning(true);
  setError("");
  setOutput("");
  let verdicts = [];
  const pistionLang = languageMap[language] || language;
  
  for (const test of activeProblem.testCases) {
    try {
      const res = await fetch(`${server}/api/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistionLang,
          version: "latest",
          sourceCode: code[activeProblem._id] || "",
          stdin: test.input || "",
        }),
      });
      const result = await res.json();
      if (result.run && result.run.stderr) {
        const errorMsg = result.run.stderr.trim();
        if (errorMsg) {
          verdicts.push({
            input: test.input,
            expected: test.expectedOutput,
            output: "",
            verdict: "Runtime/Error",
            error: errorMsg,
          });
          continue;
        }
      }
      const outputTrim = result.run && result.run.stdout ? result.run.stdout.trim() : "";
      const expectedTrim = test.expectedOutput.trim();
      const verdict = outputTrim === expectedTrim ? "Accepted" : "Wrong Answer";
      verdicts.push({
        input: test.input,
        expected: test.expectedOutput,
        output: outputTrim,
        verdict,
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

  // Calculate marks earned
  const passedTests = verdicts.filter((v) => v.verdict === "Accepted").length;
  const totalMarks = activeProblem?.marks || 0;
  const marksEarned = Math.round((passedTests / verdicts.length) * totalMarks);
  setScore(marksEarned);

  // Save the submission persistently
  try {
    const res = await fetch(`${server}/api/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,  // pass user auth token if required by your backend
      },
      body: JSON.stringify({
        userId,                  // pass the current user ID
        problemId: activeProblem._id,
        contestId: activeProblem.contestId,  // assuming contestId exists on problem
        language,
        sourceCode: code[activeProblem._id],
        testResults: verdicts,
        score: marksEarned,
        penalty: 0,             // adjust if you have penalty logic
        runtime: "N/A",         // optionally parse from judge result if available
        memory: "N/A",          // same for memory usage
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
}


  const modeClass = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";

  return (
    <div className={`flex flex-col h-screen ${modeClass} transition-colors font-sans`}>
      {/* Top Bar */}
      <header
        className={`flex items-center justify-between p-4 border-b ${
          darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-emerald-500 hover:text-emerald-600 font-semibold"
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
          >
            <Bars3BottomLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </header>
      {/* Problem List Sidebar */}
      {problemListOpen && (
        <aside className="fixed inset-0 bg-opacity-50 z-50 flex">
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
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <ul>
              {questions.map((q, idx) => (
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
                  className={`cursor-pointer px-4 py-3 border-b border-gray-700 hover:bg-emerald-600 hover:text-white transition ${
                    q._id === activeProblemId ? "bg-emerald-600 text-white font-semibold" : ""
                  }`}
                  title={`${q.title} (${q.difficulty})`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">
                      Q{idx + 1}. {q.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        q.difficulty === "Easy"
                          ? "bg-green-500"
                          : q.difficulty === "Medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1" onClick={() => setProblemListOpen(false)} />
        </aside>
      )}
      {/* Main Content */}
      <main className="flex flex-1 h-full overflow-hidden">
        {/* Problem Panel */}
        {!fullEditor && activeProblem && (
          <ProblemPanel problem={activeProblem} darkMode={darkMode} />
        )}
        {/* Editor + Output Side Panel */}
        {activeProblem && (
          <div
            className={`flex flex-col h-full w-full ${
              fullEditor ? "w-full" : "flex-1"
            }`}
          >
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
          
            score={score} // This should now be marks earned, not just passedTests
            totalMarks={activeProblem?.marks || 0} // <-- NEW PROP!
          isRunning={isRunning}
          language={language}
          penalty={0} // hardcoded or computed as needed
        />
      </main>
    </div>
  );
}
