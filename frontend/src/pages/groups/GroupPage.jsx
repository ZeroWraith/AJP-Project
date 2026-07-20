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
  Snackbar,
  Alert,
  Skeleton,
  TablePagination,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import api from '../../api/axios';

export default function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups', { params: { page, size: rowsPerPage } });
      let data = res.data?.content || [];
      if (search) data = data.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
      setGroups(data);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load groups', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', { params: { page: 0, size: 100 } });
      setUsers(res.data?.content || []);
    } catch {}
  };

  useEffect(() => { fetchGroups(); fetchUsers(); }, [fetchGroups]);

  const handleSave = async () => {
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, form);
        setSnackbar({ open: true, message: 'Group updated', severity: 'success' });
      } else {
        await api.post('/groups', form);
        setSnackbar({ open: true, message: 'Group created', severity: 'success' });
      }
      setDialogOpen(false);
      fetchGroups();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save group', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/groups/${deletingGroup.id}`);
      setSnackbar({ open: true, message: 'Group deleted', severity: 'success' });
      setDeleteDialogOpen(false);
      fetchGroups();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete', severity: 'error' });
    }
  };

  const handleAddMembers = async () => {
    try {
      await api.post(`/groups/${selectedGroup.id}/members`, { userIds: selectedUsers });
      setSnackbar({ open: true, message: 'Members added', severity: 'success' });
      setMemberDialogOpen(false);
      fetchGroups();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add members', severity: 'error' });
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    try {
      await api.delete(`/groups/${groupId}/members/${userId}`);
      setSnackbar({ open: true, message: 'Member removed', severity: 'success' });
      fetchGroups();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to remove member', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Groups</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingGroup(null); setForm({ name: '', description: '' }); setDialogOpen(true); }}>
          Create Group
        </Button>
      </Box>

      <TextField size="small" placeholder="Search groups..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ mb: 2, minWidth: 300 }} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Created By</TableCell>
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
            ) : groups.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No groups found</TableCell></TableRow>
            ) : (
              groups.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.name}</TableCell>
                  <TableCell>{g.description || '-'}</TableCell>
                  <TableCell>
                    <Chip label={g.memberCount} size="small" />
                    {g.members?.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {g.members.slice(0, 3).map((m) => (
                          <Chip key={m.userId} label={`${m.firstName} ${m.lastName}`} size="small" variant="outlined" onDelete={() => handleRemoveMember(g.id, m.userId)} />
                        ))}
                        {g.members.length > 3 && <Chip label={`+${g.members.length - 3}`} size="small" />}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{g.createdByName}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setSelectedGroup(g); setSelectedUsers([]); setMemberDialogOpen(true); }}><GroupAddIcon /></IconButton>
                    <IconButton size="small" onClick={() => { setEditingGroup(g); setForm({ name: g.name, description: g.description || '' }); setDialogOpen(true); }}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeletingGroup(g); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
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
        <DialogTitle>{editingGroup ? 'Edit Group' : 'Create Group'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editingGroup ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Members to {selectedGroup?.name}</DialogTitle>
        <DialogContent>
          <FormGroup>
            {users.map((u) => (
              <FormControlLabel
                key={u.id}
                control={
                  <Checkbox
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      setSelectedUsers(e.target.checked
                        ? [...selectedUsers, u.id]
                        : selectedUsers.filter((id) => id !== u.id));
                    }}
                  />
                }
                label={`${u.firstName} ${u.lastName} (${u.email})`}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMembers}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {deletingGroup?.name}?</Typography>
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
