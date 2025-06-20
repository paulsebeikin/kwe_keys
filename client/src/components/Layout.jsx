import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { token, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-100">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">Kingswood Estate Management</span>
          </div>
          <div className="flex-none gap-2">
            {token ? (
              <button onClick={logout} className="btn btn-ghost">Logout</button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn btn-ghost">Login</Link>
                <Link to="/register" className="btn btn-ghost">Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Sidebar: Only show if logged in */}
      {token && (
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
          <ul className="menu p-4 w-40 min-h-full bg-base-200">
            <li>
              <Link to="/units" className={location.pathname === '/units' ? 'active' : ''}>
                Units
              </Link>
            </li>
            <li>
              <Link to="/remotes" className={location.pathname === '/remotes' ? 'active' : ''}>
                Remotes
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}