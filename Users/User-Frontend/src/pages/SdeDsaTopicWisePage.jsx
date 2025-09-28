import React from 'react';
import { useNavigate } from 'react-router-dom';

const sdeDsaTopics = [
  {
    topic: "Arrays",
    problems: [
      { id: 101, title: "Two Sum", difficulty: "Easy" },
      { id: 102, title: "Maximum Subarray", difficulty: "Medium" },
      { id: 103, title: "Product of Array Except Self", difficulty: "Medium" },
      { id: 104, title: "Trapping Rain Water", difficulty: "Hard" },
    ],
  },
  {
    topic: "Linked Lists",
    problems: [
      { id: 201, title: "Reverse Linked List", difficulty: "Easy" },
      { id: 202, title: "Detect Cycle in Linked List", difficulty: "Medium" },
      { id: 203, title: "Merge Two Sorted Lists", difficulty: "Easy" },
      { id: 204, title: "Reorder List", difficulty: "Medium" },
    ],
  },
  {
    topic: "Trees",
    problems: [
      { id: 301, title: "Binary Tree Inorder Traversal", difficulty: "Easy" },
      { id: 302, title: "Lowest Common Ancestor", difficulty: "Medium" },
      { id: 303, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard" },
      { id: 304, title: "Balanced Binary Tree", difficulty: "Easy" },
    ],
  },
  {
    topic: "Graphs",
    problems: [
      { id: 401, title: "Number of Islands", difficulty: "Medium" },
      { id: 402, title: "Clone Graph", difficulty: "Medium" },
      { id: 403, title: "Course Schedule", difficulty: "Medium" },
      { id: 404, title: "Minimum Spanning Tree", difficulty: "Hard" },
    ],
  },
  {
    topic: "Dynamic Programming",
    problems: [
      { id: 501, title: "Climbing Stairs", difficulty: "Easy" },
      { id: 502, title: "Longest Increasing Subsequence", difficulty: "Medium" },
      { id: 503, title: "Coin Change", difficulty: "Medium" },
      { id: 504, title: "Edit Distance", difficulty: "Hard" },
    ],
  },
];

const SdeDsaTopicWisePage = () => {
  const navigate = useNavigate();

  const difficultyColor = (level) => {
    switch(level) {
      case "Easy": return "bg-green-600";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-600";
      default: return "bg-gray-400";
    }
  };

  // Dummy function simulating navigation to problem detail or practice page
  const goToProblemPage = (id, title) => {
    // For demo: Show alert. Replace this with real navigation or modal later.
    alert(`Navigate to practice page for problem: ${title} (ID: ${id})`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-10 max-w-7xl mx-auto font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-10 px-5 py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md transition duration-300 flex items-center gap-2"
        aria-label="Go Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Page Title */}
      <h1 className="text-5xl font-extrabold text-indigo-900 mb-14 text-center tracking-wide">
        SDE DSA Topic-wise Practice
      </h1>

      <p className="text-center max-w-3xl mx-auto text-indigo-800 mb-16 text-lg leading-relaxed">
        Explore fundamental Data Structures and Algorithms topics with curated coding challenges. Click on a problem below to start practicing and sharpening your skills.
      </p>

      {sdeDsaTopics.map(({ topic, problems }) => (
        <section key={topic} className="mb-20">
          <h2 className="text-3xl font-semibold text-indigo-900 border-b-4 border-indigo-500 pb-3 max-w-max mb-10 select-none">
            {topic}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {problems.map(({ id, title, difficulty }) => (
              <div
                key={id}
                className="bg-white rounded-xl shadow-lg p-7 cursor-pointer hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between"
                onClick={() => goToProblemPage(id, title)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if(e.key === 'Enter' || e.key === ' ') goToProblemPage(id, title);
                }}
                aria-label={`Practice problem ${title}`}
              >
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-3 tracking-tight truncate">
                    {title}
                  </h3>
                  <span
                    className={`inline-block ${difficultyColor(difficulty)} text-white text-xs font-semibold px-4 py-1 rounded-full select-none`}
                    title={`Difficulty: ${difficulty}`}
                  >
                    {difficulty}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToProblemPage(id, title);
                  }}
                  className="mt-8 w-full py-3 text-center bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold text-base transition"
                  aria-label={`Start practicing ${title} problem`}
                >
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default SdeDsaTopicWisePage;
