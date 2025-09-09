import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import Upload from "./pages/Upload";
import ComparePage from "./pages/Compare";
import SimilarPage from "./pages/Similar";
import FoldersPage from "./pages/Folders";
import LoginPage from "./pages/Login";
import AdminPage from "./pages/Admin";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import UploadIcon from "@mui/icons-material/Upload";
import CompareIcon from "@mui/icons-material/Compare";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import FolderIcon from "@mui/icons-material/Folder";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import Footer from "./components/Footer";
import logo from "./assets/img/Z_logo_vertical.png";

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#42a5f5',
    },
    secondary: {
      main: '#ff7043',
    },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#bdbdbd',
    },
    grey: { // Add grey palette
      300: '#e0e0e0', // Light gray
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h6: {
      fontFamily: 'Montserrat, sans-serif',
    },
    subtitle1: {
      fontFamily: 'Montserrat, sans-serif',
    },
  },
  components: {
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#e0e0e0',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#e0e0e0',
        },
      },
    },
  },
});

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Initialize to false
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const isLoginPage = location.pathname === '/login'; // Check if current page is login

  useEffect(() => {
    // Check localStorage on mount
    setIsAuthenticated(!!localStorage.getItem('token'));

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);


  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const list = () => (
    <Box
      sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <img src={logo} alt="Zeron logo" style={{ width: '80px' }} />
        <Typography variant="h6" sx={{ mt: 1 }}>
          Zeron
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          <span style={{ color: customTheme.palette.grey[300] }}>ZRN</span>
          <span style={{ color: customTheme.palette.grey[300] }}>Simil</span>
          <span style={{ color: customTheme.palette.primary.main }}>IA</span>
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding component={Link} to="/">
          <ListItemButton>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText primary="Subir" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component={Link} to="/compare">
          <ListItemButton>
            <ListItemIcon>
              <CompareIcon />
            </ListItemIcon>
            <ListItemText primary="Comparar" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component={Link} to="/similar">
          <ListItemButton>
            <ListItemIcon>
              <FindInPageIcon />
            </ListItemIcon>
            <ListItemText primary="Similares" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component={Link} to="/folders">
          <ListItemButton>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Carpetas" />
          </ListItemButton>
        </ListItem>
        {isAuthenticated && (
          <ListItem disablePadding component={Link} to="/admin">
            <ListItemButton>
              <ListItemIcon>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isLoginPage && ( // Conditionally render AppBar
          <AppBar position="static">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <span style={{ color: customTheme.palette.grey[300] }}>ZRN </span>
                <span style={{ color: customTheme.palette.grey[300] }}>Simil</span>
                <span style={{ color: customTheme.palette.primary.main }}>IA</span>
              </Typography>
              {isAuthenticated ? (
                <IconButton color="inherit" onClick={handleLogout} title="Logout">
                  <LogoutIcon />
                </IconButton>
              ) : (
                <Button color="inherit" component={Link} to="/login">Login</Button>
              )}
            </Toolbar>
          </AppBar>
        )}
        {!isLoginPage && ( // Conditionally render Drawer
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            {list()}
          </Drawer>
        )}
        <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><Upload /></PrivateRoute>} />
            <Route path="/compare" element={<PrivateRoute><ComparePage /></PrivateRoute>} />
            <Route path="/similar" element={<PrivateRoute><SimilarPage /></PrivateRoute>} />
            <Route path="/folders" element={<PrivateRoute><FoldersPage /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
          </Routes>
        </Container>
        {!isLoginPage && <Footer />} {/* Conditionally render Footer */}
      </Box>
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
