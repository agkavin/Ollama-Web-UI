import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ChatComponent from "./components/ChatBox";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = 250; // Sidebar width when open
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen">
        {/* Sidebar container with smooth width transition */}
        <div
          style={{
            width: sidebarOpen ? sidebarWidth : 0,
            transition: "width 0.5s ease",
            overflow: "hidden" // Prevent sidebar content from spilling out when closed
          }}
        >
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            darkMode={darkMode}
          />
        </div>
        
        {/* Chat and Navbar container */}
        <div className="flex-1 flex flex-col">
          <Navbar
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
          <ChatComponent darkMode={darkMode} sidebarOpen={sidebarOpen} />
        </div>
      </div>
    </div>
  );
};

export default App;
