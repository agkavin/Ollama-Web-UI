import React, { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";

const ChatComponent = ({ darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(localStorage.getItem("selectedChat") || "");

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
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedChat(localStorage.getItem("selectedChat") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;
    try {
      const response = await fetch("http://192.168.12.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      console.log(data);
      const newMessages = [
        ...messages,
        { role: "user", content: input },
        { role: "assistant", content: data["text"] },
      ];
      setMessages(newMessages);
      localStorage.setItem(selectedChat, JSON.stringify(newMessages));
      console.log(localStorage.getItem(selectedChat));
      setInput("");
    } catch (e) {
      console.error("Error:", e);
    }
    setInput("");
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-center ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md ${
                message.role === "assistant"
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "bg-blue-500 text-white dark:bg-blue-600"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;