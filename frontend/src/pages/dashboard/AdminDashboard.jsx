import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MailIcon from '@mui/icons-material/Mail';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import api from '../../api/axios';

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32'];

function StatCard({ icon, label, value, color }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main` }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={600}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  const roleData = data.usersByRole
    ? Object.entries(data.usersByRole).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>Admin Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<PeopleIcon />} label="Total Users" value={data.totalUsers} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<SchoolIcon />} label="Total Mentors" value={data.totalMentors} color="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<PersonIcon />} label="Total Mentees" value={data.totalMentees} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<AssignmentIcon />} label="Active Assignments" value={data.activeAssignments} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<MeetingRoomIcon />} label="Meetings This Week" value={data.meetingsThisWeek} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<MailIcon />} label="Messages Sent" value={data.messagesSent} color="error" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {roleData.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Users by Role</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {roleData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {data.meetingsOverTime?.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Meetings Over Time</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.meetingsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {data.recentActivity?.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {data.recentActivity.map((activity, i) => (
                    <Box key={i} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2">{activity.description || JSON.stringify(activity)}</Typography>
                      <Typography variant="caption" color="text.secondary">{activity.timestamp || ''}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
