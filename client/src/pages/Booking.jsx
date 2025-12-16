import React, { useState, useEffect } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Slider,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import dayjs from "dayjs";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import { useParams } from "react-router-dom";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const modalStyle = {
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxWidth: 400,
};

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

const Booking = () => {
  // Get catering service ID from URL parameters
  const { cateringServiceId } = useParams();

  // Stage management
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Event Details", "Menu Selection", "Review & Confirm"];

  // Stage 1: Event Details state
  const [eventDate, setEventDate] = useState(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [guestCount, setGuestCount] = useState(50);

  // Stage 2: Menu Selection state
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]); // Adjusted for INR
  const [selectedItems, setSelectedItems] = useState([]);

  // Catering service info
  const [cateringService, setCateringService] = useState(null);

  // Shared state
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Fetch catering service details
  useEffect(() => {
    const fetchCateringServiceDetails = async () => {
      try {
        if (cateringServiceId) {
          const response = await axios.get(
            `http://localhost:5000/api/catering-services/${cateringServiceId}`
          );
          setCateringService(response.data);
        }
      } catch (err) {
        console.error("Error fetching catering service details:", err);
        setErrors((prev) => ({
          ...prev,
          fetch: "Failed to load catering service details",
        }));
      }
    };

    fetchCateringServiceDetails();
  }, [cateringServiceId]);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        if (!cateringServiceId) {
          setErrors((prev) => ({
            ...prev,
            fetch: "No catering service selected",
          }));
          setLoading(false);
          return;
        }

        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All")
          queryParams.append("category", selectedCategory);
        queryParams.append("minPrice", priceRange[0]);
        queryParams.append("maxPrice", priceRange[1]);
        queryParams.append("cateringServiceId", cateringServiceId); // Include catering service ID

        const response = await axios.get(
          `http://localhost:5000/api/menu-items?${queryParams.toString()}`
        );
        setMenuItems(response.data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setErrors((prev) => ({ ...prev, fetch: "Failed to load menu items" }));
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, priceRange, cateringServiceId]);

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const menuItem = menuItems.find((m) => m._id === itemId);
      return total + (menuItem ? menuItem.price * guestCount : 0);
    }, 0);
  };

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!eventDate) newErrors.date = "Please select an event date";
      if (!address.street) newErrors.street = "Street address is required";
      if (!address.city) newErrors.city = "City is required";
    } else if (activeStep === 1) {
      if (selectedItems.length === 0)
        newErrors.menuItems = "Please select at least one menu item";
    }

    if (Object.keys(newErrors).length === 0) {
      setActiveStep((prev) => prev + 1);
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))?.token
        : null;

      if (!token) {
        setErrors((prev) => ({
          ...prev,
          auth: "You must be logged in to make a booking",
        }));
        return;
      }

      // Format the data for API - transform selectedItems to the format expected by backend
      const bookingData = {
        cateringServiceId,
        eventDate:
          eventDate instanceof dayjs
            ? eventDate.toDate().toISOString()
            : eventDate,
        eventLocation: `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}`,
        numberOfGuests: guestCount,
        // Transform the menuItems to match backend expectations
        menuItems: selectedItems.map((itemId) => ({
          item: itemId,
          quantity: guestCount, // Using guest count as quantity for each item
        })),
        specialRequirements: "",
      };

      await axios.post("http://localhost:5000/api/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setOpenModal(true);
    } catch (err) {
      console.error("Error creating booking:", err);
      setErrors((prev) => ({
        ...prev,
        submit: err.response?.data?.message || "Failed to create booking",
      }));
    }
  };

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return `₹${price.toFixed(2)}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "http://localhost:5000/uploads/default-food-image.jpg";
    }

    const normalizedPath = imagePath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

    return `http://localhost:5000/${normalizedPath}`;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {cateringService && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You are booking with: {cateringService.name}
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Event Date and Time"
                  value={eventDate}
                  onChange={setEventDate}
                  minDate={dayjs().add(1, "day")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.date}
                      helperText={errors.date}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={address.street}
                onChange={(e) => handleAddressChange("street", e.target.value)}
                error={!!errors.street}
                helperText={errors.street}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={address.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={address.postalCode}
                onChange={(e) =>
                  handleAddressChange("postalCode", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Number of Guests</Typography>
              <Slider
                value={guestCount}
                onChange={(e, newValue) => setGuestCount(newValue)}
                min={10}
                max={200}
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="textSecondary">
                Selected: {guestCount} guests
              </Typography>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                <TextField
                  placeholder="Search menu items..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <FiSearch size={20} />,
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Veg">Veg</MenuItem>
                    <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ width: 200 }}>
                  <Typography gutterBottom>Price Range</Typography>
                  <Slider
                    value={priceRange}
                    onChange={(e, newValue) => setPriceRange(newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000} // Adjusted for INR
                  />
                </Box>
              </Box>

              {errors.menuItems && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.menuItems}
                </Alert>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Selected Items: {selectedItems.length}
              </Typography>
            </Grid>

            {loading ? (
              <Grid item xs={12}>
                <Typography>Loading menu items...</Typography>
              </Grid>
            ) : filteredMenuItems.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No menu items match your search criteria.
                </Alert>
              </Grid>
            ) : (
              filteredMenuItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="160"
                      image={getImageUrl(item.image)} // Use the function here
                      alt={item.name}
                      loading="lazy"
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" color="primary">
                          {formatPrice(item.price)}
                        </Typography>
                        <Button
                          variant={
                            selectedItems.includes(item._id)
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => handleItemSelect(item._id)}
                          startIcon={<FiShoppingCart />}
                        >
                          {selectedItems.includes(item._id)
                            ? "Selected"
                            : "Select"}
                        </Button>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Order Summary</Typography>
              {cateringService && (
                <Typography>
                  Catering Service: {cateringService.name}
                </Typography>
              )}
              <Typography>
                Event Date:{" "}
                {eventDate
                  ? dayjs(eventDate).format("MMMM D, YYYY h:mm A")
                  : "Not selected"}
              </Typography>
              <Typography>
                Location: {address.street}, {address.city}, {address.state},{" "}
                {address.postalCode}
              </Typography>
              <Typography>Number of Guests: {guestCount}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Selected Items:
              </Typography>
              {loading ? (
                <Typography>Loading menu items...</Typography>
              ) : (
                selectedItems.map((itemId) => {
                  const item = menuItems.find((m) => m._id === itemId);
                  return item ? (
                    <Typography key={itemId}>
                      {item.name} - {formatPrice(item.price * guestCount)}
                    </Typography>
                  ) : null;
                })
              )}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: {formatPrice(calculateTotal())}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Payment will be made offline. The catering service will contact
                you for further payment details.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Catering Event Booking
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {!cateringServiceId && (
        <Alert severity="error" sx={{ mb: 2 }}>
          No catering service selected. Please go back and select a catering
          service.
        </Alert>
      )}

      {errors.fetch && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.fetch}
        </Alert>
      )}

      {errors.auth && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.auth}
        </Alert>
      )}

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      {getStepContent(activeStep)}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!cateringServiceId}
          >
            Confirm Booking
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!cateringServiceId}
          >
            Next
          </Button>
        )}
      </Box>

      <StyledModal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Booking Confirmation
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Your booking request has been sent! The catering service will
            contact you soon for payment and confirmation.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenModal(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </StyledModal>
    </Container>
  );
};

export default Booking;
