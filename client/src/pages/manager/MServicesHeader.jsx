import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme?.shadows?.[4] || "0 4px 6px rgba(0,0,0,0.1)",
  },
}));

const CategoryChip = styled(Chip)(({ theme, isveg }) => ({
  backgroundColor: isveg ? "#4caf50" : "#ff9800",
  color: "white",
  marginRight: theme?.spacing?.(1) || "8px",
  marginBottom: theme?.spacing?.(1) || "8px",
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  marginRight: theme?.spacing?.(1) || "8px",
  backgroundColor: color === "edit" ? "#2196f3" : "#f44336",
  color: "white",
  "&:hover": {
    backgroundColor: color === "edit" ? "#1976d2" : "#d32f2f",
  },
}));

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

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");

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
        const user = userResponse.data;

        if (user.role !== "manager") {
          setError("Access denied. Only managers can view this page.");
          setLoading(false);
          return;
        }

        // Fetch all catering services
        const servicesResponse = await axios.get(
          `${API_BASE_URL}/api/catering-services`,
          axiosConfig
        );
        const allServices = servicesResponse.data || []; // Default to empty array if null

        // Filter services to only show those managed by the current user
        const managerServices = allServices.filter(
          (service) => service?.manager?._id === user._id // Safe navigation
        );

        // Process services to format data
        const processedServices = managerServices.map((service) => {
          const isVegetarian = service.categories?.some(
            (category) => category?.name === "Veg"
          );

          return {
            ...service,
            isVegetarian: isVegetarian || false, // Default to false if undefined
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

      // Remove deleted service from state
      setServices(services.filter((service) => service._id !== serviceToDelete._id));

      // Show success message
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

  // Handle edit
  const handleEdit = (serviceId) => {
    navigate(`/manager/catering-services/edit/${serviceId}`);
  };

  // Handle add new
  const handleAddNew = () => {
    navigate("/manager/catering-services/add");
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Fallback image URL
  const fallbackImageUrl = "/placeholder-catering.jpg";

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading your catering services...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Catering Services
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FiPlus />}
          onClick={handleAddNew}
        >
          Add New Service
        </Button>
      </Box>

      {services.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" gutterBottom>
            You haven't added any catering services yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FiPlus />}
            onClick={handleAddNew}
            sx={{ mt: 2 }}
          >
            Add Your First Service
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} md={6} key={service._id}>
              <StyledCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={service.imageUrl || fallbackImageUrl}
                  alt={service.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {service.name}
                  </Typography>

                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    <strong>Location:</strong> {service.location}
                  </Typography>

                  <Box sx={{ my: 1 }}>
                    <CategoryChip
                      label={service.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                      isveg={service.isVegetarian} // Changed to lowercase 'isveg'
                    />
                    {service.status && (
                      <Chip
                        label={service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        color={
                          service.status === "approved"
                            ? "success"
                            : service.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                      />
                    )}
                  </Box>

                  <Typography variant="body2" paragraph>
                    {service.description || "No description available."}
                  </Typography>

                  {service.galleryImages && service.galleryImages.length > 0 && (
                    <Typography variant="caption" color="primary">
                      {service.galleryImages.length} photos in gallery
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2 }}>
                  <ActionButton
                    size="small"
                    color="edit"
                    startIcon={<FiEdit />}
                    onClick={() => handleEdit(service._id)}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    size="small"
                    color="delete"
                    startIcon={<FiTrash2 />}
                    onClick={() => openDeleteDialog(service)}
                  >
                    Delete
                  </ActionButton>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the catering service "{serviceToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManagerCateringServices;