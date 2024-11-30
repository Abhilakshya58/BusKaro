import React, { useState } from "react";
import "../resources/layout.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector((state) => state.users);

  const userMenu = [
    { name: "Home", path: "/", icon: "ri-home-3-line" },
    { name: "Bookings", path: "/bookings", icon: "ri-file-list-3-line" },
    { name: "Profile", path: "/profile", icon: "ri-user-3-line" },
    { name: "Logout", path: "/logout", icon: "ri-logout-circle-line" },
  ];

  const adminMenu = [
    { name: "Home", path: "/", icon: "ri-home-3-line" },
    { name: "Buses", path: "/admin/Buses", icon: "ri-bus-line" },
    { name: "Users", path: "/admin/users", icon: "ri-user-3-line" },
    { name: "Bookings", path: "/admin/bookings", icon: "ri-file-list-3-line" },
    { name: "Logout", path: "/logout", icon: "ri-logout-circle-line" },
  ];

  const menuToBeRendered = user?.isAdmin ? adminMenu : userMenu;
  let activeRoute = window.location.pathname;

  if (window.location.pathname.includes("book-now")) {
    activeRoute = "/";
  }

  return (
    <div className="layout-parent">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <h1 className="logo">BusKaro</h1>
        </div>
        <div
          className="navbar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <i className="ri-close-line"></i> : <i className="ri-menu-2-line"></i>}
        </div>
        <div className={`navbar-links ${collapsed ? "expanded" : ""}`}>
          {/* Close Button for Mobile */}
          {collapsed && (
            <div className="close-button" onClick={() => setCollapsed(false)}>
              <i className="ri-close-line"></i>
            </div>
          )}
          {menuToBeRendered.map((item, index) => (
            <div
              key={index}
              className={`navbar-item ${
                activeRoute === item.path ? "active-menu-item" : ""
              }`}
              onClick={() => {
                if (item.path === "/logout") {
                  localStorage.removeItem("token");
                  navigate("/login");
                } else {
                  navigate(item.path);
                }
                setCollapsed(false); // Close menu on selection
              }}
            >
              <i className={item.icon}></i>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
        <div className="navbar-user">
          <h1>
            {user.name} <span className="role">({user?.isAdmin ? "Admin" : "User"})</span>
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="content">{children}</div>
    </div>
  );
};

export default DefaultLayout;
