import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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

export default function MentorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/mentor')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Welcome back, {user?.firstName}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="My Mentees" value={data.myMentees} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Upcoming Meetings" value={data.upcomingMeetings} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Completed Meetings" value={data.completedMeetings} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Messages Sent" value={data.messagesSent} color="secondary" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>My Mentees</Typography>
              {data.mentees?.length > 0 ? (
                <List>
                  {data.mentees.map((mentee, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>{mentee.firstName?.[0]}{mentee.lastName?.[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${mentee.firstName} ${mentee.lastName}`}
                        secondary={mentee.email}
                      />
                      {mentee.status && (
                        <Chip label={mentee.status} size="small" color={STATUS_COLORS[mentee.status] || 'default'} />
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No mentees assigned yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upcoming Meetings</Typography>
              {data.upcomingMeetingsList?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mentee</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.upcomingMeetingsList.map((meeting, i) => (
                        <TableRow key={i}>
                          <TableCell>{meeting.menteeName}</TableCell>
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
      </Grid>
    </Box>
  );
}
