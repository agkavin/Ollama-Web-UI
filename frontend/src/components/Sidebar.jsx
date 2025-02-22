import React from "react";
import { MessageSquare, Plus, Settings, X } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, darkMode }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } transition-all duration-300 z-50 ${isOpen ? "w-64" : "-translate-x-full"}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-lg font-semibold">ChatGPT</h2>
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-700 rounded-lg">
          <X size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button className="flex items-center gap-2 w-full p-3 hover:bg-gray-700 rounded-lg">
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        {/* Recent Chats */}
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-400 px-3">Recent Chats</div>
          {["Previous Chat 1", "Previous Chat 2", "Previous Chat 3"].map((chat, index) => (
            <div key={index} className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded-lg cursor-pointer">
              <MessageSquare size={16} />
              <span className="truncate">{chat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded-lg cursor-pointer">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
