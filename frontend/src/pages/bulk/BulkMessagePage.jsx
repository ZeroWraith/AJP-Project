import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Skeleton,
  Stack,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/axios';

const STATUS_COLORS = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SENT: 'success',
  PARTIAL: 'warning',
  FAILED: 'error',
};

const CHANNEL_OPTIONS = ['EMAIL', 'SMS', 'BOTH'];
const TARGET_TYPES = { ROLE: 'ROLE', GROUP: 'GROUP' };
const ROLE_OPTIONS = ['ALL', 'MENTOR', 'MENTEE'];

const getListFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

const toIsoIfPresent = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const getCampaignTargetLabel = (campaign) => {
  if (campaign.targetLabel) return campaign.targetLabel;
  const targetType = campaign.targetType || campaign.target?.type;
  const role = campaign.targetRole || campaign.role || campaign.target?.role;
  const groupName = campaign.groupName || campaign.target?.groupName;
  if (targetType === TARGET_TYPES.GROUP) return groupName || 'Group';
  if (targetType === TARGET_TYPES.ROLE) return `Role: ${role || 'ALL'}`;
  if (groupName) return groupName;
  if (role) return `Role: ${role}`;
  return '-';
};

const getCampaignDate = (campaign) => campaign.scheduledAt || campaign.sentAt || campaign.createdAt || campaign.date;

