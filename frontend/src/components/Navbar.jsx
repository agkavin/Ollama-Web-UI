import React from "react";
import { Menu, UserCircle, Sun, Moon } from "lucide-react";

const Navbar = ({ toggleSidebar, darkMode, setDarkMode }) => {
  return (
    <div className="h-16 bg-gray-800 text-white flex items-center px-4 justify-between">
      {/* Sidebar Toggle */}
      <button onClick={toggleSidebar} className="p-2 hover:bg-gray-700 rounded-lg">
        <Menu size={20} />
      </button>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Profile Icon */}
        <button className="p-2 hover:bg-gray-700 rounded-lg">
          <UserCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
