import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import PlantCatalog from "./components/PlantCatalog";
import AddPlant from "./components/AddPlant";
import ManagePlants from "./components/ManagePlants";
import CreateOrder from "./components/CreateOrder";
import Reports from "./components/Reports";
import Login from "./components/Login";
import EditPlant from "./components/EditPlant";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("⚠️ Failed to parse user:", err);
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user ? (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
          <Sidebar />
          <main className="flex-grow-1 bg-light">
            <div className="d-flex justify-content-end p-3 bg-white shadow-sm">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            <div className="p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/plants" element={<PlantCatalog />} />
                <Route path="/plants/add" element={<AddPlant />} />
                <Route path="/plants/manage" element={<ManagePlants />} />
                <Route path="/orders/create" element={<CreateOrder />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/plants/edit/:id" element={<EditPlant />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login setUser={setUser} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