export default function BulkMessagePage() {
  const [history, setHistory] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({
    subject: '',
    body: '',
    channel: 'EMAIL',
    targetType: TARGET_TYPES.ROLE,
    role: 'ALL',
    groupId: '',
    templateId: '',
    scheduleMode: 'NOW',
    scheduleAt: '',
  });

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/bulk-messages');
      setHistory(getListFromResponse(res.data));
    } catch {
      setSnackbar({ open: true, message: 'Failed to load campaign history', severity: 'error' });
    }
  }, []);

  const fetchTargets = useCallback(async () => {
    try {
      const [groupRes, userRes] = await Promise.all([
        api.get('/groups', { params: { page: 0, size: 200 } }),
        api.get('/users', { params: { page: 0, size: 1000 } }),
      ]);
      setGroups(getListFromResponse(groupRes.data));
      setUsers(getListFromResponse(userRes.data));
    } catch {
      setSnackbar({ open: true, message: 'Failed to load targeting data', severity: 'error' });
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(getListFromResponse(res.data));
    } catch {
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchHistory(), fetchTargets(), fetchTemplates()]);
      if (active) setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchHistory, fetchTargets, fetchTemplates]);

  const selectedGroup = useMemo(() => groups.find((g) => String(g.id) === String(form.groupId)), [groups, form.groupId]);

  const estimatedRecipientCount = useMemo(() => {
    if (form.targetType === TARGET_TYPES.GROUP) {
      if (!selectedGroup) return 0;
      return selectedGroup.memberCount ?? selectedGroup.members?.length ?? 0;
    }

    if (form.role === 'ALL') return users.length;
    return users.filter((u) => u.role === form.role).length;
  }, [form.targetType, form.role, selectedGroup, users]);

  const samplePreview = useMemo(() => ({
    subject: form.subject || '(No subject)',
    body: form.body || '(No body)',
    channel: form.channel,
  }), [form.subject, form.body, form.channel]);

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => String(t.id) === String(templateId));
    setForm((prev) => ({
      ...prev,
      templateId,
      subject: template?.subject || template?.title || prev.subject,
      body: template?.body || template?.content || template?.templateBody || prev.body,
    }));
  };

  const canSubmit = form.subject.trim() && form.body.trim() && (form.targetType === TARGET_TYPES.ROLE || form.groupId) && (form.scheduleMode === 'NOW' || form.scheduleAt);

  const buildPayload = () => ({
    subject: form.subject.trim(),
    body: form.body.trim(),
    channel: form.channel,
    targetType: form.targetType,
    role: form.targetType === TARGET_TYPES.ROLE ? form.role : undefined,
    groupId: form.targetType === TARGET_TYPES.GROUP ? Number(form.groupId) : undefined,
    templateId: form.templateId ? Number(form.templateId) : undefined,
  });

  const handleSubmitCampaign = async () => {
    setSubmitting(true);
    try {
      if (form.scheduleMode === 'NOW') {
        await api.post('/bulk-messages', buildPayload());
        setSnackbar({ open: true, message: 'Campaign sent successfully', severity: 'success' });
      } else {
        await api.post('/bulk-messages/schedule', {
          ...buildPayload(),
          scheduledAt: toIsoIfPresent(form.scheduleAt),
        });
        setSnackbar({ open: true, message: 'Campaign scheduled successfully', severity: 'success' });
      }

      setConfirmOpen(false);
      setForm((prev) => ({
        ...prev,
        subject: '',
        body: '',
        templateId: '',
        scheduleAt: '',
      }));
      fetchHistory();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to submit campaign', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const openCampaignDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    setDetailsOpen(true);

    if (!campaign?.id) return;

    try {
      const res = await api.get(`/bulk-messages/${campaign.id}`);
      setSelectedCampaign(res.data || campaign);
    } catch {
      setSelectedCampaign(campaign);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Bulk Message Campaign Builder
      </Typography>

      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Campaign Builder</Typography>
          <Stack spacing={2}>
            <TextField
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              multiline
              rows={6}
              required
              fullWidth
            />

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
              <FormControl fullWidth>
                <InputLabel>Channel</InputLabel>
                <Select value={form.channel} label="Channel" onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                  {CHANNEL_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Template (optional)</InputLabel>
                <Select
                  value={form.templateId}
                  label="Template (optional)"
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name || template.subject || template.title || `Template ${template.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            <Typography variant="subtitle1" fontWeight={600}>Target Selector</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
              <FormControl fullWidth>
                <InputLabel>Target Type</InputLabel>
                <Select value={form.targetType} label="Target Type" onChange={(e) => setForm({ ...form, targetType: e.target.value })}>
                  <MenuItem value={TARGET_TYPES.ROLE}>By Role</MenuItem>
                  <MenuItem value={TARGET_TYPES.GROUP}>By Group</MenuItem>
                </Select>
              </FormControl>

              {form.targetType === TARGET_TYPES.ROLE ? (
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={form.role} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLE_OPTIONS.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Group</InputLabel>
                  <Select value={form.groupId} label="Group" onChange={(e) => setForm({ ...form, groupId: e.target.value })}>
                    {groups.map((group) => <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Box>

            <Divider />

            <Typography variant="subtitle1" fontWeight={600}>Schedule</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
              <FormControl fullWidth>
                <InputLabel>Option</InputLabel>
                <Select value={form.scheduleMode} label="Option" onChange={(e) => setForm({ ...form, scheduleMode: e.target.value })}>
                  <MenuItem value="NOW">Send Now</MenuItem>
                  <MenuItem value="LATER">Schedule for later</MenuItem>
                </Select>
              </FormControl>

              {form.scheduleMode === 'LATER' && (
                <TextField
                  label="Schedule Date & Time"
                  type="datetime-local"
                  value={form.scheduleAt}
                  onChange={(e) => setForm({ ...form, scheduleAt: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              )}
            </Box>

            <Box>
              <Button
                variant="contained"
                startIcon={form.scheduleMode === 'NOW' ? <SendIcon /> : <ScheduleIcon />}
                onClick={() => setConfirmOpen(true)}
                disabled={!canSubmit || submitting}
              >
                {form.scheduleMode === 'NOW' ? 'Send Campaign' : 'Schedule Campaign'}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Preview</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Estimated recipient count: <strong>{estimatedRecipientCount}</strong>
          </Typography>
          <Typography variant="subtitle2">Sample Message Preview</Typography>
          <Box sx={{ mt: 1, p: 2, borderRadius: 1, bgcolor: 'grey.100' }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Channel:</strong> {samplePreview.channel}</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Subject:</strong> {samplePreview.subject}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Body:</strong> {samplePreview.body}</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Campaign History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent Count</TableCell>
                  <TableCell>Failed Count</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                ) : history.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center">No campaigns found</TableCell></TableRow>
                ) : (
                  history.map((campaign) => (
                    <TableRow key={campaign.id || `${campaign.subject}-${campaign.createdAt}`}>
                      <TableCell>{campaign.subject || '-'}</TableCell>
                      <TableCell>{campaign.channel || '-'}</TableCell>
                      <TableCell>{getCampaignTargetLabel(campaign)}</TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.status || 'PENDING'}
                          size="small"
                          color={STATUS_COLORS[campaign.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>{campaign.sentCount ?? campaign.successCount ?? 0}</TableCell>
                      <TableCell>{campaign.failedCount ?? 0}</TableCell>
                      <TableCell>{getCampaignDate(campaign) ? new Date(getCampaignDate(campaign)).toLocaleString() : '-'}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<VisibilityIcon />} onClick={() => openCampaignDetails(campaign)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{form.scheduleMode === 'NOW' ? 'Send Campaign' : 'Schedule Campaign'}</DialogTitle>
        <DialogContent>
          <Typography>
            {form.scheduleMode === 'NOW'
              ? 'Are you sure you want to send this bulk message campaign now?'
              : 'Are you sure you want to schedule this bulk message campaign?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitCampaign} disabled={submitting || !canSubmit}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Campaign Details</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 0.5 }}>
            <Typography variant="body2"><strong>Subject:</strong> {selectedCampaign?.subject || '-'}</Typography>
            <Typography variant="body2"><strong>Channel:</strong> {selectedCampaign?.channel || '-'}</Typography>
            <Typography variant="body2"><strong>Target:</strong> {selectedCampaign ? getCampaignTargetLabel(selectedCampaign) : '-'}</Typography>
            <Typography variant="body2"><strong>Status:</strong> {selectedCampaign?.status || '-'}</Typography>
            <Typography variant="body2"><strong>Sent Count:</strong> {selectedCampaign?.sentCount ?? selectedCampaign?.successCount ?? 0}</Typography>
            <Typography variant="body2"><strong>Failed Count:</strong> {selectedCampaign?.failedCount ?? 0}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Body:</strong> {selectedCampaign?.body || '-'}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
