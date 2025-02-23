import React, { useState } from "react";
import { FaCog, FaInfoCircle } from "react-icons/fa";

// Reusable Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <div
      className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-700"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [generalSettings, setGeneralSettings] = useState({
    totalSearchResults: 5,
    internetSearch: false,
    exportHistory: false,
  });
  const [ragSettings, setRagSettings] = useState({
    embeddingModel: "nomic-embed-text",
    chunkSize: 1000,
    chunkOverlap: 200,
    retrievedDocs: 4,
  });

  const handleGeneralChange = (key, value) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleRagChange = (key, value) => {
    setRagSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save all settings as a single JSON payload to /mainsetting
  const saveSettings = async () => {
    const payload = { ...generalSettings, ...ragSettings };
    try {
      const response = await fetch("http://192.168.12.1:8000/main-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("An error occurred while saving settings.");
    }
  };

  // Clear vector settings via /clearvector API after confirmation
  const clearVectorSettings = async () => {
    if (window.confirm("Are you sure you want to clear vector settings?")) {
      try {
        const response = await fetch("http://192.168.12.1:8000/clear-vector-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify("Delete Accepted"),
        });
        if (response.ok) {
          setRagSettings({ embeddingModel: "", chunkSize: 0, chunkOverlap: 0, retrievedDocs: 0 });
          alert("Vector settings cleared successfully!");
        } else {
          alert("Failed to clear vector settings.");
        }
      } catch (error) {
        console.error("Error clearing vector settings:", error);
        alert("An error occurred while clearing vector settings.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-900 p-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <ul className="space-y-2">
          <li
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
              activeTab === "general" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("general")}
          >
            <FaCog />
            <span>General Settings</span>
          </li>
          <li
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
              activeTab === "about" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("about")}
          >
            <FaInfoCircle />
            <span>About</span>
          </li>
        </ul>
      </div>

      {/* Main Content with Scrollable Area */}
      <div className="w-4/5 h-full overflow-y-auto p-6">
        {activeTab === "general" && (
          <>
            <h2 className="text-2xl font-bold mb-6">General Settings</h2>
            <div className="space-y-4">
              {/* Total Search Results */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Total Search Results</span>
                <input
                  type="number"
                  className="bg-gray-700 text-white p-2 rounded w-24"
                  value={generalSettings.totalSearchResults}
                  onChange={(e) => handleGeneralChange("totalSearchResults", e.target.value)}
                />
              </div>
              {/* Internet Search ON by default */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Internet Search ON by default</span>
                <ToggleSwitch
                  checked={generalSettings.internetSearch}
                  onChange={(value) => handleGeneralChange("internetSearch", value)}
                />
              </div>
              {/* Export Chat History, Knowledge Base, and Prompts */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Export Chat History, Knowledge Base, and Prompts</span>
                <ToggleSwitch
                  checked={generalSettings.exportHistory}
                  onChange={(value) => handleGeneralChange("exportHistory", value)}
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-6">RAG Settings</h2>
            <div className="space-y-4">
              {/* Embedding Model */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Embedding Model</span>
                <select
                  className="bg-gray-700 text-white p-2 rounded"
                  value={ragSettings.embeddingModel}
                  onChange={(e) => handleRagChange("embeddingModel", e.target.value)}
                >
                  <option>nomic-embed-text</option>
                  <option>OpenAI Ada</option>
                </select>
              </div>
              {/* Chunk Size */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Chunk Size</span>
                <input
                  type="number"
                  className="bg-gray-700 text-white p-2 rounded w-24"
                  value={ragSettings.chunkSize}
                  onChange={(e) => handleRagChange("chunkSize", e.target.value)}
                />
              </div>
              {/* Chunk Overlap */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Chunk Overlap</span>
                <input
                  type="number"
                  className="bg-gray-700 text-white p-2 rounded w-24"
                  value={ragSettings.chunkOverlap}
                  onChange={(e) => handleRagChange("chunkOverlap", e.target.value)}
                />
              </div>
              {/* Number of Retrieved Documents */}
              <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <span>Number of Retrieved Documents</span>
                <input
                  type="number"
                  className="bg-gray-700 text-white p-2 rounded w-24"
                  value={ragSettings.retrievedDocs}
                  onChange={(e) => handleRagChange("retrievedDocs", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-4 justify-center">
              <button className="bg-green-600 px-4 py-2 rounded" onClick={saveSettings}>
                Save Settings
              </button>
              <button className="bg-red-600 px-4 py-2 rounded" onClick={clearVectorSettings}>
                Clear Vector Settings
              </button>
            </div>
          </>
        )}

        {activeTab === "about" && (
          <>
            <h2 className="text-2xl font-bold mb-6">About</h2>
            <p>This settings panel allows users to configure application preferences, including advanced RAG settings and general options.</p>
            <p className="mt-2">Developed using React and TailwindCSS.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
