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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api/axios';

const initialForm = { firstName: '', lastName: '', email: '', phone: '', role: 'MENTEE', password: '' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage };
      if (search) params.search = search;
      const res = await api.get('/users', { params });
      let filtered = res.data.content || [];
      if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
      setUsers(filtered);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', role: user.role, password: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, { firstName: form.firstName, lastName: form.lastName, phone: form.phone, role: form.role, isActive: true });
        setSnackbar({ open: true, message: 'User updated', severity: 'success' });
      } else {
        await api.post('/users', form);
        setSnackbar({ open: true, message: 'User created', severity: 'success' });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save user', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deletingUser.id}`);
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete user', severity: 'error' });
    }
  };

  const ROLE_COLORS = { ADMIN: 'error', MENTOR: 'primary', MENTEE: 'success' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add User
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="MENTOR">MENTOR</MenuItem>
            <MenuItem value="MENTEE">MENTEE</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No users found</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell><Chip label={user.role} size="small" color={ROLE_COLORS[user.role] || 'default'} /></TableCell>
                  <TableCell><Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenEdit(user)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeletingUser(user); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <TextField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editingUser} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="MENTOR">MENTOR</MenuItem>
                <MenuItem value="MENTEE">MENTEE</MenuItem>
              </Select>
            </FormControl>
            {!editingUser && (
              <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingUser ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {deletingUser?.firstName} {deletingUser?.lastName}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
