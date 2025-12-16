import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  CardMedia,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { FiSave, FiArrowLeft, FiUpload } from "react-icons/fi";

const ManageMenuItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const queryParams = new URLSearchParams(location.search);
  const cateringServiceIdFromQuery = queryParams.get("cateringServiceId");
  const menuItemFromState = location.state?.menuItem;

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    cateringServiceId: cateringServiceIdFromQuery || (menuItemFromState?.cateringService?._id || menuItemFromState?.cateringService || ""),
    image: null,
    description: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setAlert({
          open: true,
          message: "No authentication token found. Please log in.",
          severity: "error",
        });
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data: categoriesData } = await axios.get("http://localhost:5000/api/categories", config);
        setCategories(categoriesData);

        if (isEditMode) {
          let menuItemData;
          if (menuItemFromState) {
            menuItemData = menuItemFromState;
            console.log("Using menuItemFromState:", menuItemFromState); // Debug: Check state data
          } else {
            const response = await axios.get(`http://localhost:5000/api/menu-items/${id}`, config);
            menuItemData = response.data;
            console.log("Fetched menuItemData from API:", menuItemData); // Debug: Check API data
          }

          setFormData({
            name: menuItemData.name || "",
            price: menuItemData.price || "",
            categoryId: menuItemData.category?._id || menuItemData.category || "",
            cateringServiceId: menuItemData.cateringService?._id || menuItemData.cateringService || "",
            description: menuItemData.description || "",
          });

          if (menuItemData.image) {
            // Construct full URL assuming relative path from backend
            const imageUrl = menuItemData.image.startsWith("http")
              ? menuItemData.image // Full URL already
              : `http://localhost:5000/${menuItemData.image.replace(/\\/g, "/")}`; // Relative path
            console.log("Setting previewImage to:", imageUrl); // Debug: Verify URL
            setPreviewImage(imageUrl);
          } else {
            console.log("No image found in menuItemData"); // Debug: No image case
            setPreviewImage(null);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setAlert({
          open: true,
          message: `Error loading data: ${err.response?.data?.message || "Unknown error"}`,
          severity: "error",
        });
      }
    };

    fetchData();
  }, [id, isEditMode, menuItemFromState, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("New previewImage from upload:", reader.result); // Debug: Check upload preview
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cateringServiceId) {
      setAlert({ open: true, message: "Catering Service ID is required", severity: "error" });
      return;
    }
    if (!token) {
      setAlert({ open: true, message: "No authentication token found. Please log in.", severity: "error" });
      return;
    }

    setLoading(true);
    console.log("Submitting form in mode:", isEditMode ? "edit" : "add");
    console.log("Form data:", formData);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("cateringServiceId", formData.cateringServiceId);
      if (formData.description) formDataToSend.append("description", formData.description);
      if (formData.image) formDataToSend.append("image", formData.image);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (isEditMode) {
        response = await axios.put(`http://localhost:5000/api/menu-items/${id}`, formDataToSend, config);
        console.log("Update response:", response.data);
        setAlert({ open: true, message: "Menu item updated successfully!", severity: "success" });
        // Update previewImage with new image URL if returned
        if (response.data.image) {
          const newImageUrl = response.data.image.startsWith("http")
            ? response.data.image
            : `http://localhost:5000/${response.data.image.replace(/\\/g, "/")}`;
          setPreviewImage(newImageUrl);
        }
      } else {
        response = await axios.post("http://localhost:5000/api/menu-items", formDataToSend, config);
        console.log("Add response:", response.data);
        setAlert({ open: true, message: "Menu item added successfully!", severity: "success" });
      }

      setTimeout(() => {
        navigate(`/manager/menu-items/manage/${formData.cateringServiceId}`);
      }, 1500);
    } catch (err) {
      console.error("Error submitting form:", err);
      setAlert({
        open: true,
        message: `Error: ${err.response?.data?.message || "Unknown error occurred"}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!formData.cateringServiceId) {
      navigate("/manager/menu-items/manage");
      return;
    }
    navigate(`/manager/menu-items/manage/${formData.cateringServiceId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? "Edit Menu Item" : "Add New Menu Item"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Dish Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
              />
              <TextField
                name="price"
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="description"
                label="Description"
                value={formData.description || ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Item Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FiUpload />}
                  sx={{ mb: 2 }}
                >
                  Upload Image
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>
                {previewImage && (
                  <Card sx={{ mb: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={previewImage}
                      alt="Menu item preview"
                      sx={{ objectFit: "contain" }}
                    />
                  </Card>
                )}
                {!previewImage && (
                  <Box
                    sx={{
                      height: 200,
                      border: "1px dashed grey",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "background.paper",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No image uploaded
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={handleCancel} startIcon={<FiArrowLeft />}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <FiSave />}
                >
                  {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageMenuItem;