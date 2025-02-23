import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, UserCircle, SlidersHorizontal, Sun, Moon, Settings } from "lucide-react";
import SettingsSidebar from "./SettingsSidebar";

const Navbar = ({ toggleSidebar, darkMode, setDarkMode, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [showModelsDropdown, setShowModelsDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Loading..."); // Default text

  // Fetch the current selected model when the component mounts
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await fetch("http://192.168.12.1:8000/get-current-model");
        const data = await response.json();
        console.log("Current Model:", data);
        setSelectedModel(data.get_current_model); // Set the button text
      } catch (error) {
        console.error("Error fetching current model:", error);
        setSelectedModel("Models"); // Fallback text
      }
    };

    fetchCurrentModel();
  }, []); // Runs only on mount

 

  const handleOpenMainSettings = () => {
    navigate("/settings");
  };

  const handleModelsClick = async (e) => {
    e.preventDefault();
    try {
      setShowModelsDropdown(!showModelsDropdown);
      if (!showModelsDropdown) {
        const response = await fetch("http://192.168.12.1:8000/get-models");
        const data = await response.json();
        console.log("Models fetched:", data);
        setModels(data.models || []);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleSelectModel = async (modelName) => {
    try {
      const response = await fetch("http://192.168.12.1:8000/set-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ update_model: modelName }),
      });
      const data = await response.json();
      console.log("Set model response:", data);
      if (data.success) {
        setSelectedModel(modelName); // Update button text after selection
      } else {
        console.error("Error setting model:", data.detail);
      }
    } catch (error) {
      console.error("Error setting model:", error);
    }
    setShowModelsDropdown(false);
  };

  return (
    <div className="h-16 bg-gray-800 text-white flex items-center px-4 justify-between relative">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => {
          setSidebarOpen((prev) => !prev);
          setIsSettingsOpen(false);
        }}
        className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-600"
      >
        <Menu size={20} />
      </button>

      {/* Right-Side Buttons */}
      <div className="absolute top-2 right-4 flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={handleOpenMainSettings}
          className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-600"
        >
          <Settings size={20} />
        </button>

       

        {/* Models Dropdown */}
        <div className="relative">
          <button
            onClick={handleModelsClick}
            className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-600"
          >
            {selectedModel}
          </button>
          {showModelsDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-lg shadow-lg">
              {models.length === 0 ? (
                <div className="px-4 py-2 text-gray-300">No models found</div>
              ) : (
                models.map((model) => (
                  <button
                    key={model}
                    onClick={() => handleSelectModel(model)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-600"
                  >
                    {model}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative group">
          <button className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-600">
            <UserCircle size={20} />
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-lg shadow-lg hidden group-hover:block">
            <p className="px-4 py-2 text-gray-300">Username</p>
            <button className="block w-full px-4 py-2 text-left hover:bg-gray-600">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <SettingsSidebar isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Navbar;
