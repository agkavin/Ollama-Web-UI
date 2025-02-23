import React from "react";
import { Routes, Route } from "react-router-dom";

import App from "./App"; // Import your main App component
import SettingsPage from "./components/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App/>} />
      <Route path="/settings" element={<SettingsPage/>} />
    </Routes>
  );
};

export default AppRoutes;
