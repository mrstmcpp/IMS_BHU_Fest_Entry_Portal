import React from "react";
import { Link } from "react-router-dom";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";

const SecretPage = ({ token, onLogout }) => {
  const pages = [
    { title: "Secret Register", path: "/mrstm/secret-register", color: "bg-indigo-600 hover:bg-indigo-700" },
    { title: "Create New Pass", path: "/meraj/secret-pass-creation", color: "bg-green-600 hover:bg-green-700" },
    { title: "Search By Elixir ID", path: "/search", color: "bg-orange-600 hover:bg-orange-700" },
    { title: "Scan By QR", path: "/scan", color: "bg-pink-600 hover:bg-pink-700" },
    { title: "Analytics (Scan Count)", path: "/analytics", color: "bg-purple-600 hover:bg-purple-700" },
    { title: "Free One Entry", path: "/mrstm/free-entry", color: "bg-gray-600 hover:bg-gray-700" },
    { title: "Free Multiple Entries", path: "/mrstm/free-multiple-entries", color: "bg-red-600 hover:bg-red-700" },
    { title: "Free All Entries", path: "/mrstm/free-all-entries", color: "bg-yellow-600 hover:bg-yellow-700" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-xl text-center">
        <Header />

        <h2 className="text-3xl font-bold text-gray-900">IMS Fest Control Panel</h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage passes, scanning, and analytics from one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {pages.map((page, index) => (
            <Link
              key={index}
              to={page.path}
              className={`${page.color} px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400 cursor-pointer shadow-md transition duration-200`}
            >
              {page.title}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={onLogout}
            className="px-6 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow hover:bg-rose-700 cursor-pointer"
          >
            Logout
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default SecretPage;
