import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout, firstName, lastName } = useAuth();

  return (
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
      <div className="flex-none gap-2 flex items-center">
        {token ? (
          <>
            <span className="font-medium mr-2">{firstName} {lastName}</span>
            <button onClick={logout} className="btn btn-ghost">Logout</button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost">Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
