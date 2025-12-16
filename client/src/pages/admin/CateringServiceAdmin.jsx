import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  CardMedia,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Stack,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Store as StoreIcon,
  PersonOutline as ManagerIcon,
  TrendingUp as TrendingIcon
} from "@mui/icons-material";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/catering-services";

const CateringServiceAdmin = () => {
  const [cateringServices, setCateringServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchCateringServices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        const response = await axios.get(`${BASE_URL}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setCateringServices(response.data);
        setFilteredServices(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching catering services:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError("Failed to load catering services. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchCateringServices();
  }, [isAuthenticated]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      const response = await axios.put(
        `${BASE_URL}/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const updatedServices = cateringServices.map((service) =>
        service._id === id ? response.data : service
      );
      
      setCateringServices(updatedServices);
      applyFilters(updatedServices, statusFilter, searchQuery);
    } catch (error) {
      console.error("Error updating status:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const applyFilters = (services, status, query) => {
    let filtered = [...services];
    
    if (status !== "all") {
      filtered = filtered.filter((service) => service.status === status);
    }
    
    if (query) {
      filtered = filtered.filter((service) =>
        (service.name.toLowerCase().includes(query.toLowerCase()) ||
          (service.manager?.name || "").toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    setFilteredServices(filtered);
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    applyFilters(cateringServices, newStatus, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(cateringServices, statusFilter, query);
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

  const getCountByStatus = (status) => {
    return cateringServices.filter(service => 
      status === "all" ? true : service.status === status
    ).length;
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        p: 5, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
        bgcolor: alpha(theme.palette.primary.light, 0.05),
        borderRadius: 2
      }}>
        <StoreIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2, opacity: 0.8 }} />
        <Typography variant="h5" fontWeight="500" gutterBottom>
          Admin Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          Please log in as an administrator to manage catering services and applications.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      px: { xs: 2, sm: 3, md: 4 },
      py: 4,
      maxWidth: '100%',
      bgcolor: theme.palette.background.default
    }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <StoreIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight="600">
            Catering Services Management
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          View and approve pending catering service applications
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Badge
                badgeContent={getCountByStatus("all")}
                color="primary"
                sx={{ mr: 2 }}
              >
                <FilterIcon />
              </Badge>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Services
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {getCountByStatus("all")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              <Badge
                badgeContent={getCountByStatus("pending")}
                color="warning"
                sx={{ mr: 2 }}
              >
                <TrendingIcon />
              </Badge>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pending Approval
                </Typography>
                <Typography variant="h6" fontWeight="medium" color="warning.main">
                  {getCountByStatus("pending")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Badge
                badgeContent={getCountByStatus("approved")}
                color="success"
                sx={{ mr: 2 }}
              >
                <ApproveIcon />
              </Badge>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Approved Services
                </Typography>
                <Typography variant="h6" fontWeight="medium" color="success.main">
                  {getCountByStatus("approved")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
              }}
            >
              <Badge
                badgeContent={getCountByStatus("rejected")}
                color="error"
                sx={{ mr: 2 }}
              >
                <RejectIcon />
              </Badge>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Rejected Applications
                </Typography>
                <Typography variant="h6" fontWeight="medium" color="error.main">
                  {getCountByStatus("rejected")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: "flex", 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            bgcolor: theme.palette.background.paper
          }}
        >
          <FormControl 
            sx={{ 
              minWidth: 200,
              flex: { xs: '1', sm: '0 0 200px' }
            }}
          >
            <InputLabel>Filter by Status</InputLabel>
            <Select 
              value={statusFilter} 
              onChange={handleStatusFilterChange} 
              label="Filter by Status"
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Show All Services</MenuItem>
              <MenuItem value="pending">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small" 
                    label={getCountByStatus("pending")} 
                    color="warning" 
                    sx={{ mr: 1, height: 20, minWidth: 28 }} 
                  />
                  Pending Approval
                </Box>
              </MenuItem>
              <MenuItem value="approved">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small" 
                    label={getCountByStatus("approved")} 
                    color="success" 
                    sx={{ mr: 1, height: 20, minWidth: 28 }} 
                  />
                  Approved
                </Box>
              </MenuItem>
              <MenuItem value="rejected">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    size="small" 
                    label={getCountByStatus("rejected")} 
                    color="error" 
                    sx={{ mr: 1, height: 20, minWidth: 28 }} 
                  />
                  Rejected
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Search services"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            placeholder="Search by service name or manager..."
          />
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.error.light, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : filteredServices.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.info.light, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}
        >
          <StoreIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No services found</Typography>
          <Typography variant="body2" color="text.secondary">
            No catering services match your current filters. Try adjusting your search criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={service.image 
                      ? `http://localhost:5000${service.image}`
                      : "https://via.placeholder.com/300x160?text=No+Image"
                    }
                    alt={service.name}
                    sx={{ 
                      objectFit: "cover",
                      borderBottom: `4px solid ${theme.palette[getStatusColor(service.status)].main}`
                    }}
                  />
                  <Chip
                    label={service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    color={getStatusColor(service.status)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontWeight: 'bold',
                      px: 1
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 1,
                    }}
                  >
                    {service.name}
                  </Typography>
                  
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ManagerIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {service.manager?.name || "Unknown Manager"}
                      </Typography>
                    </Box>
                    
                    {service.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StoreIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {service.location}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
                  {service.status === "pending" ? (
                    <>
                      <Tooltip title="Approve application">
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleStatusUpdate(service._id, "approved")}
                          sx={{ 
                            fontWeight: 'medium',
                            textTransform: 'none',
                            flex: 1,
                            mr: 1
                          }}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Reject application">
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<RejectIcon />}
                          onClick={() => handleStatusUpdate(service._id, "rejected")}
                          sx={{ 
                            fontWeight: 'medium',
                            textTransform: 'none',
                            flex: 1,
                            ml: 1
                          }}
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Chip 
                        size="small" 
                        icon={service.status === "approved" ? <ApproveIcon /> : <RejectIcon />}
                        label={service.status === "approved" ? "Approved" : "Rejected"}
                        color={getStatusColor(service.status)}
                        variant="outlined"
                      />
                      
                      <Tooltip title="View service details">
                        <Button
                          size="small"
                          color="primary"
                          variant="text"
                          endIcon={<ViewIcon />}
                          sx={{ 
                            fontWeight: 'medium',
                            textTransform: 'none'
                          }}
                        >
                          View Details
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CateringServiceAdmin;