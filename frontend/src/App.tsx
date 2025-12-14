import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { TaskDetails } from './pages/TaskDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyTasks } from './pages/MyTasks';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { useAuthStore } from './store/auth.store';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { useSocket } from './hooks/useSocket';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Initialize socket connection
  useSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />

      {/* Authenticated Layout Routes */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/dashboard" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <Dashboard />
          </RoleBasedRoute>
        } />

        <Route path="/projects" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <Projects />
          </RoleBasedRoute>
        } />

        <Route path="/projects/:id" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <ProjectDetails />
          </RoleBasedRoute>
        } />

        <Route path="/tasks" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <MyTasks />
          </RoleBasedRoute>
        } />

        <Route path="/tasks/:taskId" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <TaskDetails />
          </RoleBasedRoute>
        } />

        <Route path="/team" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <Team />
          </RoleBasedRoute>
        } />

        <Route path="/settings" element={
          <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
            <Settings />
          </RoleBasedRoute>
        } />

        <Route path="/admin" element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedRoute>
        } />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
