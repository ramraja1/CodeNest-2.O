import { useState, useRef, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import MarkdownMessage from "./MarkdownMessage";

// Initialize SpeechRecognition outside the component
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function NinjaAIChat({
  onClose,
  sendQuery,
  initialQuery = null,
  problemStatement = {},
  server = import.meta.env.VITE_SERVER,
}) {
  const [aiQuery, setAiQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDefaultButtons, setShowDefaultButtons] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- Text-to-Speech Logic (TTS) ---
  const speakResponse = useCallback((text) => {
    if (!("speechSynthesis" in window)) {
      console.error("Browser does not support Text-to-Speech.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleTts = () => {
    if (isTtsEnabled) window.speechSynthesis.cancel();
    setIsTtsEnabled((prev) => !prev);
  };

  // --- Speech Recognition Setup ---
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert(
        "Your browser does not support Speech Recognition. Try Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setAiQuery("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // --- Auto-query on mount if initialQuery is present ---
  useEffect(() => {
    if (initialQuery && chatHistory.length === 0) {
      setIsLoading(true);
      setShowDefaultButtons(false);
      setChatHistory([
        {
          type: "ai",
          text: "Hey! I'm here to help you during your coding practice. I'll start the initial analysis now.",
        },
      ]);
      setTimeout(() => handleSendQuery(initialQuery, true), 100);
    } else if (chatHistory.length === 0) {
      setChatHistory([
        {
          type: "ai",
          text: "Hey! I'm here to help you during your coding practice.",
        },
      ]);
    }
  }, []);

  const handleSendQuery = async (queryText, isInitial = false) => {
    const userQuery = (queryText || aiQuery).trim();
    if (!userQuery) return;

    window.speechSynthesis.cancel();

    setChatHistory((prev) => [...prev, { type: "user", text: userQuery }]);
    setAiQuery("");
    setIsLoading(true);

    let detailedProblemContext = "";
    if (problemStatement && typeof problemStatement === "object") {
      detailedProblemContext = `
Problem Title: ${problemStatement.title || "N/A"}
Problem Description: ${problemStatement.description || "N/A"}
Constraints: ${problemStatement.constraints || "None specified"}
Input Format: ${problemStatement.inputFormat || "N/A"}
Output Format: ${problemStatement.outputFormat || "N/A"}
Sample Input: ${
        problemStatement.sampleInput
          ? `\n${problemStatement.sampleInput}`
          : "N/A"
      }
Sample Output: ${
        problemStatement.sampleOutput
          ? `\n${problemStatement.sampleOutput}`
          : "N/A"
      }
`;
    }

    try {
      let aiText;
      let messagesToSend = [];

      if (isInitial) {
        const initialQueryWithContext = `
Initial Analysis Request: 
${detailedProblemContext}
User's Query: ${userQuery}
`;
        aiText = await sendQuery(initialQueryWithContext);
      } else {
        const contextPrefix = detailedProblemContext
          ? `Problem Statement: ${detailedProblemContext}\n\n`
          : "";
        const queryWithContext = `${contextPrefix}User Query: ${userQuery}`;

        messagesToSend = chatHistory
          .map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.text,
          }))
          .concat({ role: "user", content: queryWithContext });

        const systemPrompt = `You are Ninja AI, a semi-Socratic coding tutor. Your rules are: DO NOT give the complete solution or full code. Focus on hints and guiding questions.`;
        messagesToSend.unshift({ role: "system", content: systemPrompt });

        const response = await fetch(`${server}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messagesToSend }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `API failed with status ${response.status}: ${
              errorData.error || response.statusText
            }`
          );
        }

        const data = await response.json();
        aiText = data.reply;
      }

      if (isTtsEnabled && aiText) {
        const cleanText = aiText.replace(/(\*\*|__|`)/g, "");
        speakResponse(cleanText);
      }

      setChatHistory((prev) => [...prev, { type: "ai", text: aiText }]);
    } catch (e) {
      console.error("AI chat error:", e);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          text: `AI service failed. Please try again. (${e.message})`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (query) => {
    handleSendQuery(query);
    setShowDefaultButtons(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendQuery();
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const isDisabled = isLoading || isListening;

  return (
    <div className="absolute top-12 right-2 z-50 w-[28rem] h-[36rem] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-orange-500" />
          <span className="text-white font-semibold">Ninja AI</span>
        </div>
        <div className="flex items-center gap-1">
          {/* TTS Button */}
          <button
            onClick={toggleTts}
            title={
              isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"
            }
            className={`p-1 rounded transition ${
              isTtsEnabled
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "hover:bg-gray-700 text-gray-400"
            }`}
          >
            {isTtsEnabled ? (
              <SpeakerWaveIcon className="h-5 w-5" />
            ) : (
              <SpeakerXMarkIcon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 text-white transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div
        ref={chatBodyRef}
        className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar"
      >
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                message.type === "user"
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-tl-none"
              }`}
            >
              {message.type === "user" ? (
                message.text
              ) : (
                <MarkdownMessage content={message.text} />
              )}
            </div>
          </div>
        ))}

        {showDefaultButtons && chatHistory.length <= 1 && (
          <div className="mt-2 flex flex-col gap-2">
            <button
              onClick={() =>
                handleQuickQuery("Need help in understanding problem statement")
              }
              className="flex items-center gap-2 p-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition text-left justify-center"
            >
              <LightBulbIcon className="h-4 w-4 text-yellow-500" />
              Need help in understanding problem statement
            </button>
            <button
              onClick={() =>
                handleQuickQuery("Need help with logic / approach")
              }
              className="flex items-center gap-2 p-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition text-left justify-center"
            >
              <WrenchScrewdriverIcon className="h-4 w-4 text-red-500" />
              Need help with logic / approach
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 max-w-[85%] px-3 py-2 rounded-xl text-sm bg-gray-700 text-white rounded-tl-none">
              <SparklesIcon className="h-5 w-5 text-orange-500 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex items-center">
        <button
          onClick={toggleListening}
          disabled={isDisabled}
          title={isListening ? "Stop Listening" : "Start Voice Command"}
          className={`p-2 transition ${
            isDisabled
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : isListening
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          <MicrophoneIcon
            className={`h-5 w-5 ${isListening ? "animate-pulse" : ""}`}
          />
        </button>

        <input
          type="text"
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            isListening
              ? "Listening..."
              : isLoading
              ? "Please wait for response..."
              : "Ask your doubt"
          }
          disabled={isDisabled}
          className={`flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 ${
            isDisabled ? "text-gray-400 cursor-wait" : "focus:ring-emerald-500"
          } text-sm`}
        />

        <button
          onClick={() => handleSendQuery()}
          disabled={!aiQuery.trim() || isDisabled}
          className={`p-2 rounded-r-lg transition ${
            aiQuery.trim() && !isDisabled
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          } text-white`}
        >
          <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
        </button>
      </div>
      <p className="text-xs text-center text-gray-500 p-1">
        Ninja AI can make mistakes, please double-check
      </p>
    </div>
  );
}
