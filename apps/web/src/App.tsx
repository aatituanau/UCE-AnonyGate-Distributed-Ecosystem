import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Denounce from './pages/Denounce.tsx';
import PublicLayout from './components/PublicLayout.tsx';
import PrivateLayout from './components/PrivateLayout.tsx';
import AdminComplaints from './pages/AdminComplaints.tsx';
import AdminAnalysts from './pages/AdminAnalysts.tsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('access_token');
  });

  const getTokenData = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const tokenData = getTokenData();
  const isAdmin = tokenData?.role === 'admin';

  return (
    <Router>
      <Routes>
        {/* Rutas sin Layout (Pantallas Completas) */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/dashboard" replace />}
        />

        {/* Layout Público (Solo Navbar, para usuarios anónimos) */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Navigate to="/denounce" replace />} />
          <Route path="denounce" element={<Denounce />} />
        </Route>
        
        {/* Layout Privado (Dashboard con Sidebar) */}
        <Route path="/" element={isAuthenticated ? <PrivateLayout /> : <Navigate to="/login" replace />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin/complaints" element={<AdminComplaints />} />
          
          {/* Protección de ruta por Rol Admin */}
          <Route
            path="admin/analysts"
            element={isAdmin ? <AdminAnalysts /> : <Navigate to="/dashboard" replace />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
