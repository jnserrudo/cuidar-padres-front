import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import SolicitarPage from './pages/public/SolicitarPage';
import GraciasPage from './pages/public/GraciasPage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import AnnouncementDetailPage from './pages/public/AnnouncementDetailPage';
import WebinarsPublicPage from './pages/public/WebinarsPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import LocationsPage from './pages/admin/LocationsPage';
import PressPage from './pages/admin/PressPage';
import { WebinarsPage, AnnouncementsPage as AnnouncementsAdminPage, EmailTemplatesPage, UsersPage } from './pages/admin/OtherPages';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/solicitar" element={<SolicitarPage />} />
        <Route path="/gracias" element={<GraciasPage />} />
        <Route path="/anuncios" element={<AnnouncementsPage />} />
        <Route path="/anuncios/:id" element={<AnnouncementDetailPage />} />
        <Route path="/webinars" element={<WebinarsPublicPage />} />
        
        {/* Public Login Route */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="applications" replace />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="press" element={<PressPage />} />
            <Route path="webinars" element={<WebinarsPage />} />
            <Route path="announcements" element={<AnnouncementsAdminPage />} />
            
            {/* Admin role only resources */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="email-templates" element={<EmailTemplatesPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
