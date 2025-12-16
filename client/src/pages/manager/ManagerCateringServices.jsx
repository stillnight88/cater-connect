import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  useTheme
} from "@mui/material";
import { FiEdit, FiTrash2, FiPlus, FiMapPin, FiInfo } from "react-icons/fi";
import { BiDish } from "react-icons/bi";

const API_BASE_URL = "http://localhost:5000";

const ManagerCateringServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const theme = useTheme();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  // Configure axios headers with token
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch manager's catering services
  useEffect(() => {
    const fetchManagerServices = async () => {
      setLoading(true);
      try {
        // Get user info to verify manager role
        const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, axiosConfig);
        const fetchedUser = userResponse.data;

        if (fetchedUser.role !== "manager") {
          setError("Access denied. Only managers can view this page.");
          setLoading(false);
          return;
        }

        // Fetch all catering services
        const servicesResponse = await axios.get(
          `${API_BASE_URL}/api/catering-services`,
          axiosConfig
        );
        const allServices = servicesResponse.data || [];

        // Filter services to only show those managed by the current user
        const managerServices = allServices.filter(
          (service) => service?.manager?._id === fetchedUser._id
        );

        // Process services to format data
        const processedServices = managerServices.map((service) => {
          const isVegetarian = service.categories?.some(
            (category) => category?.name === "Veg"
          );

          return {
            ...service,
            isVegetarian: isVegetarian || false,
            imageUrl: service.image ? `${API_BASE_URL}${service.image}` : null,
          };
        });

        setServices(processedServices);
      } catch (err) {
        console.error("Error fetching manager's services:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load catering services. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchManagerServices();
    } else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  // Handle delete confirmation dialog
  const openDeleteDialog = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  // Handle service deletion
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/catering-services/${serviceToDelete._id}`,
        axiosConfig
      );

      setServices(services.filter((service) => service._id !== serviceToDelete._id));
      setSnackbar({
        open: true,
        message: "Catering service deleted successfully",
        severity: "success",
      });
      closeDeleteDialog();
    } catch (err) {
      console.error("Error deleting service:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete service",
        severity: "error",
      });
      closeDeleteDialog();
    }
  };

  const handleEdit = (serviceId) => {
    navigate(`/manager/catering-services/edit/${serviceId}`);
  };

  const handleViewFeedback = (serviceId) => {
    navigate(`/feedback/${serviceId}`);
  };

  const handleAddNew = () => {
    navigate("/manager/catering-services/add");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fallbackImageUrl = "/placeholder-catering.jpg";

  // Get color for status chip
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  };

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={50} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
          Loading your catering services...
        </Typography>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box sx={{ py: 8, px: 2 }}>
        <Alert 
          severity="error"
          variant="outlined"
          sx={{ 
            borderRadius: 1,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 1,
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap",
          gap: 2
        }}>
          <Typography 
            variant="h5" 
            component="h1"
            sx={{ fontWeight: 500 }}
          >
            My Catering Services
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<FiPlus />}
            onClick={handleAddNew}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              px: 2,
              py: 1
            }}
          >
            Add New Service
          </Button>
        </Box>
      </Paper>

      {services.length === 0 ? (
        <Paper 
          elevation={1}
          sx={{ 
            textAlign: "center", 
            py: 6,
            px: 3,
            borderRadius: 1
          }}
        >
          <BiDish size={60} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            You haven't added any catering services yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FiPlus />}
            onClick={handleAddNew}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              px: 3
            }}
          >
            Add Your First Service
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} lg={4} key={service._id}>
              <Card 
                sx={{ 
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease-in-out",
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                    transform: "translateY(-4px)"
                  }
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={service.imageUrl || fallbackImageUrl}
                    alt={service.name}
                    sx={{ objectFit: "cover" }}
                  />
                  {/* Status banner instead of floating chip */}
                  {service.status && (
                    <Box 
                      sx={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        width: "100%", 
                        bgcolor: theme.palette[getStatusColor(service.status)].main + "CC", // semi-transparent
                        color: "#fff",
                        py: 0.5,
                        px: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                        {formatStatus(service.status)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{ fontWeight: 500, mb: 1, color: "text.primary" }}
                  >
                    {service.name}
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <FiMapPin size={16} color={theme.palette.text.secondary} />
                    <Typography 
                      variant="body2" 
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      {service.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    <Chip
                      label={service.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                      size="small"
                      sx={{ 
                        bgcolor: service.isVegetarian ? "#e8f5e9" : "#fff3e0",
                        color: service.isVegetarian ? "#2e7d32" : "#e65100",
                        border: "1px solid",
                        borderColor: service.isVegetarian ? "#a5d6a7" : "#ffe0b2",
                        fontWeight: 500,
                        fontSize: 12
                      }}
                    />
                    {service.galleryImages && service.galleryImages.length > 0 && (
                      <Chip
                        label={`${service.galleryImages.length} photos`}
                        size="small"
                        sx={{ 
                          bgcolor: "#e3f2fd",
                          color: "#1565c0",
                          border: "1px solid #bbdefb",
                          fontWeight: 500,
                          fontSize: 12
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 1,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      lineHeight: 1.5
                    }}
                  >
                    {service.description || "No description available."}
                  </Typography>
                </CardContent>
                
                <Box sx={{ mt: "auto" }}>
                  <Divider />
                  <CardActions sx={{ p: 2, justifyContent: "space-between" }}>
                    <Box>
                      <Tooltip title="Edit service details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(service._id)}
                          sx={{ mr: 1 }}
                        >
                          <FiEdit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete service">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(service)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={() => handleViewFeedback(service._id)}
                      sx={{ 
                        borderRadius: 1,
                        textTransform: "none",
                        fontSize: 13
                      }}
                    >
                      View Feedback
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete confirmation dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={closeDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: 1,
            width: { xs: "90%", sm: "auto" }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.primary" }}>
            Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={closeDeleteDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 1,
              textTransform: "none" 
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: 1,
              textTransform: "none" 
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: "100%",
            borderRadius: 1
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerCateringServices;