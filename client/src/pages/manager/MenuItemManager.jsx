import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, CardMedia, Container, Grid, Typography, IconButton, TextField,
  Select, MenuItem, FormControl, InputLabel, Slider, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, DialogContentText, Snackbar, Alert
} from "@mui/material";
import { styled } from "@mui/system";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import debounce from "lodash/debounce"; // Add lodash for debouncing

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
}));

const MenuItemManager = () => {
  const { cateringServiceId: initialServiceId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managedServices, setManagedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(initialServiceId || "");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  // Fetch managed catering services
  useEffect(() => {
    const fetchManagedServices = async () => {
      if (!token) {
        setAlert({ open: true, message: "No authentication token found. Please log in.", severity: "error" });
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("http://localhost:5000/api/catering-services/managed", config);
        setManagedServices(data);
        if (!initialServiceId && data.length > 0) {
          setSelectedService(data[0]._id);
          navigate(`/manager/menu-items/manage/${data[0]._id}`, { replace: true });
        } else if (initialServiceId && !data.some((service) => service._id === initialServiceId)) {
          setAlert({ open: true, message: "Invalid or unauthorized catering service ID.", severity: "error" });
          setTimeout(() => navigate("/manager/catering-services"), 2000);
        }
      } catch (err) {
        setAlert({
          open: true,
          message: err.response?.data?.message || "Failed to fetch managed services",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchManagedServices();
  }, [token, navigate, initialServiceId]);

  // Fetch menu items for the selected service
  useEffect(() => {
    if (!selectedService) return;

    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory);
        queryParams.append("minPrice", priceRange[0]);
        queryParams.append("maxPrice", priceRange[1]);
        queryParams.append("cateringServiceId", selectedService);

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/menu-items?${queryParams.toString()}`, config);
        setMenuItems(data);
      } catch (err) {
        setAlert({ open: true, message: "Failed to fetch menu items", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedService, selectedCategory, priceRange, token]);

  // Fetch categories for the selected service
  useEffect(() => {
    if (!selectedService || !token) return;

    const fetchCategories = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/categories?cateringServiceId=${selectedService}`, config);
        setCategories(data);
      } catch (err) {
        setAlert({ open: true, message: "Failed to load categories", severity: "error" });
      }
    };
    fetchCategories();
  }, [selectedService, token]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [menuItems, searchTerm]);

  // Debounced price range handler
  const debouncedSetPriceRange = useCallback(
    debounce((newValue) => {
      setPriceRange(newValue);
    }, 300),
    []
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "http://localhost:5000/uploads/default-food-image.jpg";
    const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
    return `http://localhost:5000/${normalizedPath}`;
  };

  const handleEdit = (item, event) => {
    event.stopPropagation();
    navigate(`/manager/menu-items/edit/${item._id}`, { state: { menuItem: item } });
  };

  const handleDeleteClick = (item, event) => {
    event.stopPropagation();
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/menu-items/${itemToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(menuItems.filter((item) => item._id !== itemToDelete._id));
      setAlert({ open: true, message: "Menu item deleted successfully", severity: "success" });
    } catch (err) {
      setAlert({ open: true, message: "Failed to delete menu item", severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleServiceChange = (event) => {
    const newServiceId = event.target.value;
    setSelectedService(newServiceId);
    navigate(`/manager/menu-items/manage/${newServiceId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6">Loading menu items...</Typography>
      </Container>
    );
  }

  // Render no managed services state
  if (managedServices.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          You have no catering services assigned. Please create a catering service first.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/manager/catering-services/add")}
          sx={{ mt: 2 }}
        >
          Add Catering Service
        </Button>
      </Container>
    );
  }

  // Main content
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Menu Item Management</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Catering Service</InputLabel>
            <Select value={selectedService} onChange={handleServiceChange} label="Select Catering Service">
              {managedServices.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name} ({service.status})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/manager/menu-items/add?cateringServiceId=${selectedService}`)}
            disabled={!selectedService}
          >
            Add New Menu Item
          </Button>
        </Box>
      </Box>

      <Stack spacing={3}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search menu items..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <FiSearch size={20} /> }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ width: 200 }}>
            <Typography gutterBottom>Price Range (₹)</Typography>
            <Slider
              value={priceRange}
              onChange={(e, newValue) => debouncedSetPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              disabled={loading} // Disable during loading to prevent interaction
            />
          </Box>
        </Box>

        {/* Rest of the UI (Grid, Dialogs, etc.) remains unchanged */}
        <Grid container spacing={3}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <StyledCard onClick={() => setSelectedItem(item)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(item.image)}
                    alt={item.name}
                    loading="lazy"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{item.name}</Typography>
                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      ₹{item.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: "flex", mt: 2 }}>
                      <Button variant="outlined" startIcon={<FiEdit />} onClick={(e) => handleEdit(item, e)}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" startIcon={<FiTrash2 />} onClick={(e) => handleDeleteClick(item, e)}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No menu items found for this catering service. Add new items to get started.
              </Typography>
            </Box>
          )}
        </Grid>
      </Stack>

      {/* Dialogs and Snackbar remain unchanged */}
      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>{selectedItem.name}</DialogTitle>
            <DialogContent>
              <CardMedia
                component="img"
                height="300"
                image={getImageUrl(selectedItem.image)}
                alt={selectedItem.name}
                sx={{ borderRadius: 1, mb: 2 }}
              />
              <Typography variant="h6" color="primary">
                ₹{selectedItem.price.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category: {selectedItem.category ? selectedItem.category.name : "Uncategorized"}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
              <Button variant="outlined" startIcon={<FiEdit />} onClick={(e) => handleEdit(selectedItem, e)}>
                Edit
              </Button>
              <Button variant="outlined" color="error" startIcon={<FiTrash2 />} onClick={(e) => handleDeleteClick(selectedItem, e)}>
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MenuItemManager;