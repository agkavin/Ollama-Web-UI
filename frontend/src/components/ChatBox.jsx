import React, { useState } from "react";
import PromptInputBox from "./PromptBox";

const ChatComponent = ({ darkMode }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
    { role: "user", content: "Hi! Can you help me with React?" },
    { role: "user", content: "Hi! Can you help me with React?" }
  ]);

  // Callback to add a new message from the input box
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    setMessages([...messages, { role: "user", content: text }]);
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "assistant"
                ? "bg-gray-800 mr-10"
                : "bg-blue-500 ml-10"
            } p-4 rounded-lg`}
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

      {/* Input area styled like ChatGPT's prompt */}
      <PromptInputBox darkMode={darkMode} onSend={handleSendMessage} />
    </div>
  );
};

export default ChatComponent;
