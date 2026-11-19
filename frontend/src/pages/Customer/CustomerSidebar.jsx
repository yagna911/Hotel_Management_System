import React from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaCalendarCheck,
  FaBed,
  FaConciergeBell,
  FaCreditCard,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import logo from "../../assets/shnoor-logo.jpeg";

import "./CustomerSidebar.css";

function CustomerSidebar() {
  return (
    <aside className="customer-sidebar">

      {/* =========================================
          SIDEBAR HEADER
      ========================================= */}

      <div className="customer-sidebar-header">

        <img
          src={logo}
          alt="Shnoor Hotel"
          className="customer-sidebar-logo"
        />

        <div className="customer-brand-text">
          <h2>SHNOOR</h2>
          <p>Hotel Management System</p>
        </div>

      </div>


      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav className="customer-navigation">

        {/* MAIN MENU */}

        <p className="customer-nav-title">
          Main Menu
        </p>


        {/* =========================================
            DASHBOARD
        ========================================= */}

        <NavLink
          to="/customer-dashboard"
          className={({ isActive }) =>
            `customer-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaHome />
          <span>Dashboard</span>
        </NavLink>


        {/* =========================================
            MY BOOKINGS
        ========================================= */}

        <NavLink
          to="/customer/bookings"
          className={({ isActive }) =>
            `customer-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaCalendarCheck />
          <span>My Bookings</span>
        </NavLink>


        {/* =========================================
            ROOMS
        ========================================= */}

        <NavLink
          to="/customer/rooms"
          className={({ isActive }) =>
            `customer-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaBed />
          <span>Rooms</span>
        </NavLink>


        {/* =========================================
            MY SERVICES
        ========================================= */}

        <NavLink
          to="/customer/services"
          className={({ isActive }) =>
            `customer-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaConciergeBell />
          <span>My Services</span>
        </NavLink>


        {/* =========================================
            PAYMENTS
        ========================================= */}

        <NavLink
          to="/customer/payments"
          className={({ isActive }) =>
            `customer-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaCreditCard />
          <span>Payments</span>
        </NavLink>


        {/* =========================================
            ACCOUNT
        ========================================= */}

        <p className="customer-nav-title customer-account-title">
          Account
        </p>


        {/* =========================================
            MY PROFILE
        ========================================= */}

        <NavLink
          to="/customer/profile"
          className={({ isActive }) =>
            `customer-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaUser />
          <span>My Profile</span>
        </NavLink>


        

      </nav>


      {/* =========================================
          SIDEBAR FOOTER
      ========================================= */}

      <div className="customer-sidebar-footer">

        <button
          type="button"
          className="customer-logout-btn"
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

export default CustomerSidebar;