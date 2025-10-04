import React, { useEffect, useState } from "react";
import logo from "/logo.png";

const Header = ({ onLogout }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  return (
    <header className="w-full bg-teal-600 shadow-md rounded-t-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-3">

          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-2xl font-bold text-white tracking-wide truncate">
            IMS Fest Entry Portal
          </h1>
        </div>

        {username && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="text-white font-medium truncate max-w-xs">
              👤 {username}
            </span>
            <button
              onClick={onLogout}
              className="bg-white text-teal-600 px-3 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
