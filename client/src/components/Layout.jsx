import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!token) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">KWE Keys</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome!</span>
              <button
                onClick={() => logout()}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-sm">
          <nav className="mt-5 px-2">
            <Link
              to="/"
              className={`group flex items-center px-2 py-2 text-base rounded-md ${
                location.pathname === '/' 
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Remotes
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
