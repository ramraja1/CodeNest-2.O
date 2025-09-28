import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const importantSheetsData = [
  {
    id: 'dsa',
    title: "Data Structures & Algorithms (DSA)",
    content: `
# Data Structures & Algorithms Notes

## Arrays
- Fixed size collections of elements.
- Operations: insertion, deletion, traversal.
- Usage: static data storage, sorting algorithms.

## Linked Lists
- Dynamic size, nodes containing data and next pointer.
- Types: singly, doubly, circular.
- Operations: insert, delete, traverse.
- Use cases: dynamic data, insertion-heavy scenarios.

## Stacks & Queues
- Stack (LIFO), Queue (FIFO) behaviors.
- Implemented using arrays or linked lists.
- Applications: expression evaluation, scheduling.

## Trees
- Hierarchical structure with root and child nodes.
- Binary Trees, Binary Search Trees (BST), Heaps.
- Operations: search, insert, delete, traversal (inorder, preorder, postorder).

## Graphs
- Nodes (vertices) connected by edges.
- Types: directed, undirected, weighted.
- Algorithms: BFS, DFS, Dijkstra, Kruskal's MST.

## Sorting Algorithms
- Bubble Sort, Selection Sort, Insertion Sort (O(n²)).
- Merge Sort, Quick Sort, Heap Sort (O(n log n)).

## Dynamic Programming
- Breaking problems into overlapping subproblems.
- Examples: Fibonacci, Knapsack, Longest Common Subsequence.

---

Practice regularly and understand the core principles behind each topic to excel in coding interviews.
`
  },
  {
    id: 'js',
    title: "JavaScript Notes",
    content: `
# JavaScript Important Concepts

## Basics
- Variables: var, let, const.
- Data types: string, number, boolean, null, undefined, symbol.
- Operators: arithmetic, comparison, logical.

## Functions
- Function declarations, expressions, arrow functions.
- Closures and scope.
- Callback functions and asynchronous patterns.

## Objects & Arrays
- Object literals, constructors, prototypes.
- Array methods: map, filter, reduce, forEach.

## DOM Manipulation
- Document Object Model traversal and manipulation.
- Event listeners and event delegation.

## ES6+ Features
- Template literals, destructuring, spread/rest operators.
- Promises, async/await.
- Modules and imports/exports.

## Common APIs
- Fetch API for network requests.
- LocalStorage and SessionStorage.

---

Deep dive into closures and async patterns, these are heavily asked in interviews.
`
  },
  {
    id: 'sql',
    title: "SQL Notes",
    content: `
# SQL Important Concepts

## Basics
- Databases and tables.
- Data Types: INT, VARCHAR, DATE, etc.

## DML (Data Manipulation Language)
- SELECT, INSERT, UPDATE, DELETE.
- WHERE clause, ORDER BY, GROUP BY.

## Joins
- INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN.
- Self joins, cross joins.

## Indexing
- Index types and usage.
- Impact on query performance.

## Normalization
- 1NF, 2NF, 3NF, BCNF.
- Eliminating redundancy.

## Transactions
- ACID properties.
- COMMIT and ROLLBACK.

---

Practice writing queries and optimizing them for performance.
`
  },
  {
    id: 'react',
    title: "React.js Notes",
    content: `
# React.js Essentials

## JSX
- Syntax extension to write HTML in JS.
- Babel transpiles JSX to React.createElement.

## Components
- Functional and Class components.
- Props and State.
- Lifecycle methods (for class components).

## Hooks
- useState, useEffect, useContext.
- Rules of hooks and custom hooks.

## Routing
- react-router basics and setup.
- Dynamic routes and nested routes.

## State Management
- Context API.
- Libraries like Redux, MobX.

---

Experiment with hooks and state management for better app structuring.
`
  }
];

const ImportantSheetsPage = () => {
  const [selectedSheet, setSelectedSheet] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-12 max-w-7xl mx-auto font-sans flex flex-col">
      
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center mb-10 text-indigo-700 hover:text-indigo-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition"
        aria-label="Go Back"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-5xl font-extrabold text-indigo-900 mb-12 text-center tracking-tight drop-shadow-lg">
        Important Study Sheets
      </h1>

      <div className="flex flex-col md:flex-row gap-10 flex-grow">
        {/* Notes List */}
        <nav className="w-full md:w-1/3 bg-white rounded-xl shadow-lg p-8 max-h-[80vh] overflow-y-auto border border-indigo-100">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-8 border-b border-indigo-300 pb-3">
            Available Notes
          </h2>
          <ul role="list" aria-label="Available study sheets">
            {importantSheetsData.map(sheet => (
              <li
                key={sheet.id}
                tabIndex={0}
                role="button"
                onClick={() => setSelectedSheet(sheet)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedSheet(sheet); }}
                className={`cursor-pointer select-none p-3 mb-3 text-indigo-800 rounded-lg transition-all ${
                  selectedSheet?.id === sheet.id
                    ? "bg-indigo-100 text-indigo-900 font-semibold shadow-inner"
                    : "hover:bg-indigo-50 hover:shadow-sm"
                }`}
                aria-current={selectedSheet?.id === sheet.id ? "true" : "false"}
              >
                {sheet.title}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sheet Content */}
        <main className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-12 max-h-[80vh] overflow-y-auto prose prose-indigo max-w-full">
          {selectedSheet ? (
            <>
              <h2 className="text-3xl font-bold mb-6">{selectedSheet.title}</h2>
              <pre className="whitespace-pre-wrap font-mono text-lg leading-relaxed select-text">
                {selectedSheet.content}
              </pre>
            </>
          ) : (
            <p className="text-indigo-800 text-xl italic text-center mt-24">
              Please select a note from the left panel to begin reading.
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ImportantSheetsPage;
