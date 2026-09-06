import { useState, useEffect, useCallback, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../../api/axios';

const CHANNELS = ['EMAIL', 'SMS', 'BOTH'];
const SAMPLE_DATA = {
  firstName: 'Alex',
  lastName: 'Johnson',
  mentorName: 'Dr. Smith',
  date: '2026-07-24',
};

const initialForm = {
  name: '',
  subject: '',
  body: '',
  channel: 'EMAIL',
};

function renderTemplate(template) {
  return template.replaceAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => SAMPLE_DATA[key] ?? `{{${key}}}`);
}

export default function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/templates');
      const items = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setTemplates(items);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load templates', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.name?.toLowerCase().includes(search.toLowerCase())),
    [templates, search]
  );

  const pagedTemplates = useMemo(
    () => filteredTemplates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredTemplates, page, rowsPerPage]
  );

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setForm({
      name: template.name || '',
      subject: template.subject || '',
      body: template.body || '',
      channel: template.channel || 'EMAIL',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate.id}`, form);
        setSnackbar({ open: true, message: 'Template updated', severity: 'success' });
      } else {
        await api.post('/templates', form);
        setSnackbar({ open: true, message: 'Template created', severity: 'success' });
      }
      setDialogOpen(false);
      fetchTemplates();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save template', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/templates/${deletingTemplate.id}`);
      setSnackbar({ open: true, message: 'Template deleted', severity: 'success' });
      setDeleteDialogOpen(false);
      fetchTemplates();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete template', severity: 'error' });
    }
  };

  const previewSubject = renderTemplate(form.subject || '');
  const previewBody = renderTemplate(form.body || '');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Email Templates</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Template
        </Button>
      </Box>

      <TextField
        size="small"
        placeholder="Search templates by name..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        sx={{ mb: 2, minWidth: 300 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              ))
            ) : pagedTemplates.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No templates found</TableCell></TableRow>
            ) : (
              pagedTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>{template.channel || 'EMAIL'}</TableCell>
                  <TableCell>{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenEdit(template)}><EditIcon /></IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => { setDeletingTemplate(template); setDeleteDialogOpen(true); }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTemplates.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <TextField label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <FormControl fullWidth>
                <InputLabel>Channel</InputLabel>
                <Select value={form.channel} label="Channel" onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                  {CHANNELS.map((channel) => <MenuItem key={channel} value={channel}>{channel}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label={(
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Body
                    <Tooltip title="Use variables like {{firstName}} or {{date}}">
                      <InfoOutlinedIcon fontSize="small" />
                    </Tooltip>
                  </Box>
                )}
                multiline
                rows={8}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </Box>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Preview (sample data)
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Subject: {previewSubject || '-'}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {previewBody || '-'}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name.trim() || !form.subject.trim() || !form.body.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {deletingTemplate?.name}?</Typography>
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
