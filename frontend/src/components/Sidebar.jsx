import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Sidebar({ toggleSidebar, open }) {
  // close sidebar only on mobile
  const closeSidebar = () => {
    if (window.innerWidth <= 768) toggleSidebar(false);
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
     

      {/* MOBILE OVERLAY */}
      {open && (
        <div className="sidebar-overlay d-md-none" onClick={() => toggleSidebar(false)}></div>
      )}

      {/* SIDEBAR */}
      <div className={`sidebar-container ${open ? "sidebar-open" : ""}`}>
        <div
          className="d-flex flex-column flex-shrink-0 p-3 bg-success text-white shadow " 
          
          style={{ width: "250px", minHeight: "100vh" }}
        >
          <span className="fs-4 fw-bold mb-3  d-md-block">🌿 Varashree Farm</span>

          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link text-white ${
                    isActive ? "active bg-light text-success fw-bold" : "text-white"
                  }`
                }
              >
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/plants"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link text-white ${
                    isActive ? "active bg-light text-success fw-bold" : "text-white"
                  }`
                }
              >
                <i className="bi bi-flower1 me-2"></i> Plant Catalog
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/plants/add"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link text-white ${
                    isActive ? "active bg-light text-success fw-bold" : "text-white"
                  }`
                }
              >
                <i className="bi bi-plus-circle me-2"></i> Add Plant
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/plants/manage"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link text-white ${
                    isActive ? "active bg-light text-success fw-bold" : "text-white"
                  }`
                }
              >
                <i className="bi bi-pencil-square me-2"></i> Manage Plants
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/orders/create"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link text-white ${
                    isActive ? "active bg-light text-success fw-bold" : "text-white"
                  }`
                }
              >
                <i className="bi bi-basket me-2"></i> Create Order
              </NavLink>
            </li>
            <li>
  <NavLink
    to="/purchases"
    onClick={closeSidebar}
    className={({ isActive }) =>
      `nav-link text-white ${
        isActive ? "active bg-light text-success fw-bold" : "text-white"
      }`
    }
  >
    <i className="bi bi-bag-check me-2"></i> Purchases
  </NavLink>
</li>

<li>
  <NavLink
    to="/estimations/create"
    onClick={closeSidebar}
    className={({ isActive }) =>
      `nav-link text-white ${
        isActive ? "active bg-light text-success fw-bold" : "text-white"
      }`
    }
  >
    <i className="bi bi-file-earmark-text me-2"></i> Create Estimation
  </NavLink>
</li>

            <li>
              <NavLink
                to="/reports"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `nav-link text-white ${
                    isActive ? "active bg-light text-success fw-bold" : "text-white"
                  }`
                }
              >
                <i className="bi bi-bar-chart me-2"></i> Reports
              </NavLink>
            </li>
          </ul>
          <div className="text-center small opacity-75 mt-auto">
            © 2025 Varashree Nursery
          </div>
        </div>
      </div>

      {/* DESKTOP SPACE FIXER */}
      <div className="d-none d-md-block" style={{ width: "250px" }}></div>
    </>
  );
}
