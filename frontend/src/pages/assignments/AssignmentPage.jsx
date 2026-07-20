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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Skeleton,
  TablePagination,
  TextareaAutosize,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../api/axios';

const STATUS_COLORS = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  ACTIVE: 'success',
  INACTIVE: 'default',
  REJECTED: 'error',
};

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [form, setForm] = useState({ userId: '', mentorId: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data?.content || (Array.isArray(res.data) ? res.data : []));
    } catch {
      setSnackbar({ open: true, message: 'Failed to load assignments', severity: 'error' });
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

  useEffect(() => { fetchAssignments(); fetchDropdowns(); }, [fetchAssignments]);

  const handleCreate = async () => {
    try {
      await api.post('/assignments', { userId: Number(form.userId), mentorId: Number(form.mentorId), notes: form.notes });
      setSnackbar({ open: true, message: 'Assignment created', severity: 'success' });
      setDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to create assignment', severity: 'error' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/assignments/${id}/status`, { status });
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
      fetchAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update status', severity: 'error' });
    }
  };

  const filtered = assignments
    .filter((a) => !statusFilter || a.status === statusFilter)
    .filter((a) => !search || a.menteeName?.toLowerCase().includes(search.toLowerCase()) || a.mentorName?.toLowerCase().includes(search.toLowerCase()))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Assignments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ userId: '', mentorId: '', notes: '' }); setDialogOpen(true); }}>
          New Assignment
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 250 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {Object.keys(STATUS_COLORS).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mentee</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Assigned Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No assignments found</TableCell></TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.menteeName}<br /><Typography variant="caption" color="text.secondary">{a.menteeEmail}</Typography></TableCell>
                  <TableCell>{a.mentorName}<br /><Typography variant="caption" color="text.secondary">{a.mentorEmail}</Typography></TableCell>
                  <TableCell>{a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell><Chip label={a.status} size="small" color={STATUS_COLORS[a.status] || 'default'} /></TableCell>
                  <TableCell>
                    {a.status === 'PENDING' && (
                      <>
                        <Button size="small" color="success" onClick={() => handleStatusChange(a.id, 'ACCEPTED')}>Accept</Button>
                        <Button size="small" color="error" onClick={() => handleStatusChange(a.id, 'REJECTED')}>Reject</Button>
                      </>
                    )}
                    {a.status === 'ACCEPTED' && (
                      <Button size="small" color="primary" onClick={() => handleStatusChange(a.id, 'ACTIVE')}>Activate</Button>
                    )}
                    {a.status === 'ACTIVE' && (
                      <Button size="small" onClick={() => handleStatusChange(a.id, 'INACTIVE')}>Deactivate</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={assignments.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Mentee</InputLabel>
              <Select value={form.userId} label="Mentee" onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                {mentees.map((m) => <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Mentor</InputLabel>
              <Select value={form.mentorId} label="Mentor" onChange={(e) => setForm({ ...form, mentorId: e.target.value })}>
                {mentors.map((m) => <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Notes" multiline rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
