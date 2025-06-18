import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import RemoteList from './components/RemoteList';
import UnitList from './components/UnitList';
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* navigates to the units list by default */}
            <Route path="/" element={<Navigate to="/units" replace />} />
            <Route path="/units" element={
              <ProtectedRoute>
                <UnitList />
              </ProtectedRoute>
            } />
            <Route path="/remotes" element={
              <ProtectedRoute>
                <RemoteList />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
