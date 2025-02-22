import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ChatComponent from "./components/ChatBox";


const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} darkMode={darkMode} />
        <div className="flex-1 flex flex-col">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} darkMode={darkMode} setDarkMode={setDarkMode} />
          <ChatComponent darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default App;
