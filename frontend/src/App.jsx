import { Routes, Route } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Mentor Portal
            </Typography>
            <Typography>Welcome to the Mentor-Mentee Portal</Typography>
          </Container>
        }
      />
    </Routes>
  );
}

export default App;
