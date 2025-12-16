import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import { styled, alpha } from "@mui/material/styles";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";

// Styled components with improved aesthetics
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
  boxShadow: `0 3px 15px 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  padding: theme.spacing(0.5, 2),
  borderRadius: "30px",
  textTransform: "none",
  fontWeight: 500,
  color: theme.palette.common.white,
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease-in-out",
  letterSpacing: "0.5px",
  
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: 0,
    height: "2px",
    backgroundColor: theme.palette.common.white,
    transition: "all 0.3s ease-in-out",
    transform: "translateX(-50%)",
  },

  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    transform: "translateY(-2px)",
    
    "&::after": {
      width: "80%",
    },
  },
  
  "&.active": {
    "&::after": {
      width: "80%",
    },
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  transition: "all 0.2s ease",
  
  "&:hover": {
    backgroundColor: alpha(theme.palette.secondary.light, 0.1),
    transform: "translateX(4px)",
  },
}));

const BrandLogo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  border: `2px solid ${theme.palette.common.white}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
  transition: "all 0.3s ease",
  
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`,
  },
}));

const NavbarMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius * 1.5,
    minWidth: 180,
    boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.1)}`,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));

const Navbar = ({ user, setUser, scrollToServices }) => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  
  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <StyledAppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <BrandLogo
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
            }}
          >
            <DinnerDiningIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: 1,
                position: "relative",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              CaterConnect
            </Typography>
          </BrandLogo>

          {/* Mobile Brand Logo */}
          <BrandLogo
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
            }}
          >
            <DinnerDiningIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              CaterConnect
            </Typography>
          </BrandLogo>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleOpenNavMenu}
              sx={{
                "&:hover": { 
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  transform: "rotate(180deg)",
                  transition: "all 0.4s ease"
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <NavbarMenu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <StyledMenuItem
                component={Link}
                to="/"
                onClick={handleCloseNavMenu}
              >
                Home
              </StyledMenuItem>
              <StyledMenuItem
                component={Link}
                to="/about"
                onClick={handleCloseNavMenu}
              >
                About
              </StyledMenuItem>
              <StyledMenuItem
                onClick={() => {
                  scrollToServices();
                  handleCloseNavMenu();
                }}
              >
                Services
              </StyledMenuItem>
              {user?.role === "user" && (
                <StyledMenuItem
                  component={Link}
                  to="/user-dashboard"
                  onClick={handleCloseNavMenu}
                >
                  Dashboard
                </StyledMenuItem>
              )}
              {user ? (
                <StyledMenuItem onClick={handleLogout}>Logout</StyledMenuItem>
              ) : (
                <>
                  <StyledMenuItem
                    component={Link}
                    to="/login"
                    onClick={handleCloseNavMenu}
                  >
                    Login
                  </StyledMenuItem>
                  <StyledMenuItem
                    component={Link}
                    to="/register"
                    onClick={handleCloseNavMenu}
                    sx={{ fontWeight: 600 }}
                  >
                    Register
                  </StyledMenuItem>
                </>
              )}
            </NavbarMenu>
          </Box>

          {/* Desktop Menu */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            <StyledButton component={Link} to="/">
              Home
            </StyledButton>
            <StyledButton component={Link} to="/about">
              About
            </StyledButton>
            <StyledButton onClick={scrollToServices}>
              Services
            </StyledButton>
            {user?.role === "user" && (
              <StyledButton component={Link} to="/user-bookings">
                My Bookings
              </StyledButton>
            )}
            {!user && (
              <>
                <StyledButton component={Link} to="/login">
                  Login
                </StyledButton>
                <StyledButton
                  component={Link}
                  to="/register"
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      transform: "translateY(-2px) scale(1.03)",
                    },
                  }}
                >
                  Register
                </StyledButton>
              </>
            )}
          </Box>

          {/* User Profile */}
          {user && (
            <Box sx={{ ml: 2 }}>
              <Tooltip title="Profile settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <UserAvatar
                    alt={user.name}
                    src={
                      user.image
                        ? `http://localhost:5000/${user.image.replace(
                            /\\/g,
                            "/"
                          )}`
                        : "/static/images/avatar/default.jpg"
                    }
                  />
                </IconButton>
              </Tooltip>
              <NavbarMenu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ px: 2, pt: 1, pb: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Hello, {user.name}
                </Typography>
                <StyledMenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleCloseUserMenu}
                >
                  Profile
                </StyledMenuItem>
                <StyledMenuItem onClick={handleLogout}>Logout</StyledMenuItem>
              </NavbarMenu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;