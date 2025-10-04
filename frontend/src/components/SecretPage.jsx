import React from "react";
import { Link } from "react-router-dom";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";

const SecretPage = ({ token, onLogout }) => {
  const pages = [
    { title: "Create a scanner account", path: "/mrstm/secret-register" },
    { title: "Create New Pass", path: "/meraj/secret-pass-creation" },
    { title: "Search By Elixir ID", path: "/search" },
    { title: "Scan By QR", path: "/scan" },
    { title: "Analytics (Scan Count)", path: "/analytics" },
    { title: "Free One Entry", path: "/mrstm/free-entry" },
    { title: "Free Multiple Entries", path: "/mrstm/free-multiple-entries" },
    {
      title: "Free All Entries",
      path: "/mrstm/free-all-entries",
      special: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      <Header onLogout={onLogout} />


      <div className="flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            IMS Fest Control Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage passes, scanning, and analytics from one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {pages.map((page, index) => (
              <Link
                key={index}
                to={page.path}
                className={`px-4 py-2 text-white rounded-md shadow-md transition duration-200 cursor-pointer
      ${
        page.special
          ? "bg-yellow-600 hover:bg-yellow-700"
          : "bg-teal-600 hover:bg-teal-700"
      }`}
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

      {/* ✅ Footer stays at bottom */}
    </div>
  );
};

export default SecretPage;
