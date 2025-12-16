import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import Booking from "./pages/Booking";
import UserBookings from "./pages/user/UserBookings";
import ManagerBookings from "./pages/manager/ManagerBookings";
import FeedbackList from "./pages/FeedbackList";
import CateringServiceDetails from "./components/CateringServiceDetails";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AboutPage from "./pages/AboutPage";
import SearchBar from "./components/SearchBar";
import { Box, CircularProgress, ThemeProvider, createTheme } from "@mui/material";
import ManagerCateringServices from "./pages/manager/ManagerCateringServices";
import CateringServiceForm from "./pages/manager/CateringServiceForm";
import MenuItemManager from "./pages/manager/MenuItemManager";
import ManageMenuItem from "./pages/manager/ManageMenuItem";
import ViewFeedback from "./pages/manager/ViewFeedback";
import ContactForm from "./pages/ContactForm";
import ProtectedRoute from "./components/ProtectedRoute";
import CateringServiceAdmin from "./pages/admin/CateringServiceAdmin";
import AdminContactView from "./pages/admin/AdminContactView";
import UserProfile from "./pages/user/UserProfile";
import Unauthorized from "./pages/Unauthorized";
import AdminBookings from "./pages/admin/AdminBookings";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3E2723', // Dark coffee brown
      light: '#6A4F4B',
      dark: '#1E0F0C',
    },
    secondary: {
      main: '#D4A373', // Warm gold/tan
      light: '#E6C9A8',
      dark: '#A27B52',
    },
    background: {
      default: '#F5F5F5', // Light off-white for background
      paper: '#FFFFFF',   // White for cards and components
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Slightly rounded corners
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    // ... other shadows (will use Material-UI defaults)
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
  },
});

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const isAdminOrManager = user && (user.role === "admin" || user.role === "manager");

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(45deg, #3E2723 30%, #D4A373 90%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {!isAdminOrManager && <Navbar user={user} setUser={setUser} />}
        <Box sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          bgcolor: "background.default",
        }}>
          {isAdminOrManager && <Sidebar user={user} setUser={setUser} />}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: "auto",
              width: "100%",
              mt: isAdminOrManager ? 0 : 8,
              transition: "all 0.3s ease",
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={user ? (user.role === "admin" ? (<Navigate to="/manage-services" />) : (                     <Navigate to={`/${user.role}-dashboard`} />)) : (<UserDashboard />)}/>

              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-manager" element={<Register />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/search-filter" element={<SearchBar />} />
              <Route path="/catering/:cateringServiceId/feedback" element={<FeedbackList />} />
              <Route path="/catering/:cateringServiceId" element={<CateringServiceDetails />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute user={user} allowedRoles={["user"]} />}>
                <Route path="/book/:cateringServiceId" element={<Booking />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/user-bookings" element={<UserBookings />} />
                <Route path="/profile" element={<UserProfile />} />
              </Route>

              <Route element={<ProtectedRoute user={user} allowedRoles={["admin"]} />}>
                <Route path="/admin-feedback" element={<AdminFeedback />} />
                <Route path="/manage-services" element={<CateringServiceAdmin />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin-contacts" element={<AdminContactView />} />
              </Route>

              <Route element={<ProtectedRoute user={user} allowedRoles={["manager"]} />}>
                <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/menu-items/manage" element={<MenuItemManager />} />
                <Route path="/manager/menu-items/manage/:cateringServiceId" element={<MenuItemManager />} />
                <Route path="/manager/menu-items/add" element={<ManageMenuItem />} />
                <Route path="/manager/menu-items/edit/:id" element={<ManageMenuItem />} />
                <Route path="/manage-menu" element={<MenuItemManager />} />
                <Route path="/manage-bookings" element={<ManagerBookings />} />
                <Route path="/feedback/:cateringServiceId" element={<ViewFeedback />} />
                <Route path="/manager/catering-services" element={<ManagerCateringServices />} />
                <Route path="/manager/catering-services/add" element={<CateringServiceForm />} />
                <Route path="/manager/catering-services/edit/:id" element={<CateringServiceForm />} />
              </Route>

              <Route element={<ProtectedRoute user={user} allowedRoles={["user", "manager"]} />}>
                <Route path="/contact" element={<ContactForm />} />
              </Route>

              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/unauthorized" element={<Unauthorized/>} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;