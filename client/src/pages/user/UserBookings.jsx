import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { styled } from "@mui/material/styles";

// Custom styled components (unchanged)
const BookingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
  borderRadius: "12px",
  overflow: "hidden",
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  let color = "default";
  switch (status?.toLowerCase() || "") {
    case "confirmed":
      color = "success";
      break;
    case "pending":
      color = "warning";
      break;
    case "cancelled":
      color = "error";
      break;
    default:
      color = "info";
  }
  return {
    fontWeight: 500,
    color: theme.palette.getContrastText(theme.palette[color].main),
  };
});

const IconWithText = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const MenuItemCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: "8px",
  backgroundColor: theme.palette.background.default,
}));

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const res = await axios.get("http://localhost:5000/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(
          error.response?.data?.message || error.message || "Failed to fetch bookings."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Format currency
  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date provided";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  // Calculate total price of menu items considering quantity
  const calculateTotal = (menuItems) => {
    if (!menuItems || !Array.isArray(menuItems)) return 0;
    return menuItems.reduce(
      (sum, item) =>
        sum + Number(item?.item?.price || 0) * Number(item?.quantity || 1),
      0
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading your bookings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", py: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 4,
          borderBottom: "2px solid",
          borderColor: "primary.main",
          paddingBottom: 1,
          paddingLeft: 3,
        }}
      >
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, mx: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {(!bookings || bookings.length === 0) && !error ? (
        <Paper sx={{ p: 4, mx: 3, borderRadius: "12px" }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your future bookings will appear here.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ px: 3 }}>
          {bookings.map((booking, index) => (
            <BookingCard
              key={booking?._id || `booking-${index}`} // Fixed key syntax
              elevation={2}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                  }}
                >
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {booking?.cateringService?.name || "Unknown Service"}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <StatusChip
                        status={booking?.status || "Unknown"}
                        color="primary"
                        label={booking?.status || "Unknown"}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <IconWithText>
                        <EventIcon />
                        <Typography variant="body1">
                          {formatDate(booking?.eventDate)}
                        </Typography>
                      </IconWithText>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <IconWithText>
                        <LocationOnIcon />
                        <Typography variant="body1">
                          {booking?.eventLocation || "No location specified"}
                        </Typography>
                      </IconWithText>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle1"
                    sx={{ display: "flex", alignItems: "center", mb: 2, fontWeight: 500 }}
                  >
                    <RestaurantIcon sx={{ mr: 1 }} /> Menu Items
                  </Typography>

                  {booking?.menuItems && booking.menuItems.length > 0 ? (
                    <List disablePadding>
                      {booking.menuItems.map((menu, idx) => (
                        <MenuItemCard
                          key={menu?.item?._id || `menu-${idx}`}
                          variant="outlined"
                        >
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {menu?.item?.name || "Unknown Item"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {menu?.quantity || 1}
                            </Typography>
                          </Box>
                          <Typography variant="body1" color="primary.main" fontWeight={600}>
                            {formatPrice((menu?.item?.price || 0) * (menu?.quantity || 1))}
                          </Typography>
                        </MenuItemCard>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No menu items selected
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 2,
                      p: 2,
                      backgroundColor: "background.default",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Total: {formatPrice(calculateTotal(booking?.menuItems))}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </BookingCard>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserBookings;