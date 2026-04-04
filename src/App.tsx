import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import './index.css';

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layout
import Layout from './components/layout/Layout';

// Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import BuildingsPage from './pages/buildings/BuildingsPage';
import BookingsLayout from './pages/bookings/BookingsLayout';
import BookingsListPage from './pages/bookings/BookingsListPage';
import BookingsCalendarPage from './pages/bookings/BookingsCalendarPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import SettingsPage from './pages/settings/SettingsPage';
import RoomsPage from './pages/rooms/RoomsPage';
import RoomDetailPage from './pages/rooms/RoomDetailPage';
import RoomsOverviewCalendarPage from './pages/rooms/RoomsOverviewCalendarPage';
import PostsPage from './pages/posts/PostsPage';
import PostFormPage from './pages/posts/PostFormPage';
import { Toaster } from '@/components/ui/toaster';
import PostDetailPage from './pages/posts/PostDetailPage';
import ChatPage from './pages/chat/ChatPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes - Only accessible when not authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/buildings" element={<BuildingsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/calendar" element={<RoomsOverviewCalendarPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/bookings" element={<BookingsLayout />}>
                <Route index element={<BookingsListPage />} />
                <Route path="calendar" element={<BookingsCalendarPage />} />
              </Route>
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/create" element={<PostFormPage />} />
              <Route path="/posts/:id/edit" element={<PostFormPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
      {import.meta.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
