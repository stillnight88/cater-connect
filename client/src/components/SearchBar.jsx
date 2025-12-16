import React, { useEffect, useState, useCallback, useMemo, forwardRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FiSearch, FiX } from "react-icons/fi";
import { GiCook } from "react-icons/gi";
import { debounce } from "lodash";

const API_BASE_URL = "http://localhost:5000";

const SearchWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  marginBottom: theme?.spacing?.(3) || "24px",
}));

const FilterButton = styled(ToggleButton)(({ theme, filtertype }) => ({
  margin: theme?.spacing?.(1) || "8px",
  borderRadius: theme?.shape?.borderRadius || "4px",
  "&.Mui-selected": {
    backgroundColor: filtertype === "veg" ? "#4caf50" : "#ff9800",
    color: "#fff",
    "&:hover": {
      backgroundColor: filtertype === "veg" ? "#43a047" : "#f57c00",
    },
  },
}));

const ResultCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme?.shadows?.[4] || "0 4px 6px rgba(0,0,0,0.1)",
  },
}));

const SearchBar = forwardRef((props, ref) => {
  const [cateringServices, setCateringServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("SearchBar rendered, ref:", ref);
    const fetchCateringServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/catering-services`, {
          timeout: 10000,
        });
        console.log("Raw Backend Response:", response.data);

        const sanitizedServices = response.data
          .filter((service) => service.status === "approved")
          .map((service) => {
            console.log(`Service ${service.name} Categories:`, service.categories);
            const hasCategories = service.categories && service.categories.length > 0;
            const isVegetarian = hasCategories ? service.categories.some((cat) => cat.name === "Veg") : false;
            return {
              ...service,
              name: service.name || "",
              description: service.description || "",
              image: service.image ? `${API_BASE_URL}${service.image}` : "",
              isVegetarian,
              hasCategories,
            };
          });
        console.log("Sanitized Services:", sanitizedServices);
        setCateringServices(sanitizedServices);
      } catch (error) {
        console.error("Error fetching catering services:", error);
        setError("Failed to load catering services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCateringServices();
  }, []);

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (event) => {
    handleSearch(event.target.value);
  };

  const handleFilterChange = (event, newFilter) => {
    setFilter(newFilter);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilter(null);
  };

  const filteredResults = useMemo(() => {
    return cateringServices.filter((service) => {
      const name = (service.name || "").toLowerCase();
      const searchLower = (searchQuery || "").toLowerCase();
      const matchesSearch = name.includes(searchLower);
      const matchesFilter =
        !filter || (filter === "veg" ? service.isVegetarian : !service.isVegetarian);
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filter, cateringServices]);

  return (
    <Container ref={ref} maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Find Your Perfect Catering Service
      </Typography>

      <SearchWrapper>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search catering services"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <FiSearch size={20} style={{ marginRight: 8 }} />,
            endAdornment: searchQuery && (
              <IconButton onClick={handleClearSearch} size="small">
                <FiX />
              </IconButton>
            ),
          }}
        />
      </SearchWrapper>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="food type filter"
        >
          <FilterButton filtertype="veg" value="veg">
            <Tooltip title="Vegetarian Options">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <GiCook style={{ marginRight: 8 }} /> Vegetarian
              </Box>
            </Tooltip>
          </FilterButton>
          <FilterButton filtertype="non-veg" value="non-veg">
            <Tooltip title="Non-Vegetarian Options">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <GiCook style={{ marginRight: 8 }} /> Non-Vegetarian
              </Box>
            </Tooltip>
          </FilterButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="h6" align="center" color="error">
          {error}
        </Typography>
      ) : filteredResults.length === 0 ? (
        <Typography variant="h6" align="center" color="textSecondary">
          No catering services found. Try different search criteria.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredResults.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
              <ResultCard>
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${service.image || "/placeholder-image.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Link
                      to={`/catering/${service._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {service.name || "Unnamed Service"}
                    </Link>
                  </Typography>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: service.hasCategories
                        ? service.isVegetarian
                          ? "#4caf50"
                          : "#ff9800"
                        : "#757575",
                      color: "white",
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    {service.hasCategories
                      ? service.isVegetarian
                        ? "Vegetarian"
                        : "Non-Vegetarian"
                      : "Unknown"}
                  </Box>
                  <Typography variant="body2">
                    {service.description || "No description available"}
                  </Typography>
                </CardContent>
              </ResultCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;