import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Typography, Box, TextField, Button, Grid, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, Paper, CircularProgress, Alert, IconButton, CardMedia, Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiUpload, FiX, FiSave, FiArrowLeft } from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: "relative",
  width: "100%",
  height: 200,
  backgroundColor: "#f5f5f5",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const CateringServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    category: "Non-Veg",
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchCateringService = async () => {
      setFetchLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/catering-services/${id}`, axiosConfig);
        const service = response.data;
        const categories = service.categories || [];
        const latestCategory = categories.length > 0 ? categories[categories.length - 1] : null;
        setFormData({
          name: service.name || "",
          location: service.location || "",
          description: service.description || "",
          category: latestCategory?.name === "Veg" ? "Veg" : "Non-Veg",
        });
        if (service.image) setMainImagePreview(`${API_BASE_URL}${service.image}`);
      } catch (err) {
        console.error("Error fetching catering service:", err);
        setError(err.response?.data?.message || "Failed to load catering service data.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (token) fetchCateringService();
    else setError("No authentication token found. Please log in.");
  }, [id, token, axiosConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setMainImage(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("location", formData.location);
      formDataObj.append("description", formData.description);
      if (mainImage) formDataObj.append("image", mainImage);

      console.log("Submitting base form data:");
      for (let pair of formDataObj.entries()) console.log(`${pair[0]}: ${pair[1]}`);

      const config = {
        ...axiosConfig,
        headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" },
      };
      let response;

      if (isEditMode) {
        response = await axios.put(`${API_BASE_URL}/api/catering-services/${id}`, formDataObj, config);
      } else {
        response = await axios.post(`${API_BASE_URL}/api/catering-services`, formDataObj, config);
      }

      const cateringServiceId = response.data._id;

      // Fetch existing categories for the service
      console.log(`Fetching categories for service ${cateringServiceId}`);
      const categoriesResponse = await axios.get(
        `${API_BASE_URL}/api/categories?cateringServiceId=${cateringServiceId}`,
        axiosConfig
      );
      const existingCategories = categoriesResponse.data;
      console.log("Existing categories:", existingCategories);

      // Delete existing categories
      for (const category of existingCategories) {
        console.log(`Deleting category ${category._id}`);
        await axios.delete(`${API_BASE_URL}/api/categories/${category._id}`, axiosConfig);
      }

      // Check for an existing category with the selected name
      console.log(`Checking for existing ${formData.category} category`);
      const allCategoriesResponse = await axios.get(
        `${API_BASE_URL}/api/categories?cateringServiceId=${cateringServiceId}`,
        axiosConfig
      );
      const matchingCategory = allCategoriesResponse.data.find(cat => cat.name === formData.category);

      let categoryId;
      if (matchingCategory) {
        console.log(`Found existing ${formData.category} category:`, matchingCategory);
        categoryId = matchingCategory._id;
      } else {
        console.log(`No existing ${formData.category} category found, creating new one`);
        const categoryResponse = await axios.post(
          `${API_BASE_URL}/api/categories`,
          { cateringServiceId, name: formData.category },
          axiosConfig
        );
        categoryId = categoryResponse.data._id;
      }

      // Update the catering service with the single category ID
      console.log(`Setting category ${categoryId} for service ${cateringServiceId}`);
      await axios.put(
        `${API_BASE_URL}/api/catering-services/${cateringServiceId}`,
        { categories: [categoryId] },
        axiosConfig
      );

      setSnackbar({
        open: true,
        message: isEditMode ? "Catering service updated successfully" : "Catering service created successfully",
        severity: "success",
      });
      setTimeout(() => navigate("/manager/catering-services"), 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.message || "Failed to save catering service. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/manager/catering-services");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (fetchLoading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading catering service data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<FiArrowLeft />} onClick={handleCancel} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? "Edit Catering Service" : "Add New Catering Service"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
      )}

      <FormContainer elevation={2}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Catering Service Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Category</FormLabel>
                <RadioGroup
                  row
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="Veg" control={<Radio />} label="Vegetarian" />
                  <FormControlLabel value="Non-Veg" control={<Radio />} label="Non-Vegetarian" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Main Image
              </Typography>
              <Button component="label" variant="contained" startIcon={<FiUpload />}>
                Upload Main Image
                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleMainImageChange} />
              </Button>
              {mainImagePreview && (
                <ImagePreviewContainer>
                  <img
                    src={mainImagePreview}
                    alt="Main Preview"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setMainImage(null);
                      setMainImagePreview(null);
                    }}
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                    }}
                  >
                    <FiX />
                  </IconButton>
                </ImagePreviewContainer>
              )}
            </Grid>
            <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
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
                {loading ? "Saving..." : isEditMode ? "Update Service" : "Create Service"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CateringServiceForm;