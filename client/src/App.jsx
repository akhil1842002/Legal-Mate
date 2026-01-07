import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './pages/ForgotPassword';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './pages/ChatAssistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DocumentGenerator from './pages/DocumentGenerator';
import FIRHistory from './pages/FIRHistory';
import DocumentAnalysis from './pages/DocumentAnalysis';
import SavedQueries from './pages/SavedQueries';
import AdminPanel from './pages/AdminPanel';
import Landing from './pages/Landing';
import { DocDrafter, History } from './pages/OtherPages';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Check localStorage first (Long-term session)
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (userData, remember = false) => {
    setUser(userData);
    if (remember) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} onSwitchToRegister={() => {}} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register onLogin={handleLogin} onSwitchToLogin={() => {}} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/forgot-password" 
          element={<ForgotPassword />} 
        />

        {/* Protected Routes */}
        <Route element={user ? <MainLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatAssistant />} />
          <Route path="/analysis" element={<DocumentAnalysis />} />
          <Route 
            path="/generator" 
            element={user?.role?.toLowerCase() !== 'public' ? <DocumentGenerator /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/fir-history" 
            element={user?.role?.toLowerCase() !== 'public' ? <FIRHistory /> : <Navigate to="/dashboard" />} 
          />
          <Route path="/saved-queries" element={<SavedQueries />} />
          <Route path="/drafter" element={<DocDrafter />} />
          <Route path="/history" element={<History />} />
          <Route 
            path="/admin" 
            element={user?.isAdmin ? <AdminPanel /> : <Navigate to="/dashboard" />} 
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
