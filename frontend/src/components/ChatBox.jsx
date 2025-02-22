import React, { useState } from "react";

const ChatComponent = ({ darkMode }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
    { role: "user", content: "Hi! Can you help me with React?" }
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "assistant" ? "bg-gray-800" : "bg-blue-500"} p-4 rounded-lg`}
          >
            <div className="flex-shrink-0 mr-4">
              {message.role === "assistant" ? (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  AI
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white">
                  U
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-4 border rounded-lg focus:outline-none text-black"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;
