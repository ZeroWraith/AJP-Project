import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  COMPLETED: 'default',
  CANCELLED: 'error',
  DECLINED: 'warning',
};

export default function MeetingPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', meetingDate: '', location: '', mentorId: '', menteeId: '' });
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/meetings');
      const data = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setMeetings(data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load meetings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [mRes, eRes] = await Promise.all([api.get('/users/mentors'), api.get('/users/mentees')]);
      setMentors(mRes.data || []);
      setMentees(eRes.data || []);
    } catch {}
  };

  useEffect(() => { fetchMeetings(); fetchDropdowns(); }, [fetchMeetings]);

  const handleCreate = async () => {
    try {
      await api.post('/meetings', {
        ...form,
        mentorId: Number(form.mentorId),
        menteeId: Number(form.menteeId),
      });
      setSnackbar({ open: true, message: 'Meeting created', severity: 'success' });
      setDialogOpen(false);
      fetchMeetings();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to create meeting', severity: 'error' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/meetings/${id}/status`, { status });
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
      fetchMeetings();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update', severity: 'error' });
    }
  };

  const filtered = meetings.filter((m) => !statusFilter || m.status === statusFilter);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Meetings</Typography>
        {(user?.role === 'MENTOR' || user?.role === 'ADMIN') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ title: '', description: '', meetingDate: '', location: '', mentorId: user?.role === 'MENTOR' ? user.id : '', menteeId: '' }); setDialogOpen(true); }}>
            Schedule Meeting
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {Object.keys(STATUS_COLORS).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Mentee</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">No meetings found</TableCell></TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>{m.meetingDate ? new Date(m.meetingDate).toLocaleString() : '-'}</TableCell>
                  <TableCell>{m.mentorName}</TableCell>
                  <TableCell>{m.menteeName}</TableCell>
                  <TableCell>{m.location || '-'}</TableCell>
                  <TableCell><Chip label={m.status} size="small" color={STATUS_COLORS[m.status] || 'default'} /></TableCell>
                  <TableCell>
                    {m.status === 'SCHEDULED' && user?.id === m.menteeId && (
                      <>
                        <Button size="small" color="success" onClick={() => handleStatusChange(m.id, 'CONFIRMED')}>Confirm</Button>
                        <Button size="small" color="error" onClick={() => handleStatusChange(m.id, 'DECLINED')}>Decline</Button>
                      </>
                    )}
                    {m.status === 'CONFIRMED' && user?.id === m.mentorId && (
                      <Button size="small" color="primary" onClick={() => handleStatusChange(m.id, 'COMPLETED')}>Complete</Button>
                    )}
                    {(m.status === 'SCHEDULED' || m.status === 'CONFIRMED') && user?.id === m.mentorId && (
                      <Button size="small" color="error" onClick={() => handleStatusChange(m.id, 'CANCELLED')}>Cancel</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Meeting</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Date & Time" type="datetime-local" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
            <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            {user?.role === 'ADMIN' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Mentor</InputLabel>
                  <Select value={form.mentorId} label="Mentor" onChange={(e) => setForm({ ...form, mentorId: e.target.value })}>
                    {mentors.map((m) => <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Mentee</InputLabel>
                  <Select value={form.menteeId} label="Mentee" onChange={(e) => setForm({ ...form, menteeId: e.target.value })}>
                    {mentees.map((m) => <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
