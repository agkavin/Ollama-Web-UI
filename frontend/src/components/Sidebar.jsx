import React, { useEffect, useState } from "react";
import { MessageSquare, Plus, Settings, X } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, darkMode }) => {
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem("chatList");
    return storedMessages ? JSON.parse(storedMessages) : [];
  });

  useEffect(() => {
    localStorage.setItem("chatList", JSON.stringify(messages));
  }, [messages]);

  const updateMessages = () => {
    const newMessage = {
      id: crypto.randomUUID(),
      title: "New Chat: " + (messages.length + 1),
      createdAt: Date.now(),
    };
    const updatedMessages = [...messages, newMessage];

    localStorage.setItem("chatList", JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
  };

  const selectChat = (id) => {
    localStorage.setItem("selectedChat", id);
    window.dispatchEvent(new Event("storage")); // Notify ChatComponent
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 transition ease-in-out ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } transform transition-transform duration-500 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } flex flex-col`}
    >
      {/* Header - Fixed */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-lg font-semibold">Ollama-Web-UI</h2>
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-700 rounded-lg">
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)] p-4">
        <button
          className="flex items-center gap-2 w-full p-3 hover:bg-gray-700 rounded-lg"
          onClick={updateMessages}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        {/* Recent Chats */}
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-400 px-3">Recent Chats</div>
          {messages.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
              onClick={() => selectChat(chat.id)}
            >
              <MessageSquare size={16} />
              <span className="truncate">{chat.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded-lg cursor-pointer">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
