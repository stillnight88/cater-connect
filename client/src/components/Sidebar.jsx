import React, { useState } from "react";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiSettings, FiBook, FiCalendar, FiHeadphones, FiMessageSquare, FiLogOut, FiMenu, FiHome, FiUsers } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

// Styled components with improved aesthetics
const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  position: "relative",
  width: '100%', // Ensures content fills drawer width
  display: 'flex',
  flexDirection: 'column'
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? theme.palette.primary.light : "transparent",
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  transition: 'all 0.15s ease-in-out',
  position: 'relative',
  paddingLeft: theme.spacing(1.5),
  "&:hover": {
    backgroundColor: active ? theme.palette.primary.light : theme.palette.action.hover,
    transform: 'translateX(2px)',
    boxShadow: active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    opacity: active ? 1 : 0,
    transition: 'opacity 0.2s'
  }
}));

const UserRole = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[600],
  fontSize: '0.8rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginTop: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    marginRight: theme.spacing(0.8)
  }
}));

const MenuSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  width: '100%'
}));

const MenuSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.8),
  paddingLeft: theme.spacing(1)
}));

const Sidebar = ({ user, setUser }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the current path to determine which item is active
  const currentPath = location.pathname;

  // Base menu items for all users
  const baseMenuItems = [
    // { text: "Home", icon: <FiHome size={18} />, path: "/" },
    { text: "Logout", icon: <FiLogOut size={18} />, path: "/logout" }
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    { text: "Manage Services", icon: <FiSettings size={18} />, path: "/manage-services" },
    { text: "View Bookings", icon: <FiUsers size={18} />, path: "/admin/bookings" },
    { text: "View Feedback", icon: <FiMessageSquare size={18} />, path: "/admin-feedback" },
    { text: "View Contacts", icon: <FiMessageSquare size={18} />, path: "/admin-contacts" }
  ];

  // Manager-specific menu items
  const managerMenuItems = [
    { text: "Manage Service", icon: <FiHome size={18} />, path: "/manager/catering-services" },
    { text: "Manage Menu", icon: <FiBook size={18} />, path: "/manager/menu-items/manage" },
    { text: "Bookings", icon: <FiCalendar size={18} />, path: "/manage-bookings" },
    { text: "Feedback", icon: <FiMessageSquare size={18} />, path: "/feedback/:cateringServiceId" },
    { text: "Support", icon: <FiHeadphones size={18} />, path: "/contact" }
  ];

  // Combine the appropriate menu items based on user role
  let mainMenuItems = [];
  let utilityMenuItems = [...baseMenuItems];
  
  if (user) {
    if (user.role === "admin") {
      mainMenuItems = [...adminMenuItems];
    } else if (user.role === "manager") {
      mainMenuItems = [...managerMenuItems];
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (setUser) {
      setUser(null);
    }
    navigate("/login");
  };

  const handleItemClick = (path) => {
    if (path === "/logout") {
      handleLogout();
    } else {
      navigate(path);
    }
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  // Check if a menu item should be active based on current path
  const isItemActive = (path) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path.split("/:")[0]);
  };

  const drawerContent = (
    <SidebarContent>
      <DrawerHeader>
        <Avatar
          src={user?.image ? `http://localhost:5000/${user.image.replace(/\\/g, '/')}` : '/static/images/avatar/default.jpg'}
          alt={user?.name || "User"}
          sx={{ 
            width: 48, 
            height: 48, 
            marginRight: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            border: `2px solid ${theme.palette.background.paper}`
          }}
        />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            {user ? user.name : "Guest User"}
          </Typography>
          <UserRole>
            {user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Not logged in"}
          </UserRole>
        </Box>
      </DrawerHeader>

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        width: '100%',
        padding: theme.spacing(1, 0)
      }}>
        {mainMenuItems.length > 0 && (
          <MenuSection>
            <MenuSectionTitle>Main Menu</MenuSectionTitle>
            <List disablePadding>
              {mainMenuItems.map((item) => (
                <StyledListItem
                  button
                  key={item.text}
                  active={isItemActive(item.path) ? 1 : 0}
                  onClick={() => handleItemClick(item.path)}
                  aria-label={item.text}
                  dense
                >
                  <ListItemIcon sx={{ 
                    color: "inherit", 
                    minWidth: '36px',
                    opacity: isItemActive(item.path) ? 1 : 0.75
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isItemActive(item.path) ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                </StyledListItem>
              ))}
            </List>
          </MenuSection>
        )}

        <MenuSection>
          <MenuSectionTitle>Account</MenuSectionTitle>
          <List disablePadding>
            {utilityMenuItems.map((item) => (
              <StyledListItem
                button
                key={item.text}
                active={isItemActive(item.path) ? 1 : 0}
                onClick={() => handleItemClick(item.path)}
                aria-label={item.text}
                dense
              >
                <ListItemIcon sx={{ 
                  color: "inherit", 
                  minWidth: '36px',
                  opacity: isItemActive(item.path) ? 1 : 0.75
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isItemActive(item.path) ? 600 : 400,
                    fontSize: '0.9rem'
                  }}
                />
              </StyledListItem>
            ))}
          </List>
        </MenuSection>
      </Box>

      <Box sx={{ 
        padding: theme.spacing(2), 
        textAlign: 'center',
        opacity: 0.6,
        borderTop: `1px solid ${theme.palette.divider}`,
        marginTop: 'auto'
      }}>
        <Typography variant="caption" color="textSecondary">
          © {new Date().getFullYear()} CaterConnect
        </Typography>
      </Box>
    </SidebarContent>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            margin: 1.5, 
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
            '&:hover': {
              backgroundColor: theme.palette.primary.light
            }
          }}
        >
          <FiMenu size={20} />
        </IconButton>
      )}

      <Box
        component="nav"
        sx={{ 
          width: { md: 240 }, // Reduced width
          flexShrink: { md: 0 }
        }}
        aria-label="sidebar navigation"
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { 
                width: 240, // Reduced width
                boxSizing: "border-box",
                boxShadow: '0 0 15px rgba(0,0,0,0.1)'
              }
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": { 
                width: 240, // Reduced width
                boxSizing: "border-box",
                borderRight: '1px solid rgba(0,0,0,0.08)'
              }
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;