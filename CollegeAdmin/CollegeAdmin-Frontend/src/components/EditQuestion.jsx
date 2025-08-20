import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlus, FaTrash, FaRobot } from "react-icons/fa";
import { toast } from "react-toastify";

export default function EditQuestionModal({ questionId, token, onClose, onQuestionUpdated }) {
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
  //server 
   const server=`${import.meta.env.VITE_SERVER}`;
  // Detect scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(formRef.current.scrollTop > 10);
    };
    const formEl = formRef.current;
    formEl.addEventListener("scroll", handleScroll);
    return () => formEl.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`${server}/api/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTitle(data.title || "");
          setDescription(data.description || "");
          setInputFormat(data.inputFormat || "");
          setOutputFormat(data.outputFormat || "");
          setConstraints(data.constraints || "");
          setSampleInput(data.sampleInput || "");
          setSampleOutput(data.sampleOutput || "");
          setExplanation(data.explanation || "");
          setDifficulty(data.difficulty || "Easy");
          setTags((data.tags || []).join(", "));
          setMarks(data.marks || "");
          setTestCases(data.testCases?.length ? data.testCases : [{ input: "", expectedOutput: "", isHidden: false }]);
        } else {
          toast.error(data.message || "Failed to fetch question");
          onClose();
        }
      } catch {
        toast.error("Error fetching question");
        onClose();
      }
    };
    fetchQuestion();
  }, [questionId, token, onClose]);

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  };

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
      const res = await fetch(`${server}/api/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        toast.success("Question updated");
        onQuestionUpdated(data.updatedQuestion);
        onClose();
      } else {
        toast.error(data.message || "Failed to update question");
      }
    } catch {
      toast.error("Error updating question");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = () => {
    toast.info("AI generating question...");
    setTitle("AI: Prime Number Checker");
    setDescription("Write a program to check if a given number is prime.");
    setInputFormat("Single integer N");
    setOutputFormat("YES if N is prime, otherwise NO");
    setConstraints("1 <= N <= 10^6");
    setSampleInput("7");
    setSampleOutput("YES");
    setExplanation("7 is only divisible by 1 and itself.");
    setDifficulty("Medium");
    setTags("Math, Prime Numbers");
    setTestCases([
      { input: "7", expectedOutput: "YES", isHidden: false },
      { input: "8", expectedOutput: "NO", isHidden: true },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with scroll effect */}
        <div
          className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 transition-all duration-200 ${
            scrolled ? "bg-white shadow-md" : "bg-gray-50"
          }`}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Edit Coding Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable form area */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row overflow-y-auto flex-1"
        >
          {/* Left Column */}
          <div className="flex-1 border-r p-4 md:p-6 space-y-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateWithAI}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow text-sm md:text-base"
              >
                <FaRobot /> Generate with AI
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1">Question Title *</label>
              <input className="w-full border px-3 py-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea className="w-full border px-3 py-2 rounded" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

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

            <div>
              <label className="block font-medium mb-1">Constraints</label>
              <input className="w-full border px-3 py-2 rounded" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
            </div>

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

            <div>
              <label className="block font-medium mb-1">Explanation</label>
              <textarea className="w-full border px-3 py-2 rounded" rows="2" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
            </div>

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

          {/* Right Column - Test Cases */}
          <div className="flex-1 p-4 md:p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
            <p className="text-sm text-gray-500 mb-4">Hidden cases are used for scoring; public ones are shown to users.</p>

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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
