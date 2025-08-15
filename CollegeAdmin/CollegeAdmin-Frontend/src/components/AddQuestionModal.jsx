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
  const modalRef = useRef();

  // Accessibility: close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const addTestCase = () => setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  const updateTestCase = (i, key, value) => {
    const updated = [...testCases];
    updated[i][key] = value;
    setTestCases(updated);
  };
  const removeTestCase = (i) => {
    setTestCases(testCases.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/questions", {
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

  const handleGenerateWithAI = () => {
    setTitle("AI Generated: Sum of Two Numbers");
    setDescription("Write a program that takes two integers and returns their sum.");
    setInputFormat("Two space-separated integers A and B");
    setOutputFormat("Single integer result of A + B");
    setConstraints("1 <= A, B <= 10^9");
    setSampleInput("2 3");
    setSampleOutput("5");
    setExplanation("Addition of input numbers.");
    setDifficulty("Easy");
    setTags("Math, Basics");
    setTestCases([
      { input: "2 3", expectedOutput: "5", isHidden: false },
      { input: "100 200", expectedOutput: "300", isHidden: true },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-5xl w-full overflow-hidden transform animate-scaleUp"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Add New Coding Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row max-h-[80vh] overflow-y-auto"  id="questionForm">
          {/* LEFT SIDE */}
          <div className="flex-1 p-6 space-y-4 bg-white">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateWithAI}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                <FaRobot /> Generate with AI
              </button>
            </div>
            {[
              { label: "Question Title *", type: "text", value: title, setter: setTitle },
              { label: "Description", type: "textarea", value: description, setter: setDescription },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block font-medium mb-1">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea className="w-full border px-3 py-2 rounded" rows="3"
                    value={field.value} onChange={(e) => field.setter(e.target.value)} />
                ) : (
                  <input className="w-full border px-3 py-2 rounded"
                    value={field.value} onChange={(e) => field.setter(e.target.value)} />
                )}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Input Format</label>
                <input className="w-full border px-3 py-2 rounded" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Output Format</label>
                <input className="w-full border px-3 py-2 rounded" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Constraints</label>
              <input className="w-full border px-3 py-2 rounded" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
            {testCases.map((tc, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
                <input className="w-full border px-3 py-1 rounded mb-2" placeholder="Input"
                  value={tc.input} onChange={(e) => updateTestCase(idx, "input", e.target.value)} />
                <input className="w-full border px-3 py-1 rounded mb-2" placeholder="Expected Output"
                  value={tc.expectedOutput} onChange={(e) => updateTestCase(idx, "expectedOutput", e.target.value)} />
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={tc.isHidden} onChange={(e) => updateTestCase(idx, "isHidden", e.target.checked)} />
                    Hidden
                  </label>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(idx)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm">
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addTestCase} className="w-full bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded flex justify-center items-center gap-2 text-sm">
              <FaPlus /> Add Test Case
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-end bg-gray-100 gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-200">Cancel</button>
          <button type="submit" form="questionForm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
