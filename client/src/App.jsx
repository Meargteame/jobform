import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PipelinePage from './pages/PipelinePage';
import JobCreatePage from './pages/JobCreatePage';
import JobDetailsPage from './pages/JobDetailsPage';
import JobEditPage from './pages/JobEditPage';
import FormBuilderPage from './pages/FormBuilderPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import PublicJobApplyPage from './pages/PublicJobApplyPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/apply/:slug" element={<PublicJobApplyPage />} />

      {/* Protected Recruiter Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="jobs/new" element={<JobCreatePage />} />
        <Route path="jobs/:id" element={<JobDetailsPage />} />
        <Route path="jobs/:id/edit" element={<JobEditPage />} />
        <Route path="jobs/:jobId/form" element={<FormBuilderPage />} />
        <Route path="jobs/:jobId/applications" element={<JobApplicationsPage />} />
        <Route path="applications/:id" element={<ApplicationDetailsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
