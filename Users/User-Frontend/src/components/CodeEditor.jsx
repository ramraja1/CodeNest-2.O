import {
  AcademicCapIcon,
  PlayIcon,
  RocketLaunchIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import NinjaAIChat from "./NinjaAIChat";
import Popup from "./PopupPaste";
import { useIndianFemaleVoice } from "./useIndianVoice";

// Boilerplate templates
const boilerplates = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  python: `# Your code here
print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`,
};

export default function CodeEditor({
  language = "cpp",
  theme = "dark",
  value = "",
  onChange,
  onRun,
  onSubmit,
  allowFullscreen = true,
  fullEditor,
  setFullEditor,
  problemStatement,
}) {
  const editorRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isTeacherActive, setIsTeacherActive] = useState(false);
  const [teacherMessage, setTeacherMessage] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const server = import.meta.env.VITE_SERVER;

  // Initialize speech synthesis
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Auto-speak when teacher message changes
  useEffect(() => {
    if (isTeacherActive && teacherMessage && isSpeechEnabled) {
      speakTeacherMessage(teacherMessage);
    }
  }, [teacherMessage, isTeacherActive, isSpeechEnabled]);

  // Show Popup Modal
  const showPopup = (msg) => {
    setPopupMessage(msg);
  };

  const antiCheatMessages = [
    "🧠 Your brain is the best IDE. Code it yourself!",
    "✨ Build your own solution. That's how legends are made.",
    "🚫 Copying code is a bug in integrity. Please don't.",
    "🔑 The real learning is in the struggle. Keep coding!",
    "🛑 That's a shortcut to failure. Own your code!",
    "🚫 Great coder, don’t cheat!",
  ];

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * antiCheatMessages.length);
    return antiCheatMessages[randomIndex];
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Disable Ctrl+V paste
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      showPopup(getRandomMessage()); // Use a random message
    });

    // Disable native paste as well
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener("paste", (e) => {
        e.preventDefault();
        showPopup(getRandomMessage()); // Use a random message
      });
    }
  };

  const handleLanguageChange = (newLang) => {
    onChange("language", newLang);
    if (boilerplates[newLang]) {
      onChange("code", boilerplates[newLang]);
    }
  };

  const handleCompileWithTeacher = async () => {
    // Stop any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // 1. Check for empty code
    if (!value.trim()) {
      setTeacherMessage("Beta, pehle thoda code likho. Editor khaali hai.");
      setIsTeacherActive(true);
      return;
    }

    try {
      // 2. Prepare context for AI analysis
      const context = `
Problem: ${problemStatement?.description || "Coding contest problem"}
Language: ${language}
User Code:
${value}

Analyze this code and give friendly, supportive feedback in Hinglish.
Crucially, provide only HINTS or point out specific mistakes (e.g., missing semicolon).
Do NOT under any circumstances provide the correct code or solution.
Keep the response to 1-2 sentences maximum.`;

      const messages = [
        {
          role: "system",
          content: `You are a helpful, supportive Indian coding teacher. 
Your SOLE purpose is to provide short, non-solution-based hints or error pointers.
RULES TO FOLLOW STRICTLY:
1. Speak only in conversational Hinglish (Hindi + English mix).
2. **Limit response to a maximum of TWO lines/sentences.**
3. **DO NOT provide any part of the correct code, the full solution, or a complete algorithm.**
4. Give only HINTS, GUIDANCE, or point out specific low-level mistakes (like 'missing bracket', 'wrong variable name').
5. Use friendly, encouraging words like 'beta', 'dhyān se dekho', 'check karo', 'Shabash!'
Examples of acceptable response length and style:
- "Beta, line 7 pe semicolon missing hai, dhyan se check karo."
- "Logic theek hai, par loop condition thoda galat lag raha hai. Dekh lo."
- "Shabash! Syntax bilkul sahi hai. Ab run karke final output dekho."`,
        },
        { role: "user", content: context },
      ];

      // 3. Show 'analyzing' message
      setTeacherMessage("Code check kar rahi hoon...");
      setIsTeacherActive(true);

      // 4. Call the AI API
      let response = await fetch(`${server}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error("API issue");

      let data = await response.json();
      let aiResponse = data.reply?.trim();

      if (!aiResponse) throw new Error("Empty AI response");

      // 5. Clean and truncate the response (Max 150 characters is a good proxy for 1-2 lines)
      const cleanResponse = aiResponse
        .replace(/[#*`~>]/g, "")
        .replace(/\n+/g, " ") // Convert newlines to spaces for a single line of text
        // .slice(0, 150)
        .trim();

      setTeacherMessage(cleanResponse);
    } catch (err) {
      // 6. Fallback logic (Unchanged, as it's solid)
      console.error("Teacher AI Error:", err);

      // Existing static analysis fallback logic goes here...
      const errors = analyzeCode(value, language);
      if (errors.length > 0) {
        const { type, line } = errors[0];
        if (type === "syntax_error") {
          setTeacherMessage(
            `Beta, line ${line} pe syntax error hai. Dhyan se dekho.`
          );
        } else {
          setTeacherMessage(
            `Beta, logic mein dikkat lag rahi hai. Line ${line} check karo.`
          );
        }
      } else {
        setTeacherMessage(
          "Wah beta! Code ka structure sahi lag raha hai. Ab khud run karke check karo."
        );
      }
    }

    setIsTeacherActive(true);
  };

  // ✅ Indian Female Voice
  const indianVoice = useIndianFemaleVoice();

  const speakTeacherMessage = (message) => {
    if ("speechSynthesis" in window && isSpeechEnabled) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(message);
      speech.rate = 0.95;
      speech.pitch = 1.0;
      speech.volume = 1;

      if (indianVoice) {
        speech.voice = indianVoice;
        speech.lang = indianVoice.lang || speech.lang; 
      }

      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(speech);
    }
  };

  const handleManualSpeak = () => {
    if (teacherMessage) {
      speakTeacherMessage(teacherMessage);
    }
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled && teacherMessage) {
      speakTeacherMessage(teacherMessage);
    }
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Basic static analysis
  const analyzeCode = (code, lang) => {
    const errors = [];
    if (!code.trim()) return errors;

    if (lang === "cpp" || lang === "java") {
      const lines = code.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        if (
          trimmedLine &&
          !trimmedLine.startsWith("//") &&
          !trimmedLine.startsWith("#") &&
          !trimmedLine.endsWith(";") &&
          !trimmedLine.endsWith("{") &&
          !trimmedLine.endsWith("}")
        ) {
          errors.push({
            type: "syntax_error",
            message: "Missing semicolon",
            line: i + 1,
          });
          break;
        }
      }
      const openBrackets = (code.match(/{/g) || []).length;
      const closeBrackets = (code.match(/}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push({
          type: "syntax_error",
          message: "Unbalanced brackets",
          line: 1,
        });
      }
    }

    if (lang === "python") {
      if (code.includes("    ") && code.includes("\t")) {
        errors.push({
          type: "syntax_error",
          message: "Mixed tabs and spaces",
          line: 1,
        });
      }
    }

    return errors;
  };

  return (
    <section
      className={`flex flex-col bg-gray-800 w-full relative ${
        fullEditor
          ? "fixed inset-0 z-50 p-2 w-full"
          : "w-full min-w-[360px] p-2 border-l border-gray-700"
      } rounded-md shadow-lg h-full`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-2 justify-between">
        {/* Language Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-white font-semibold">Language:</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            onClick={toggleSpeech}
            className={`p-2 rounded font-semibold transition flex items-center gap-1 ${
              isSpeechEnabled
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-blue-400"
            }`}
          >
            {isSpeechEnabled ? (
              <SpeakerWaveIcon className="h-4 w-4" />
            ) : (
              <SpeakerXMarkIcon className="h-4 w-4" />
            )}
            <span className="text-xs hidden sm:inline">
              {isSpeechEnabled ? "Audio On" : "Audio Off"}
            </span>
          </button>

          {/* Compile Code */}
          <button
            onClick={handleCompileWithTeacher}
            className={`p-2 rounded font-semibold transition flex items-center gap-1 ${
              isTeacherActive
                ? "bg-green-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-green-400"
            }`}
          >
            <AcademicCapIcon className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Compile Code</span>
          </button>

          {/* AI Help */}
          <button
            onClick={() => setIsAiPanelOpen((prev) => !prev)}
            className={`p-2 rounded font-semibold transition flex items-center gap-1 ${
              isAiPanelOpen
                ? "bg-orange-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-orange-500"
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">AI Help</span>
          </button>

          {fullEditor && (
            <button
              onClick={() => setFullEditor(false)}
              className="p-2 rounded hover:bg-gray-700 text-white transition flex items-center gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {isTeacherActive && (
        <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <AcademicCapIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-800 font-semibold">
                    Ma'am ki Salah! 💡
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      <SpeakerWaveIcon className="h-3 w-3" />
                      Audio Guidance
                    </span>
                  )}
                </div>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {teacherMessage}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-2">
              {isSpeaking ? (
                <button
                  onClick={stopSpeech}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
                >
                  <SpeakerXMarkIcon className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  onClick={handleManualSpeak}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                >
                  <SpeakerWaveIcon className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">Audio</span>
                </button>
              )}
              <button
                onClick={() => {
                  stopSpeech();
                  setIsTeacherActive(false);
                }}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 min-h-0 w-full rounded overflow-hidden border-2 border-gray-700">
        <MonacoEditor
          height="100%"
          width="100%"
          language={language}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={value}
          onChange={(val) => onChange("code", val)}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            contextmenu: false,
            smoothScrolling: true,
            padding: { top: 6, bottom: 6 },
          }}
        />
      </div>

      {/* Run & Submit */}
      <div className="mt-4 flex gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-semibold text-white"
          onClick={onRun}
        >
          <PlayIcon className="h-4 w-4" />
          <span>Run Code</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 py-2 rounded font-semibold text-white"
          onClick={onSubmit}
        >
          <RocketLaunchIcon className="h-4 w-4" />
          <span>Submit Solution</span>
        </button>
      </div>

      {/* AI Panel */}
      {isAiPanelOpen && (
        <NinjaAIChat
          onClose={() => setIsAiPanelOpen(false)}
          problemStatement={problemStatement}
        />
      )}

      {/* Popup */}
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </section>
  );
}
