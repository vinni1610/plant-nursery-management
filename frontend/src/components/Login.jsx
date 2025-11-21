import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({setUser}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", { email, password });

      console.log("✅ Backend response:", res.data);

      // ✅ Store token & user data safely
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
        })
      );
     setUser({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
      });
      // ✅ Navigate to dashboard
      navigate("/");
    } catch (err) {
      console.error("❌ Login request failed:", err);
      const message =
        err?.response?.data?.error || "Invalid email or password";
      setError(message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "#f0fff4" }}
    >
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h4 className="text-center text-success mb-3">🌿 Nursery Login</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button className="btn btn-success w-100">Login</button>
        </form>
      </div>
    </div>
  );
}
