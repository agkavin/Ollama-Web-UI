import React from "react";
import { X } from "lucide-react";

const SettingsSidebar = ({ isOpen, onClose }) => {
  return (
    <div>
      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-64 bg-gray-800 text-white transform transition-transform shadow-lg ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Settings Options */}
        <div className="p-4">
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-lg">Option 1</button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-lg">Option 2</button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-lg">Option 3</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
