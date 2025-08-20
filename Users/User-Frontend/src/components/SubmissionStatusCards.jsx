import React from "react";
import { CheckCircleIcon, XCircleIcon, ClockIcon, CpuChipIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react"; // nice loader icon

export default function SubmitStatus({
  isOpen,
  onClose,
  testResults = [],
  score = 0,
  language = "",
   totalMarks = 0,    
  penalty = 0,
  runtime = "N/A",
  memory = "N/A",
  isRunning = false,
}) {
  if (!isOpen) return null;

  const passCount = testResults.filter(t => t.verdict === "Accepted").length;
  const isAccepted = passCount === testResults.length && testResults.length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 font-sans">
      {/* Overlay */}
      <div className="bg-black opacity-40 absolute inset-0"></div>

      {/* Card */}
      <div className="relative bg-white text-gray-900 rounded-2xl shadow-2xl w-96 p-6 z-10">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        {isRunning ? (
          // ---------------- RUNNING STATE ----------------
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-gray-700 font-semibold animate-pulse">
              Running your code...
            </p>
            {/* Fake progress bar */}
            <div className="relative w-full h-1 bg-gray-200 overflow-hidden rounded">
              <div className="absolute h-full w-1/3 bg-indigo-500 animate-[progressLoop_2s_linear_infinite]" />
            </div>
          </div>
        ) : (
          // ---------------- RESULT STATE ----------------
          <>
            {/* Title */}
            <h2 className="font-bold text-2xl mb-4 text-center">
              Submission Result
            </h2>

            {/* Verdict */}
            <div className="flex justify-center items-center mb-6">
              {isAccepted ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
                  <CheckCircleIcon className="h-6 w-6" /> Accepted
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
                  <XCircleIcon className="h-6 w-6" /> Wrong Answer
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-gray-100 text-center">
                <p className="text-gray-500">Test Cases</p>
                <p className="font-bold">
                  {passCount}/{testResults.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100 text-center">
                <p className="text-gray-500">Score</p>
                <p className="font-bold">
                  {score}
                  {totalMarks > 0 && (
                    <span className="text-gray-500"> / {totalMarks}</span>
                  )}
                </p>
              </div>

              
              <div className="p-3 rounded-lg bg-gray-100 text-center">
                <p className="text-gray-500">Language</p>
                <p className="font-bold uppercase">{language}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100 text-center">
                <p className="text-gray-500">Penalty</p>
                <p className="font-bold">{penalty}%</p>
              </div>
            </div>

            {/* Runtime & Memory */}
            <div className="mt-6 flex justify-around text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-5 w-5 text-gray-500" /> {runtime}
              </div>
              <div className="flex items-center gap-1">
                <CpuChipIcon className="h-5 w-5 text-gray-500" /> {memory}
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS animation for progress bar */}
      <style>{`
        @keyframes progressLoop {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
