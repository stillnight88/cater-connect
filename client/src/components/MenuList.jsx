import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Box, Card, CardContent, CardMedia, Container, Grid, Typography, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, Slider, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { styled } from "@mui/system";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import { useParams } from "react-router-dom";


const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
  }
}));

const MenuList = () => {
  const { cateringServiceId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory);
        queryParams.append("minPrice", priceRange[0]);
        queryParams.append("maxPrice", priceRange[1]);
        queryParams.append("cateringServiceId", cateringServiceId); //  Ensure you send the catering service ID

        const { data } = await axios.get(`http://localhost:5000/api/menu-items?${queryParams.toString()}`);
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu items", err);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, priceRange, cateringServiceId]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [menuItems, searchTerm]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "http://localhost:5000/uploads/default-food-image.jpg"; // Default fallback
    }
  
    // Normalize slashes and remove leading/trailing slashes
    const normalizedPath = imagePath
      .replace(/\\/g, "/") // Convert backslashes to forward slashes
      .replace(/^\/+/, "") // Remove leading slashes
      .replace(/\/+$/, ""); // Remove trailing slashes
  
    // Ensure the path is prefixed with the server base URL
    return `http://localhost:5000/${normalizedPath}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search menu items..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <FiSearch size={20} />
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
            <Typography gutterBottom>Price Range (₹)</Typography>
            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <StyledCard onClick={() => handleItemClick(item)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(item.image)}
                  alt={item.name}
                  loading="lazy"
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description || "Delicious menu item"}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" color="primary">
                      ₹{item.price.toFixed(2)}
                    </Typography>
                    <IconButton color="primary" aria-label="add to cart">
                      <FiShoppingCart />
                    </IconButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Stack>

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
              <Typography variant="body1" paragraph>{selectedItem.description || "Delicious menu item prepared with the finest ingredients."}</Typography>
              <Typography variant="h6" color="primary">₹{selectedItem.price.toFixed(2)}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
              <Button variant="contained" startIcon={<FiShoppingCart />}>Add to Cart</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MenuList;