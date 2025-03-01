import React from "react";
import "../style/Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            {/* Brand/Logo */}
            <div className="navbar-brand">
              Agrimap
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                <a href="#" className="navbar-link">Home</a>
                <a href="#" className="navbar-link">About</a>
            </div>

            {/* Optional Action Button */}
            <div>
                <button className="navbar-button">Explore</button>
            </div>
        </nav>
    );
};

export default Navbar;