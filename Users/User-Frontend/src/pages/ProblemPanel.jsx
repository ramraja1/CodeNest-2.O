// ProblemPanel.jsx
import React from "react";

export default function ProblemPanel({ problem, darkMode }) {
  return (
    <section className="w-2/5 min-w-[340px] max-w-[500px] p-6 overflow-y-auto border-r prose max-w-none dark:prose-invert">
      <h2 className="flex items-center justify-between w-full text-lg font-bold mb-2">
        <span>{problem.title}</span>
        <span className="ml-4 px-3 py-1 rounded bg-emerald-500 text-white text-sm font-semibold shadow-sm">
          Marks: {problem.marks}
        </span>
      </h2>
      <p className="mb-2 text-sm opacity-70">
        Difficulty:{" "}
        <span
          className={`font-semibold ${
            problem.difficulty === "Easy"
              ? "text-green-500"
              : problem.difficulty === "Medium"
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {problem.difficulty}
        </span>
      </p>
      <p className="whitespace-pre-wrap mb-4">{problem.description}</p>

      {problem.inputFormat && (
        <>
          <h3>Input Format</h3>
          <pre className="bg-gray-50 text-gray-900 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
            {problem.inputFormat}
          </pre>
        </>
      )}

      {problem.outputFormat && (
        <>
          <h3>Output Format</h3>
          <pre className="bg-gray-50 text-gray-900 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
            {problem.outputFormat}
          </pre>
        </>
      )}

      {problem.constraints && (
        <>
          <h3>Constraints</h3>
          <pre className="bg-gray-50 text-gray-900 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
            {problem.constraints}
          </pre>
        </>
      )}

      {(problem.sampleInput || problem.sampleOutput) && (
        <>
          <h3>Sample Test Case</h3>
          <div className="grid grid-cols-2 gap-4">
            {problem.sampleInput && (
              <pre className="bg-gray-900 text-green-400 rounded p-3 whitespace-pre-wrap">
                <strong>Input:</strong>
                {"\n"}
                {problem.sampleInput}
              </pre>
            )}
            {problem.sampleOutput && (
              <pre className="bg-gray-900 text-pink-400 rounded p-3 whitespace-pre-wrap">
                <strong>Output:</strong>
                {"\n"}
                {problem.sampleOutput}
              </pre>
            )}
          </div>
        </>
      )}

      {problem.explanation && (
        <>
          <h3>Explanation</h3>
          <p>{problem.explanation}</p>
        </>
      )}
    </section>
  );
}
