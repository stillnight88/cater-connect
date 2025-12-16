import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Box,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import RefreshIcon from "@mui/icons-material/Refresh";

const BookingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: "12px",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": { transform: "translateY(-4px)", boxShadow: theme.shadows[4] },
  position: "relative",
  overflow: "hidden",
}));

const StatusSelect = styled(Select)(({ value, theme }) => {
  const getColor = () => {
    switch (value) {
      case "approved":
        return theme.palette.success.main;
      case "rejected":
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };
  return { "& .MuiSelect-select": { color: getColor(), fontWeight: "bold" }, minWidth: "140px" };
});

const IconWithText = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
  "& .MuiSvgIcon-root": { marginRight: theme.spacing(1), color: theme.palette.primary.main },
}));

const MenuItemsList = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const ManagerBookings = () => {
  const { cateringServiceId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [cateringServices, setCateringServices] = useState([]);
  const [selectedService, setSelectedService] = useState(cateringServiceId || "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const manager = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const initializeData = async () => {
      if (!manager || !manager.token) {
        setError("No user data or token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/catering-services",
          { headers: { Authorization: `Bearer ${manager.token}` } }
        );
        const managerServices = data.filter((s) => s.manager._id === manager._id);
        setCateringServices(managerServices);
        if (managerServices.length === 0) {
          setError("No catering services found for this manager.");
          setLoading(false);
          return;
        }
        if (cateringServiceId && managerServices.some((s) => s._id === cateringServiceId)) {
          setSelectedService(cateringServiceId);
        }
      } catch (err) {
        setError("Failed to fetch catering services: " + (err.response?.data?.message || err.message));
        setLoading(false);
        return;
      }

      fetchBookings();
    };

    initializeData();
  }, [cateringServiceId]);

  const fetchBookings = async () => {
    if (!manager || !manager.token) return;
    try {
      setRefreshing(true);
      let url = "http://localhost:5000/api/bookings/";
      if (selectedService !== "all") {
        url += selectedService;
      }
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${manager.token}` },
      });
      setBookings(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch bookings: " + (err.response?.data?.message || err.message));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${manager.token}` } }
      );
      fetchBookings();
    } catch (err) {
      alert("Error updating status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleServiceChange = (event) => {
    const newService = event.target.value;
    setSelectedService(newService);
    fetchBookings();
  };

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const calculateTotal = (menuItems) => {
    if (!menuItems || !Array.isArray(menuItems)) return 0;
    return menuItems.reduce(
      (sum, item) => sum + Number(item?.item?.price || 0) * Number(item?.quantity || 1),
      0
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", pl: 3, pt: 4 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Loading bookings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", textAlign: "left" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          borderBottom: "1px solid",
          borderColor: "divider",
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Bookings Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl sx={{ mr: 2, minWidth: 200 }}>
            <InputLabel id="catering-service-select-label">Catering Service</InputLabel>
            <Select
              labelId="catering-service-select-label"
              value={selectedService}
              label="Catering Service"
              onChange={handleServiceChange}
            >
              <MenuItem value="all">All Services</MenuItem>
              {cateringServices.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh bookings">
            <IconButton onClick={fetchBookings} disabled={refreshing} color="primary" size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {bookings.length === 0 && !error ? (
          <Paper sx={{ p: 3, borderRadius: "8px", textAlign: "left" }}>
            <Typography variant="subtitle1">No bookings found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              New booking requests will appear here when customers make reservations.
            </Typography>
          </Paper>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking._id} elevation={2}>
              <Box sx={{ p: 2, backgroundColor: "primary.light", color: "primary.contrastText" }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Booking #{booking._id.slice(-6)} -{" "}
                      {booking.cateringService?.name || "Unknown Service"}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      label={booking.status.toUpperCase()}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <IconWithText>
                      <PersonIcon />
                      <Typography variant="body1" fontWeight={500}>
                        {booking.user.name}
                      </Typography>
                    </IconWithText>
                    <IconWithText>
                      <EventIcon />
                      <Typography variant="body1">{formatDate(booking.eventDate)}</Typography>
                    </IconWithText>
                    <IconWithText>
                      <LocationOnIcon />
                      <Typography variant="body1">{booking.eventLocation}</Typography>
                    </IconWithText>
                    {booking.menuItems && booking.menuItems.length > 0 && (
                      <MenuItemsList>
                        <Typography
                          variant="subtitle2"
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <RestaurantIcon fontSize="small" sx={{ mr: 1 }} />
                          Menu Selection
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        {booking.menuItems.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              • {item.item?.name || "Unknown item"} (Qty: {item.quantity || 1})
                            </Typography>
                            <Typography variant="body2" color="primary.main">
                              {formatPrice((item.item?.price || 0) * (item.quantity || 1))}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Typography
                          variant="subtitle2"
                          sx={{ textAlign: "right", fontWeight: 600 }}
                        >
                          Total: {formatPrice(calculateTotal(booking.menuItems))}
                        </Typography>
                      </MenuItemsList>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "flex-start",
                      }}
                    >
                      <FormControl fullWidth sx={{ maxWidth: "200px" }}>
                        <InputLabel id={`status-label-${booking._id}`}>Status</InputLabel>
                        <StatusSelect
                          labelId={`status-label-${booking._id}`}
                          value={booking.status}
                          label="Status"
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </StatusSelect>
                      </FormControl>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Last updated: {new Date(booking.updatedAt || Date.now()).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </BookingCard>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ManagerBookings;