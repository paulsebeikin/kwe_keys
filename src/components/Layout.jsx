import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-full min-h-0">
        <Navbar/>
        <div className="p-2 sm:p-4 flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
      {/* Sidebar: Only show if logged in */}
      {token && (
        <div className="drawer-side z-40">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
          <ul className="menu p-2 sm:p-4 w-56 min-h-full bg-base-200">
            <li>
              <Link
                to="/units"
                className={location.pathname === '/units' ? 'active' : ''}
                onClick={() => {
                  // Hide sidebar on mobile by unchecking the drawer toggle
                  const drawer = document.getElementById('my-drawer-2');
                  if (drawer && window.innerWidth < 1024) drawer.checked = false;
                }}
              >
                Units
              </Link>
            </li>
            <li>
              <Link
                to="/remotes"
                className={location.pathname === '/remotes' ? 'active' : ''}
                onClick={() => {
                  const drawer = document.getElementById('my-drawer-2');
                  if (drawer && window.innerWidth < 1024) drawer.checked = false;
                }}
              >
                Remotes
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}