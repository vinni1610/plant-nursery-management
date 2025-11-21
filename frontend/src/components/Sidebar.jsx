import React from "react";
import { NavLink } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Sidebar() {
  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 bg-success text-white shadow"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <a
        href="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <span className="fs-4 fw-bold">🌿 Varashree Farm</span>
      </a>
      <hr className="border-light" />

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "active bg-light text-success fw-bold" : "text-white"}`
            }
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/plants"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "active bg-light text-success fw-bold" : "text-white"}`
            }
          >
            <i className="bi bi-flower1 me-2"></i> Plant Catalog
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/plants/add"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "active bg-light text-success fw-bold" : "text-white"}`
            }
          >
            <i className="bi bi-plus-circle me-2"></i> Add Plant
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/plants/manage"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "active bg-light text-success fw-bold" : "text-white"}`
            }
          >
            <i className="bi bi-pencil-square me-2"></i> Manage Plants
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/orders/create"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "active bg-light text-success fw-bold" : "text-white"}`
            }
          >
            <i className="bi bi-basket me-2"></i> Create Order
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "active bg-light text-success fw-bold" : "text-white"}`
            }
          >
            <i className="bi bi-bar-chart me-2"></i> Reports
          </NavLink>
        </li>
      </ul>

      <hr className="border-light" />
      <div className="text-center small opacity-75">© 2025 Varashree Nursery</div>
    </div>
  );
}
