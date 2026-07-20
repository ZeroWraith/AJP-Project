import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import MentorDashboard from './MentorDashboard';
import MenteeDashboard from './MenteeDashboard';
import { Container, Typography } from '@mui/material';

export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MENTOR':
      return <MentorDashboard />;
    case 'MENTEE':
      return <MenteeDashboard />;
    default:
      return (
        <Container>
          <Typography variant="h5">Dashboard</Typography>
        </Container>
      );
  }
}
