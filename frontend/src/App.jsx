import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRouter from './pages/dashboard/DashboardRouter';
import UserManagement from './pages/users/UserManagement';
import AssignmentPage from './pages/assignments/AssignmentPage';
import MeetingPage from './pages/meetings/MeetingPage';
import GroupPage from './pages/groups/GroupPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/meetings" element={<MeetingPage />} />
          <Route
            path="/messages"
            element={
              <Container>
                <Typography variant="h5">Messages</Typography>
              </Container>
            }
          />
          <Route
            path="/mentees"
            element={
              <Container>
                <Typography variant="h5">My Mentees</Typography>
              </Container>
            }
          />
          <Route
            path="/mentor"
            element={
              <Container>
                <Typography variant="h5">My Mentor</Typography>
              </Container>
            }
          />

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/users" element={<UserManagement />} />
            <Route path="/assignments" element={<AssignmentPage />} />
            <Route path="/groups" element={<GroupPage />} />
            <Route
              path="/bulk-messages"
              element={
                <Container>
                  <Typography variant="h5">Bulk Messages</Typography>
                </Container>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
