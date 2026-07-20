import { Routes, Route } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <Container maxWidth="lg">
              <Typography variant="h4" gutterBottom>
                Mentor Portal
              </Typography>
              <Typography>Welcome to the Mentor-Mentee Portal</Typography>
            </Container>
          }
        />
        <Route path="/dashboard" element={<Container><Typography variant="h5">Dashboard</Typography></Container>} />
        <Route path="/users" element={<Container><Typography variant="h5">Users</Typography></Container>} />
        <Route path="/assignments" element={<Container><Typography variant="h5">Assignments</Typography></Container>} />
        <Route path="/meetings" element={<Container><Typography variant="h5">Meetings</Typography></Container>} />
        <Route path="/groups" element={<Container><Typography variant="h5">Groups</Typography></Container>} />
        <Route path="/bulk-messages" element={<Container><Typography variant="h5">Bulk Messages</Typography></Container>} />
        <Route path="/messages" element={<Container><Typography variant="h5">Messages</Typography></Container>} />
        <Route path="/mentees" element={<Container><Typography variant="h5">My Mentees</Typography></Container>} />
        <Route path="/mentor" element={<Container><Typography variant="h5">My Mentor</Typography></Container>} />
      </Route>
    </Routes>
  );
}

export default App;
