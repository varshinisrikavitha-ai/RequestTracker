import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitRequest from './pages/SubmitRequest';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit-request" element={<SubmitRequest />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/request/:requestId" element={<RequestDetails />} />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'DEPARTMENT_HEAD']}>
                  <Approvals />
                </ProtectedRoute>
              }
            />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles="ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
