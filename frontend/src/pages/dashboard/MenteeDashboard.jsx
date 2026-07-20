import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, color = 'primary' }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" fontWeight={600} color={`${color}.main`}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
}

const STATUS_COLORS = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  COMPLETED: 'default',
  CANCELLED: 'error',
  DECLINED: 'warning',
};

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/mentee')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[...Array(3)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  const mentor = data.mentor || {};

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Welcome back, {user?.firstName}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                {mentor.firstName?.[0]}{mentor.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {mentor.firstName} {mentor.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">{mentor.email}</Typography>
                {mentor.phone && (
                  <Typography variant="caption" color="text.secondary">{mentor.phone}</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Upcoming Meetings" value={data.upcomingMeetings} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Completed Meetings" value={data.completedMeetings} color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upcoming Meetings</Typography>
              {data.upcomingMeetingsList?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mentor</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.upcomingMeetingsList.map((meeting, i) => (
                        <TableRow key={i}>
                          <TableCell>{meeting.mentorName}</TableCell>
                          <TableCell>{meeting.title}</TableCell>
                          <TableCell>{meeting.date}</TableCell>
                          <TableCell>
                            <Chip
                              label={meeting.status}
                              size="small"
                              color={STATUS_COLORS[meeting.status] || 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No upcoming meetings</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Messages</Typography>
              {data.recentMessages?.length > 0 ? (
                <Box>
                  {data.recentMessages.map((msg, i) => (
                    <Box key={i} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2">{msg.content || msg.text}</Typography>
                      <Typography variant="caption" color="text.secondary">{msg.timestamp || msg.date}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No recent messages</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
