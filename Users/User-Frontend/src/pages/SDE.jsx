import React from 'react';
import { useNavigate } from 'react-router-dom';

const SdePracticePage = () => {
  const navigate = useNavigate();

  const dummyProblems = [
    { id: 1, title: "Two Sum", difficulty: "Easy", description: "Find two numbers that add up to a target." },
    { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", description: "Find the length of longest substring without repeating chars." },
    { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", description: "Find median of two sorted arrays." },
    { id: 4, title: "Valid Parentheses", difficulty: "Easy", description: "Check if input string has valid open-close parentheses." },
    { id: 5, title: "Merge Intervals", difficulty: "Medium", description: "Merge overlapping intervals in a list." },
    { id: 6, title: "Reverse Nodes in k-Group", difficulty: "Hard", description: "Reverse nodes in k-sized groups in linked list." },
    // Add more dummy problems to make the page bigger
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8 max-w-6xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition duration-300"
      >
        &larr; Back
      </button>

      <h1 className="text-4xl font-bold text-indigo-900 mb-6 text-center">
        SDE Practice Problems
      </h1>

      <p className="text-center max-w-3xl mx-auto text-indigo-800 mb-10">
        Practice a wide range of coding problems to prepare for software development engineer interviews and enhance your problem-solving skills.
      </p>

      <div className="space-y-8">
        {dummyProblems.map(({ id, title, difficulty, description }) => (
          <div 
            key={id} 
            className="p-6 border border-indigo-200 rounded-lg shadow-sm hover:shadow-lg bg-white transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-indigo-900">{title}</h2>
              <span className={`px-3 py-1 rounded-full font-semibold text-white ${
                difficulty === "Easy" ? "bg-green-500" :
                difficulty === "Medium" ? "bg-yellow-500" :
                "bg-red-500"
              }`}>
                {difficulty}
              </span>
            </div>
            <p className="text-indigo-700">{description}</p>
            <button 
              className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Solve Problem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SdePracticePage;
