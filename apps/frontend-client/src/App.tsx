import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Denounce from './pages/Denounce.tsx';
import Layout from './components/Layout.tsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('access_token');
  });

  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Background blobs for aesthetics */}
        <div className="blob bg-primary/20 w-[600px] h-[600px] top-0 left-0"></div>
        <div className="blob bg-accent/20 w-[500px] h-[500px] bottom-0 right-0" style={{ animationDelay: '2s' }}></div>

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/denounce" replace />} />
            <Route path="denounce" element={<Denounce />} />
            <Route
              path="login"
              element={<Login setAuth={setIsAuthenticated} />}
            />
            <Route
              path="dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
