import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import NotFound from "../pages/NotFound.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Dashboard />} />
      <Route path="/tasks" element={<Dashboard />} />
      <Route path="/tasks/today" element={<Dashboard />} />
      <Route path="/tasks/upcoming" element={<Dashboard />} />
      <Route path="/tasks/completed" element={<Dashboard />} />

      <Route path="/categories" element={<Dashboard />} />
      <Route path="/projects" element={<Dashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
