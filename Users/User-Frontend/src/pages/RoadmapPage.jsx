import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const roadmaps = {
  mern: {
    title: "MERN Stack Developer Roadmap",
    steps: [
      { id: 1, title: "JavaScript Essentials", description: "Learn ES6 syntax, functions, closures, async/await.", time: "1 month" },
      { id: 2, title: "Node.js & Express", description: "Back-end development, REST APIs, middleware.", time: "1.5 months" },
      { id: 3, title: "MongoDB", description: "NoSQL concepts, CRUD operations, aggregation.", time: "1 month" },
      { id: 4, title: "React Basics", description: "JSX, components, props, state, hooks.", time: "1 month" },
      { id: 5, title: "Advanced React", description: "React Router, Context API, custom hooks.", time: "1 month" },
    ],
  },
  java: {
    title: "Java Developer Roadmap",
    steps: [
      { id: 1, title: "Java Basics", description: "Learn syntax, loops, conditionals, data types.", time: "1 month" },
      { id: 2, title: "OOP Concepts", description: "Understand OOP: Classes, Inheritance, Polymorphism.", time: "1 month" },
      { id: 3, title: "Core Java API", description: "Collections Framework, Streams, Exception Handling.", time: "1 month" },
    ],
  },
  software: {
    title: "Software Developer Roadmap",
    steps: [
      { id: 1, title: "Programming Fundamentals", description: "Learn basics: loops, variables, conditionals.", time: "1 month" },
      { id: 2, title: "DSA", description: "Arrays, Linked Lists, Trees.", time: "2 months" },
      { id: 3, title: "Version Control", description: "Git basics, branching, merging.", time: "2 weeks" },
    ],
  },
  python: {
    title: "Python Developer Roadmap",
    steps: [
      { id: 1, title: "Python Basics", description: "Syntax, data types, control flow.", time: "1 month" },
      { id: 2, title: "OOP Concepts", description: "Classes, inheritance, polymorphism.", time: "1 month" },
      { id: 3, title: "Web Frameworks", description: "Django, Flask introduction.", time: "2 months" },
    ],
  },
};

const RoadmapStep = ({ step }) => (
  <li
    tabIndex={0}
    aria-label={`${step.title}, estimated time ${step.time}`}
    className="mb-8 flex items-start space-x-5 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl p-4 hover:bg-indigo-50 transition"
  >
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold select-none">
      {step.id}
    </div>
    <div className="flex-grow">
      <h3 className="text-xl font-semibold text-indigo-900 mb-1">{step.title}</h3>
      <p className="text-indigo-700 mb-2">{step.description}</p>
      <span className="inline-block text-indigo-600 text-sm font-medium bg-indigo-100 rounded-full px-3 py-1 select-none">
        Estimated: {step.time}
      </span>
    </div>
  </li>
);

const RoadmapContent = ({ roadmap }) => {
  return (
    <div className="bg-indigo-50 rounded-xl p-8 shadow max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-900 mb-8 text-center">
        {roadmap.title}
      </h2>
      <ol role="list" className="relative border-l-4 border-indigo-400 pl-6">
        {roadmap.steps.map((step) => (
          <RoadmapStep key={step.id} step={step} />
        ))}
      </ol>
    </div>
  );
};

const RoadmapPage = () => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selected) {
      const el = document.getElementById("roadmap-content");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-10 flex flex-col font-sans">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 px-6 py-3 bg-indigo-700 text-white rounded-full shadow hover:bg-indigo-800 transition focus:outline-none focus:ring-4 focus:ring-indigo-400 mx-auto w-max flex items-center"
        aria-label="Go back"
      >
        <svg
          className="w-5 h-5 mr-2 -ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="flex justify-center flex-wrap gap-6 mb-12 max-w-4xl mx-auto">
        {Object.entries(roadmaps).map(([key, roadmap]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-8 py-3 rounded-full font-semibold text-lg border-2 transition ${
              selected === key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100"
            }`}
          >
            {roadmap.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {selected ? (
        <div id="roadmap-content" tabIndex={-1}>
          <RoadmapContent roadmap={roadmaps[selected]} />
        </div>
      ) : (
        <p className="max-w-xl mx-auto text-indigo-700 text-center text-lg select-text">
          Select a roadmap above to view the detailed learning path and milestones.
        </p>
      )}
    </main>
  );
};

export default RoadmapPage;
