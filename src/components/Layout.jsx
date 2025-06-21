import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">        
        <Navbar/>
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