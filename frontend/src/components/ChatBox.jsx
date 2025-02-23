

import React, { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";

const ChatComponent = ({ darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(localStorage.getItem("selectedChat") || "");

  // Load messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;
    const storedMessages = localStorage.getItem(selectedChat);
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error("Error parsing stored messages:", error);
      }
    } else {
      setMessages([]); // If no messages, reset to empty
    }
  }, [selectedChat]);

  // Listen for selectedChat updates from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedChat(localStorage.getItem("selectedChat") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSubmit = async (e) =>  {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;
    try{
      const response = await fetch("http://192.168.12.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      console.log(data);
      const newMessages = [...messages, { role: "user", content: input }, {role: "assistant", content: data['text']}];
    setMessages(newMessages);
    localStorage.setItem(selectedChat, JSON.stringify(newMessages));
    console.log(localStorage.getItem(selectedChat));
    setInput("");
    }catch(e){

    }
    setInput("");
    
  };

  return (
    <div
    className={`flex flex-col h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}

    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "assistant" ? "bg-gray-300 mr-10" : "bg-blue-500 ml-10"} p-4 rounded-lg`}

          >
            <div className="flex-shrink-0 mr-4">
              {message.role === "assistant" ? (
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-black">AI</div>
              ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white">U</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            
            placeholder="Type your message..."
            className="flex-1 p-4 border rounded-lg focus:outline-none text-black "
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded-lg">
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;
