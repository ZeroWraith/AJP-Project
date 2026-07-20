import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import { Container, Typography } from '@mui/material';

export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MENTOR':
      return (
        <Container>
          <Typography variant="h5">Mentor Dashboard</Typography>
          <Typography color="text.secondary">Coming soon</Typography>
        </Container>
      );
    case 'MENTEE':
      return (
        <Container>
          <Typography variant="h5">Mentee Dashboard</Typography>
          <Typography color="text.secondary">Coming soon</Typography>
        </Container>
      );
    default:
      return (
        <Container>
          <Typography variant="h5">Dashboard</Typography>
        </Container>
      );
  }
}
