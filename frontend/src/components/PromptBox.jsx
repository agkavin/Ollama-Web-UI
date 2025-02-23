import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPlus } from "react-icons/fi";

const PromptInputBox = ({ darkMode, onSend }) => {
  const [input, setInput] = useState("");
  const textAreaRef = useRef(null);

  // Auto-resize the textarea based on its scrollHeight
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Pass the input text back to ChatComponent
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center px-4 py-2">
      {/* Plus icon on the left */}
      <div className="absolute left-10 flex items-center">
        <FiPlus size={20} className={`cursor-pointer ${darkMode ? "text-white" : "text-gray-900"}`} />
      </div>

      {/* Auto-resizing Textarea */}
      <textarea
        ref={textAreaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        rows={1}
        className={`w-full pl-10 pr-12 py-3 rounded-full focus:outline-none resize-none transition-all duration-200 
          ${darkMode ? "bg-gray-800 text-white placeholder-gray-400" : "bg-gray-200 text-gray-900 placeholder-gray-500"}`}
      />

      {/* Send icon on the right */}
      <button type="submit" className="absolute right-10 bg-white p-2 rounded-full">
        <FiSend
          size={20}
          className={`cursor-pointer transition-transform duration-200 hover:scale-110 ${darkMode ? "text-white" : "text-gray-900"}`}
        />
      </button>
    </form>
  );
};

export default PromptInputBox;
