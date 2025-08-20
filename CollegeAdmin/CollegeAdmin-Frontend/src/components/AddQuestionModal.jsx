import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlus, FaTrash, FaRobot } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AddQuestionModal({ contestId, token, onClose, onQuestionAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [tags, setTags] = useState("");
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", isHidden: false }]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [marks, setMarks] = useState(20); // default to 10, or whatever you want

  const formRef = useRef(null);
  const server = `${import.meta.env.VITE_SERVER}`;

  // Sticky shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(formRef.current.scrollTop > 10);
    const formEl = formRef.current;
    formEl.addEventListener("scroll", handleScroll);
    return () => formEl.removeEventListener("scroll", handleScroll);
  }, []);

  const addTestCase = () => setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  const updateTestCase = (i, key, value) => {
    const updated = [...testCases];
    updated[i][key] = value;
    setTestCases(updated);
  };
  const removeTestCase = (i) => setTestCases(testCases.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");

    try {
      setLoading(true);
      const res = await fetch(`${server}/api/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contestId,
          title,
          description,
          inputFormat,
          outputFormat,
          constraints,
          sampleInput,
          sampleOutput,
          marks,
          explanation,
          difficulty,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          testCases,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Question added");
        onQuestionAdded(data.question);
        onClose();
      } else {
        toast.error(data.message || "Failed to add question");
      }
    } catch {
      toast.error("Error adding question");
    } finally {
      setLoading(false);
    }
  };

  // Example AI generator helper
  const handleGenerateWithAI = () => {
    toast.info("AI generating a sample question...");
    setTitle("AI: Fibonacci Sequence Generator");
    setDescription("Write a program to print the first N numbers of the Fibonacci sequence.");
    setInputFormat("Single integer N (1 <= N <= 50)");
    setOutputFormat("First N Fibonacci numbers separated by space");
    setConstraints("1 <= N <= 50");
    setSampleInput("5");
    setSampleOutput("0 1 1 2 3");
    setExplanation("The Fibonacci sequence starts with 0 and 1, and each number is the sum of the previous two.");
    setDifficulty("Medium");
    setTags("Math, Recursion, Dynamic Programming");
    setTestCases([
      { input: "5", expectedOutput: "0 1 1 2 3", isHidden: false },
      { input: "10", expectedOutput: "0 1 1 2 3 5 8 13 21 34", isHidden: true },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Sticky Header */}
        <div
          className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 transition-all duration-200 ${
            scrolled ? "bg-white shadow-md" : "bg-gray-50"
          }`}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Add New Coding Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col lg:flex-row bg-amber-300 overflow-y-auto flex-1">
          {/* LEFT COLUMN */}
          <div className="flex-1 border-r  p-4 md:p-6 space-y-4 bg-gray-50">
            {/* AI Auto-Gen */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateWithAI}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow"
              >
                <FaRobot /> Generate with AI
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block font-medium mb-1">Question Title *</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Formats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Input Format</label>
                <input className="w-full border px-3 py-2 rounded" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Output Format</label>
                <input className="w-full border px-3 py-2 rounded" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} />
              </div>
            </div>

            {/* Constraints */}
            <div>
              <label className="block font-medium mb-1">Constraints</label>
              <input className="w-full border px-3 py-2 rounded" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
            </div>

            {/* Sample Input/Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Sample Input</label>
                <input className="w-full border px-3 py-2 rounded" value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Sample Output</label>
                <input className="w-full border px-3 py-2 rounded" value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} />
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block font-medium mb-1">Explanation</label>
              <textarea className="w-full border px-3 py-2 rounded" rows="2" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
            </div>

            {/* Difficulty + Tags */}
            {/* Difficulty + Marks + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-1">Difficulty</label>
                  <select className="w-full border px-3 py-2 rounded" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border px-3 py-2 rounded"
                    value={marks}
                    onChange={e => setMarks(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Tags</label>
                  <input placeholder="Comma separated" className="w-full border px-3 py-2 rounded" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
              </div>

          </div>

          {/* RIGHT COLUMN: Test Cases */}
          <div className="flex-1 p-4 md:p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
            <p className="text-sm text-gray-500 mb-4">Hidden cases are used for scoring; public ones are shown to students.</p>

            {testCases.map((tc, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm bg-gray-50">
                <input className="w-full border px-3 py-1 rounded mb-2" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(idx, "input", e.target.value)} />
                <input className="w-full border px-3 py-1 rounded mb-2" placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => updateTestCase(idx, "expectedOutput", e.target.value)} />
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tc.isHidden} onChange={(e) => updateTestCase(idx, "isHidden", e.target.checked)} />
                    Hidden Test Case
                  </label>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(idx)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm">
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addTestCase} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center gap-2 text-sm font-medium">
              <FaPlus /> Add Test Case
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t sticky bottom-0 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded shadow">
            {loading ? "Saving..." : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
