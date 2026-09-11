import React, { useState } from "react";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import {

  FiGrid,

  FiPackage,

  FiPlusCircle,

  FiShoppingBag,

  FiLogOut,

  FiExternalLink,

  FiMenu,

  FiX

} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import logo from "../../pages/admin/logo.jpeg";



export default function AdminLayout() {

  const { signOut } = useAuth();

  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const handleSignOut = async () => {

    await signOut();

    navigate("/admin/adminlogin");

  };



  const navItems = [

    { name: "Dashboard", path: "/admindashboard", icon: FiGrid, end: true },

    { name: "Products", path: "/admindashboard/products", icon: FiPackage, end: true },

    { name: "Add Product", path: "/admindashboard/products/new", icon: FiPlusCircle, end: false },

    { name: "Orders", path: "/admindashboard/orders", icon: FiShoppingBag, end: false },

  ];



  return (

    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50 antialiased">

      {/* Mobile Top Navigation Bar */}

      <header className="md:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">

        <div className="flex items-center gap-3">

          <div className="p-1 bg-gray-900 rounded-xl shrink-0">

            <img

              src={logo}

              alt="Gladys' Closet Logo"

              className="w-8 h-8 object-cover rounded-lg"

            />

          </div>

          <div>

            <h2 className="text-sm font-black text-gray-900 leading-tight">

              Gladys' Closet

            </h2>

            <p className="text-[10px] text-purple-700 font-semibold">

              Admin Console

            </p>

          </div>

        </div>



        <button

          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

          className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"

          aria-label="Toggle Navigation Menu"

        >

          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}

        </button>

      </header>



      {/* Backdrop for Mobile Sidebar */}

      {isMobileMenuOpen && (

        <div

          onClick={() => setIsMobileMenuOpen(false)}

          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"

        />

      )}



      {/* Responsive Sidebar (Slide-over on Mobile, Sticky on Desktop) */}

      <aside

        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-5 h-screen shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${

          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"

        }`}

      >

        <div className="space-y-6">

          {/* Brand Header */}

          <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-gray-100">

            <div className="flex items-center gap-3">

              <div className="p-1 bg-gray-900 rounded-xl shadow-sm shrink-0">

                <img

                  src={logo}

                  alt="Gladys' Closet Logo"

                  className="w-10 h-10 object-cover rounded-lg"

                />

              </div>

              <div>

                <h2 className="text-base font-black text-gray-900 leading-tight">

                  Gladys' Closet

                </h2>

                <p className="text-xs text-purple-700 font-semibold mt-0.5">

                  Admin Console

                </p>

              </div>

            </div>



            {/* Close Button Inside Mobile Drawer */}

            <button

              onClick={() => setIsMobileMenuOpen(false)}

              className="md:hidden text-gray-400 hover:text-gray-600"

            >

              <FiX className="w-5 h-5" />

            </button>

          </div>



          {/* Navigation Links */}

          <nav className="space-y-1.5">

            {navItems.map((item) => {

              const Icon = item.icon;

              return (

                <NavLink

                  key={item.path}

                  to={item.path}

                  end={item.end}

                  onClick={() => setIsMobileMenuOpen(false)}

                  className={({ isActive }) =>

                    `flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${

                      isActive

                        ? "bg-purple-700 text-white shadow-md shadow-purple-200"

                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"

                    }`

                  }

                >

                  <Icon className="w-5 h-5 shrink-0" />

                  <span>{item.name}</span>

                </NavLink>

              );

            })}

          </nav>

        </div>



        {/* Footer Actions */}

        <div className="space-y-2 pt-4 border-t border-gray-100">

          <Link

            to="/"

            target="_blank"

            rel="noreferrer"

            className="flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition"

          >

            <span>View Live Store</span>

            <FiExternalLink className="w-4 h-4" />

          </Link>



          <button

            onClick={() => {

              setIsMobileMenuOpen(false);

              handleSignOut();

            }}

            className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition w-full text-left"

          >

            <FiLogOut className="w-5 h-5 shrink-0" />

            <span>Sign Out</span>

          </button>

        </div>

      </aside>



      {/* Main Content Area */}

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">

        <div className="max-w-7xl mx-auto">

          <Outlet />

        </div>

      </main>

    </div>

  );

}

