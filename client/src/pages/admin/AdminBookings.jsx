import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import { Refresh as RefreshIcon, Restaurant as MenuIcon } from "@mui/icons-material";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get("http://localhost:5000/api/bookings/", config);
      console.log("Fetched Bookings:", response.data); // Debug API response
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Helper function to determine status chip color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "approved":
        return {
          bg: theme.palette.success.main,
          color: theme.palette.success.contrastText,
        };
      case "pending":
        return {
          bg: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
        };
      case "cancelled":
      case "rejected":
        return {
          bg: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        };
      default:
        return {
          bg: theme.palette.grey[500],
          color: theme.palette.getContrastText(theme.palette.grey[500]),
        };
    }
  };

  // Format price with Indian Rupees and locale formatting
  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  // Calculate total price for a booking's menu items with debugging
  const calculateTotal = (menuItems) => {
    if (!menuItems || !Array.isArray(menuItems)) {
      console.warn("No valid menuItems array provided:", menuItems);
      return 0;
    }
    const total = menuItems.reduce((sum, item) => {
      const price = Number(item?.item?.price || 0);
      const quantity = Number(item?.quantity || 1);
      console.log(`Item: ${item?.item?.name}, Price: ${price}, Qty: ${quantity}, Subtotal: ${price * quantity}`);
      return sum + price * quantity;
    }, 0);
    console.log("Calculated Total:", total);
    return total;
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress thickness={4} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert
          severity="error"
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Card
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3, pb: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight="500" color="primary.main">
              All Bookings
            </Typography>
            <Tooltip title="Refresh data">
              <IconButton
                onClick={fetchBookings}
                color="primary"
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </CardContent>

        <TableContainer component={Box} sx={{ p: { xs: 1, sm: 3 } }}>
          <Table sx={{ minWidth: 800, tableLayout: "fixed" }} aria-label="bookings table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: "bold", width: "100px" }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "150px" }}>User</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "150px" }}>Catering Service</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "150px" }}>Event Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "150px" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "100px" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "300px" }}>Menu Items</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length > 0 ? (
                bookings.map((booking) => {
                  const statusColor = getStatusColor(booking.status);
                  const totalPrice = calculateTotal(booking.menuItems);
                  return (
                    <TableRow
                      key={booking._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                        {booking._id?.substring(0, 8) || "N/A"}...
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {booking.user?.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.user?.email || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {booking.cateringService?.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.eventDate ? (
                          <Box>
                            <Typography variant="body2">
                              {new Date(booking.eventDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(booking.eventDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          </Box>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{booking.eventLocation || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status || "N/A"}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 500,
                            minWidth: 90,
                            textAlign: "center",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            maxHeight: 150,
                            overflow: "auto",
                            "&::-webkit-scrollbar": {
                              width: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              borderRadius: "4px",
                            },
                          }}
                        >
                          {booking.menuItems && booking.menuItems.length > 0 ? (
                            <>
                              {booking.menuItems.map((item, index) => (
                                <Box
                                  key={item.item?._id || `item-${index}`}
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mb={0.5}
                                >
                                  <MenuIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {item.item?.name || "Unknown Item"} (Qty: {item.quantity || 1}) -{" "}
                                    {formatPrice((item.item?.price || 0) * (item.quantity || 1))}
                                  </Typography>
                                </Box>
                              ))}
                              <Divider sx={{ my: 1 }} />
                              <Typography
                                variant="body1"
                                fontWeight="700"
                                color="success.main"
                                sx={{
                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  display: "inline-block",
                                  textAlign: "right",
                                  width: "fit-content",
                                  float: "right",
                                }}
                              >
                                Total: {formatPrice(totalPrice)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No items
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No bookings found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
};

export default AdminBookings;