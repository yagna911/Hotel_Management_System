import React from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaUserShield,
  FaHotel,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import logo from "../../assets/shnoor-logo.jpeg";

import "./SuperAdminSidebar.css";

function SuperAdminSidebar() {
  return (
    <aside className="super-admin-sidebar">

      {/* =====================================================
          SIDEBAR HEADER
      ===================================================== */}

      <div className="super-admin-sidebar-header">

        <img
          src={logo}
          alt="Shnoor Hotel"
          className="super-admin-sidebar-logo"
        />

        <div className="super-admin-brand-text">
          <h2>SHNOOR</h2>
          <p>Hotel Management System</p>
        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="super-admin-navigation">

        <p className="super-admin-nav-title">
          Main Menu
        </p>


        {/* Dashboard */}

        <NavLink
          to="/super-admin-dashboard"
          className={({ isActive }) =>
            `super-admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaHome />
          <span>Dashboard</span>
        </NavLink>


        {/* Users */}

        <NavLink
          to="/super-admin/users"
          className={({ isActive }) =>
            `super-admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaUsers />
          <span>Users</span>
        </NavLink>


        {/* Admin Management */}

        <NavLink
          to="/super-admin/admins"
          className={({ isActive }) =>
            `super-admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaUserShield />
          <span>Admin Management</span>
        </NavLink>


        {/* Hotels */}

        <NavLink
          to="/super-admin/hotels"
          className={({ isActive }) =>
            `super-admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaHotel />
          <span>Hotels</span>
        </NavLink>


        {/* Reports */}

        <NavLink
          to="/super-admin/reports"
          className={({ isActive }) =>
            `super-admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaChartBar />
          <span>Reports</span>
        </NavLink>


        {/* =====================================================
            ACCOUNT
        ===================================================== */}

      

        
      </nav>


      {/* =====================================================
          SIDEBAR FOOTER
      ===================================================== */}

      <div className="super-admin-sidebar-footer">

        <button
          type="button"
          className="super-admin-logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default SuperAdminSidebar;