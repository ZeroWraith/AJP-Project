import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupsIcon from '@mui/icons-material/Groups';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = {
  ADMIN: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Meetings', icon: <MeetingRoomIcon />, path: '/meetings' },
    { text: 'Groups', icon: <GroupsIcon />, path: '/groups' },
    { text: 'Bulk Messages', icon: <MailOutlineIcon />, path: '/bulk-messages' },
  ],
  MENTOR: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Mentees', icon: <SchoolIcon />, path: '/mentees' },
    { text: 'Meetings', icon: <MeetingRoomIcon />, path: '/meetings' },
    { text: 'Messages', icon: <MailOutlineIcon />, path: '/messages' },
  ],
  MENTEE: [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Mentor', icon: <PersonIcon />, path: '/mentor' },
    { text: 'Meetings', icon: <MeetingRoomIcon />, path: '/meetings' },
    { text: 'Messages', icon: <MailOutlineIcon />, path: '/messages' },
  ],
};

const ROLE_COLORS = {
  ADMIN: 'error',
  MENTOR: 'primary',
  MENTEE: 'success',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.MENTEE;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Chip
            label={user?.role}
            size="small"
            color={ROLE_COLORS[user?.role] || 'default'}
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Mentor Portal
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
