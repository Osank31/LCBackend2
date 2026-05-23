import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import CreateProblem from './pages/CreateProblem';
import EditProblem from './pages/EditProblem';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg text-text-secondary font-mono text-xs uppercase">
        Initializing secure runtime...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-darkBg text-[#f3f4f6] flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          {/* Public authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Core system routes */}
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />

          {/* Protected Administrative routes */}
          <Route 
            path="/problems/create" 
            element={
              <ProtectedRoute>
                <CreateProblem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/problems/:id/edit" 
            element={
              <ProtectedRoute>
                <EditProblem />
              </ProtectedRoute>
            } 
          />

          {/* Default fallback route */}
          <Route path="/" element={<Navigate to="/problems" replace />} />
          <Route path="*" element={<Navigate to="/problems" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
