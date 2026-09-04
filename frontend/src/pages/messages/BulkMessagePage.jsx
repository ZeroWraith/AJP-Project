import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  LinearProgress,
  Divider,
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
  TablePagination,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import api from '../../api/axios';

const STATUS_COLORS = {
  SENT: 'success',
  FAILED: 'error',
  PENDING: 'warning',
  PROCESSING: 'info',
  COMPLETED: 'success',
};

const LOG_STATUS_FILTERS = ['', 'SENT', 'FAILED', 'PENDING'];

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.logs)) return value.logs;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

export default function BulkMessagePage() {
  const [campaignIdInput, setCampaignIdInput] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCampaign = useCallback(async (activeCampaignId) => {
    if (!activeCampaignId) return;
    setLoadingCampaign(true);
    try {
      const res = await api.get(`/bulk-messages/${activeCampaignId}`);
      setCampaign(res.data || null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load campaign details',
        severity: 'error',
      });
    } finally {
      setLoadingCampaign(false);
    }
  }, []);

  const fetchLogs = useCallback(async (activeCampaignId, activePage, activeRowsPerPage, activeStatus) => {
    if (!activeCampaignId) return;
    setLoadingLogs(true);
    try {
      const params = {
        page: activePage,
        size: activeRowsPerPage,
      };
      if (activeStatus) {
        params.status = activeStatus;
      }
      const res = await api.get(`/bulk-messages/${activeCampaignId}/logs`, { params });
      const nextLogs = toArray(res.data);
      setLogs(nextLogs);
      setTotalLogs(
        res.data?.totalElements
          ?? res.data?.total
          ?? res.data?.count
          ?? nextLogs.length
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load delivery logs',
        severity: 'error',
      });
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    fetchLogs(campaignId, page, rowsPerPage, statusFilter);
  }, [campaignId, page, rowsPerPage, statusFilter, fetchLogs]);

  useEffect(() => {
    if (!campaignId || campaign?.status !== 'PROCESSING') return;
    const timer = setInterval(() => {
      fetchCampaign(campaignId);
      fetchLogs(campaignId, page, rowsPerPage, statusFilter);
    }, 5000);
    return () => clearInterval(timer);
  }, [campaignId, campaign?.status, fetchCampaign, fetchLogs, page, rowsPerPage, statusFilter]);

  const campaignStats = useMemo(() => {
    const sent = campaign?.sentCount ?? campaign?.stats?.sent ?? 0;
    const failed = campaign?.failedCount ?? campaign?.stats?.failed ?? 0;
    const pending = campaign?.pendingCount ?? campaign?.stats?.pending ?? 0;
    const total = campaign?.totalCount ?? campaign?.stats?.total ?? sent + failed + pending;
    const successRate = total > 0
      ? Number((campaign?.successRate ?? ((sent / total) * 100)).toFixed(2))
      : 0;
    return { sent, failed, pending, total, successRate };
  }, [campaign]);

  const timelineEntries = useMemo(() => {
    if (Array.isArray(campaign?.timeline) && campaign.timeline.length > 0) {
      return campaign.timeline;
    }
    return [
      { label: 'Created', at: campaign?.createdAt },
      { label: 'Started', at: campaign?.startedAt },
      { label: 'Completed', at: campaign?.completedAt },
      { label: 'Last Updated', at: campaign?.updatedAt },
    ].filter((entry) => entry.at);
  }, [campaign]);

  const handleLoadCampaign = async () => {
    if (!campaignIdInput.trim()) {
      setSnackbar({ open: true, message: 'Enter a campaign ID', severity: 'warning' });
      return;
    }
    const nextCampaignId = campaignIdInput.trim();
    setCampaignId(nextCampaignId);
    setPage(0);
    await fetchCampaign(nextCampaignId);
    await fetchLogs(nextCampaignId, 0, rowsPerPage, statusFilter);
  };

  const handleRefresh = async () => {
    if (!campaignId) return;
    await fetchCampaign(campaignId);
    await fetchLogs(campaignId, page, rowsPerPage, statusFilter);
  };

  const handleExport = async () => {
    if (!campaignId) return;
    try {
      const params = { page: 0, size: 1000 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await api.get(`/bulk-messages/${campaignId}/logs`, { params });
      const exportLogs = toArray(res.data);
      const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
      const csvRows = [
        [
          'Recipient Name',
          'Email/Phone',
          'Channel',
          'Status',
          'Sent At',
          'Error Message',
        ],
        ...exportLogs.map((log) => [
          log.recipientName ?? log.name ?? '-',
          log.recipientContact ?? log.email ?? log.phone ?? '-',
          log.channel ?? campaign?.channel ?? '-',
          log.status ?? '-',
          log.sentAt ?? log.sent_at ?? '',
          log.errorMessage ?? log.error ?? '',
        ]),
      ];

      const csv = csvRows.map((row) => row.map(escapeCsv).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign-${campaignId}-delivery-logs.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to export logs',
        severity: 'error',
      });
    }
  };

  const handleRetryFailed = async () => {
    if (!campaignId) return;
    setRetrying(true);
    try {
      await api.post(`/bulk-messages/${campaignId}/retry-failed`);
      setSnackbar({ open: true, message: 'Retry started for failed messages', severity: 'success' });
      await handleRefresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to retry failed messages',
        severity: 'error',
      });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Bulk Message History</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={!campaignId || loadingCampaign || loadingLogs}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Campaign ID"
            size="small"
            value={campaignIdInput}
            onChange={(event) => setCampaignIdInput(event.target.value)}
            sx={{ minWidth: 260 }}
          />
          <Button variant="contained" onClick={handleLoadCampaign} disabled={loadingCampaign || loadingLogs}>
            Load Campaign
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={handleRetryFailed}
            disabled={!campaignId || retrying || campaignStats.failed === 0}
          >
            Retry Failed Messages
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Campaign Summary" />
          <Tab label="Delivery Logs" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          {loadingCampaign ? (
            <Box>
              <Skeleton height={40} />
              <Skeleton height={24} />
              <Skeleton height={24} />
              <Skeleton height={120} />
            </Box>
          ) : !campaign ? (
            <Typography color="text.secondary">Load a campaign to view summary details.</Typography>
          ) : (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                  <Typography variant="body1">{campaign.subject || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Channel</Typography>
                  <Typography variant="body1">{campaign.channel || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Target</Typography>
                  <Typography variant="body1">{campaign.target || campaign.targetType || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={campaign.status || 'UNKNOWN'} size="small" color={STATUS_COLORS[campaign.status] || 'default'} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Sent</Typography>
                  <Typography variant="h6">{campaignStats.sent}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Failed</Typography>
                  <Typography variant="h6">{campaignStats.failed}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
                  <Typography variant="h6">{campaignStats.pending}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2">Success Rate</Typography>
                  <Typography variant="body2">{campaignStats.successRate}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={campaignStats.successRate} />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Timeline</Typography>
              {timelineEntries.length === 0 ? (
                <Typography color="text.secondary">No timeline events available.</Typography>
              ) : (
                <List disablePadding>
                  {timelineEntries.map((entry, index) => (
                    <ListItem key={`${entry.label}-${index}`} disableGutters>
                      <ListItemText
                        primary={entry.label || entry.status || 'Event'}
                        secondary={formatDateTime(entry.at || entry.timestamp || entry.time)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
              >
                {LOG_STATUS_FILTERS.map((status) => (
                  <MenuItem key={status || 'ALL'} value={status}>{status || 'All'}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!campaignId || loadingLogs}
            >
              Export Logs (CSV)
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Recipient Name</TableCell>
                  <TableCell>Email/Phone</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Error Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingLogs ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      {[...Array(6)].map((__, cellIndex) => (
                        <TableCell key={cellIndex}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No delivery logs found</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id || `${log.recipientContact || log.email || log.phone}-${log.sentAt || log.createdAt}`}>
                      <TableCell>{log.recipientName || log.name || '-'}</TableCell>
                      <TableCell>{log.recipientContact || log.email || log.phone || '-'}</TableCell>
                      <TableCell>{log.channel || campaign?.channel || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.status || '-'}
                          size="small"
                          color={STATUS_COLORS[log.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(log.sentAt || log.sent_at || log.createdAt)}</TableCell>
                      <TableCell>{log.errorMessage || log.error || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalLogs}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
